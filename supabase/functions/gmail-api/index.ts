// ============================================================
// Gmail API – Supabase Edge Function
// ============================================================
// Actions:
//   list       – paginated full email list (for display)
//   fetchIds   – lightweight metadata-only ID collection (for bulk ops)
//   trash      – trash a small set of individual emails
//   batchDelete– bulk-delete up to 1 000 IDs per call via Gmail batchDelete API
//   trashAll   – server-side fetch-all-IDs + trash (legacy, kept for compat)
//   archive    – batchModify remove INBOX label
//   markRead   – batchModify remove UNREAD label
//   stats      – inbox statistics
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2";

// ── CORS ─────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, " +
    "x-supabase-client-platform, x-supabase-client-platform-version, " +
    "x-supabase-client-runtime, x-supabase-client-runtime-version, x-google-token",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

// ── Types ─────────────────────────────────────────────────────
interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
    parts?: Array<{ body?: { size?: number } }>;
    body?: { size?: number };
  };
  sizeEstimate?: number;
  internalDate?: string;
}

interface EmailData {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  date: string;
  category: string;
  size: string;
  hasAttachment: boolean;
  isStarred: boolean;
  isRead: boolean;
}

/** Lightweight record returned by fetchIds – no full parse needed */
interface EmailMeta {
  id: string;
  subject: string;
  sender: string;
  timestamp: string; // ISO date string
}

// ── Helpers ───────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(timestamp: string): string {
  const date = new Date(parseInt(timestamp));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function categorizeEmail(from: string, subject: string, labels: string[]): string {
  const lowerFrom = from.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  if (labels.includes("CATEGORY_PROMOTIONS")) return "Promotions";
  if (labels.includes("CATEGORY_SOCIAL")) return "Social";
  if (labels.includes("CATEGORY_UPDATES")) return "Updates";
  if (labels.includes("CATEGORY_FORUMS")) return "Forums";
  if (labels.includes("CATEGORY_PERSONAL")) return "Personal";

  if (lowerFrom.includes("newsletter") || lowerFrom.includes("substack") || lowerFrom.includes("medium"))
    return "Newsletters";
  if (lowerFrom.includes("linkedin") || lowerFrom.includes("facebook") || lowerFrom.includes("twitter") || lowerFrom.includes("instagram"))
    return "Social";
  if (lowerFrom.includes("amazon") || lowerFrom.includes("ebay") || lowerFrom.includes("shop") || lowerFrom.includes("store"))
    return "Promotions";
  if (lowerFrom.includes("bank") || lowerFrom.includes("chase") || lowerFrom.includes("paypal") || lowerFrom.includes("venmo"))
    return "Finance";
  if (lowerFrom.includes("noreply") || lowerFrom.includes("no-reply"))
    return "Notifications";

  if (lowerSubject.includes("order") || lowerSubject.includes("shipping") || lowerSubject.includes("delivery"))
    return "Promotions";
  if (lowerSubject.includes("invoice") || lowerSubject.includes("payment") || lowerSubject.includes("statement"))
    return "Finance";
  if (lowerSubject.includes("meeting") || lowerSubject.includes("agenda") || lowerSubject.includes("project"))
    return "Work";

  return "Personal";
}

function parseEmail(message: GmailMessage): EmailData {
  const headers = message.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

  const from = getHeader("From");
  const subject = getHeader("Subject") || "(No Subject)";
  const labelIds = message.labelIds || [];

  const fromMatch = from.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]*)>?$/);
  const senderName = fromMatch?.[1]?.trim() || fromMatch?.[2]?.split("@")[0] || "Unknown";
  const senderEmail = fromMatch?.[2] || from;

  return {
    id: message.id,
    sender: senderName,
    senderEmail,
    subject,
    preview: message.snippet || "",
    date: formatDate(message.internalDate || Date.now().toString()),
    category: categorizeEmail(from, subject, labelIds),
    size: formatBytes(message.sizeEstimate || 0),
    hasAttachment: labelIds.includes("ATTACHMENT") || (message.payload?.parts?.length || 0) > 1,
    isStarred: labelIds.includes("STARRED"),
    isRead: !labelIds.includes("UNREAD"),
  };
}

// ── sleep helper for rate-limit back-off ──────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Rate-limit-aware fetch with exponential back-off ──────────
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 4,
  baseDelayMs = 500
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);
    if (res.status === 429 || res.status === 503) {
      // Rate-limited – back off exponentially
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.warn(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1})`);
      await sleep(delay);
      lastError = new Error(`Rate limited: ${res.status}`);
      continue;
    }
    return res;
  }
  throw lastError ?? new Error("Max retries exceeded");
}

// ── Gmail API helpers ─────────────────────────────────────────

/**
 * fetchEmails – returns full EmailData objects for display in the UI.
 * Fetches one page of message IDs, then retrieves metadata in parallel batches.
 */
async function fetchEmails(
  accessToken: string,
  maxResults = 50,
  pageToken?: string,
  q?: string
): Promise<{ emails: EmailData[]; nextPageToken?: string }> {
  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
  if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
  if (q) url += `&q=${encodeURIComponent(q)}`;

  const listResponse = await fetchWithRetry(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listResponse.ok) {
    const error = await listResponse.text();
    throw new Error(`Failed to fetch emails: ${error}`);
  }

  const listData = await listResponse.json();
  const messages: { id: string }[] = listData.messages || [];
  const nextPageToken: string | undefined = listData.nextPageToken;

  // Fetch metadata in parallel batches of 10 to stay within rate limits
  const emails: EmailData[] = [];
  const PARALLEL = 10;

  for (let i = 0; i < messages.length; i += PARALLEL) {
    const batch = messages.slice(i, i + PARALLEL);
    const results = await Promise.allSettled(
      batch.map(async ({ id }) => {
        const res = await fetchWithRetry(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}` +
            `?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) return null;
        return parseEmail(await res.json());
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) emails.push(r.value);
    }
  }

  return { emails, nextPageToken };
}

/**
 * fetchIds – LIGHTWEIGHT bulk operation helper.
 *
 * Paginates through ALL messages matching `q`, collecting ONLY:
 *   id | subject | sender | timestamp
 *
 * No full message bodies loaded. Returns a flat list of EmailMeta
 * suitable for bulk delete / archive without rendering in the DOM.
 *
 * The caller should invoke this once per filter change and keep the
 * ID list in memory (not in React state) for bulk operations.
 */
async function fetchIds(
  accessToken: string,
  q?: string
): Promise<{ ids: EmailMeta[]; total: number }> {
  const allIds: EmailMeta[] = [];
  let pageToken: string | undefined;

  // Paginate using maxResults=500 (Gmail API maximum) for speed
  do {
    let url =
      `https://gmail.googleapis.com/gmail/v1/users/me/messages` +
      `?maxResults=500&fields=messages(id),nextPageToken`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;

    const res = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`fetchIds list failed: ${err}`);
    }

    const data = await res.json();
    const messages: { id: string }[] = data.messages || [];

    // We only requested `id` via `fields`, so we only get that.
    // Push lightweight stubs – full metadata (subject/sender) omitted
    // intentionally to keep memory usage low for large mailboxes.
    for (const m of messages) {
      allIds.push({ id: m.id, subject: "", sender: "", timestamp: "" });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return { ids: allIds, total: allIds.length };
}

/**
 * batchDelete – Bulk-deletes up to 1 000 message IDs using
 * Gmail's `users.messages.batchDelete` API (permanent delete, not trash).
 *
 * Per Google's docs, batchDelete accepts up to 1 000 IDs per request.
 * We chunk the input and process with limited concurrency + retry.
 */
async function batchDelete(
  accessToken: string,
  ids: string[]
): Promise<{ deletedCount: number; failedCount: number; errors: string[] }> {
  if (ids.length === 0) return { deletedCount: 0, failedCount: 0, errors: [] };

  const CHUNK_SIZE = 1000; // Gmail batchDelete maximum
  const MAX_CONCURRENT = 3; // limit parallel requests
  const errors: string[] = [];
  let deletedCount = 0;

  // Split into chunks of 1 000
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    chunks.push(ids.slice(i, i + CHUNK_SIZE));
  }

  // Process chunks with limited concurrency
  for (let i = 0; i < chunks.length; i += MAX_CONCURRENT) {
    const window = chunks.slice(i, i + MAX_CONCURRENT);

    const results = await Promise.allSettled(
      window.map(async (chunk) => {
        const res = await fetchWithRetry(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/batchDelete`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: chunk }),
          },
          4, // retries
          800 // base delay ms – batchDelete is more rate-limit sensitive
        );

        if (!res.ok && res.status !== 204) {
          const err = await res.text();
          throw new Error(`batchDelete chunk failed (${res.status}): ${err}`);
        }
        return chunk.length;
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        deletedCount += r.value;
      } else {
        const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
        errors.push(msg);
      }
    }
  }

  return { deletedCount, failedCount: errors.length, errors };
}

/**
 * trashEmails – moves a small explicit list of emails to Trash.
 * Used for selected-email operations (not bulk).
 */
async function trashEmails(
  accessToken: string,
  emailIds: string[]
): Promise<{ success: boolean; trashedCount: number }> {
  let trashedCount = 0;
  const errors: string[] = [];
  const PARALLEL = 10;

  for (let i = 0; i < emailIds.length; i += PARALLEL) {
    const batch = emailIds.slice(i, i + PARALLEL);
    const results = await Promise.allSettled(
      batch.map(async (id) => {
        const res = await fetchWithRetry(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Failed to trash ${id}: ${err}`);
        }
        return id;
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") trashedCount++;
      else errors.push(r.reason?.message ?? "Unknown error");
    }
  }

  if (errors.length) console.error("Some emails failed to trash:", errors);
  return { success: errors.length === 0, trashedCount };
}

/**
 * trashAllByQuery – legacy server-side bulk operation.
 * Kept for backwards compatibility. Prefer fetchIds + batchDelete for
 * large mailboxes since that gives the frontend progress feedback.
 */
async function trashAllByQuery(
  accessToken: string,
  q: string
): Promise<{ success: boolean; trashedCount: number; totalFound: number }> {
  // Phase 1: Collect all IDs
  const { ids, total: totalFound } = await fetchIds(accessToken, q);

  if (totalFound === 0) return { success: true, trashedCount: 0, totalFound: 0 };

  // Phase 2: Bulk delete
  const allIds = ids.map((m) => m.id);
  const { deletedCount, errors } = await batchDelete(accessToken, allIds);

  return { success: errors.length === 0, trashedCount: deletedCount, totalFound };
}

async function archiveEmails(
  accessToken: string,
  emailIds: string[]
): Promise<{ success: boolean; archivedCount: number }> {
  const res = await fetchWithRetry(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: emailIds, removeLabelIds: ["INBOX"] }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Batch archive error:", err);
    return { success: false, archivedCount: 0 };
  }

  return { success: true, archivedCount: emailIds.length };
}

async function markAsRead(
  accessToken: string,
  emailIds: string[]
): Promise<{ success: boolean; markedCount: number }> {
  const res = await fetchWithRetry(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: emailIds, removeLabelIds: ["UNREAD"] }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Batch markRead error:", err);
    return { success: false, markedCount: 0 };
  }

  return { success: true, markedCount: emailIds.length };
}

async function getStats(accessToken: string): Promise<{
  totalEmails: number;
  unread: number;
  attachments: number;
  categories: {
    promotions: number;
    social: number;
    updates: number;
    forums: number;
    personal: number;
  };
  storageUsed?: string;
}> {
  const profileRes = await fetchWithRetry(
    "https://gmail.googleapis.com/gmail/v1/users/me/profile",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  let totalEmails = 0;
  if (profileRes.ok) {
    const profile = await profileRes.json();
    totalEmails = profile.messagesTotal || 0;
  }

  const getLabelInfo = async (labelId: string) => {
    const res = await fetchWithRetry(
      `https://gmail.googleapis.com/gmail/v1/users/me/labels/${labelId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (res.ok) {
      const data = await res.json();
      return { total: data.messagesTotal || 0, unread: data.messagesUnread || 0 };
    }
    return { total: 0, unread: 0 };
  };

  const getAttachmentCount = async () => {
    const res = await fetchWithRetry(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=has%3Aattachment&maxResults=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (res.ok) {
      const data = await res.json();
      return data.resultSizeEstimate || 0;
    }
    return 0;
  };

  const [
    inboxLabel,
    promotionsLabel,
    socialLabel,
    updatesLabel,
    forumsLabel,
    _personalLabel,
    attachments,
  ] = await Promise.all([
    getLabelInfo("INBOX"),
    getLabelInfo("CATEGORY_PROMOTIONS"),
    getLabelInfo("CATEGORY_SOCIAL"),
    getLabelInfo("CATEGORY_UPDATES"),
    getLabelInfo("CATEGORY_FORUMS"),
    getLabelInfo("CATEGORY_PERSONAL"),
    getAttachmentCount(),
  ]);

  return {
    totalEmails,
    unread: inboxLabel.unread,
    attachments,
    categories: {
      promotions: promotionsLabel.total,
      social: socialLabel.total,
      updates: updatesLabel.total,
      forums: forumsLabel.total,
      personal: _personalLabel.total,
    },
  };
}

// ── Main handler ──────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseToken = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseToken);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const googleAccessToken = req.headers.get("x-google-token");
    if (!googleAccessToken) {
      return new Response(
        JSON.stringify({ error: "No Google access token provided. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";
    let result: unknown;

    switch (action) {
      // ── Display list (paginated, full metadata) ──────────────
      case "list": {
        const maxResults = parseInt(url.searchParams.get("maxResults") || "50");
        const pageToken = url.searchParams.get("pageToken") ?? undefined;
        const q = url.searchParams.get("q") ?? undefined;
        result = await fetchEmails(googleAccessToken, maxResults, pageToken, q);
        break;
      }

      // ── Lightweight ID collector for bulk ops ────────────────
      case "fetchIds": {
        const q = url.searchParams.get("q") ?? undefined;
        result = await fetchIds(googleAccessToken, q);
        break;
      }

      // ── Bulk permanent delete (up to 1 000 IDs per chunk) ────
      case "batchDelete": {
        const body = await req.json() as { ids: string[] };
        if (!Array.isArray(body.ids) || body.ids.length === 0) {
          return new Response(
            JSON.stringify({ error: "ids array required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await batchDelete(googleAccessToken, body.ids);
        break;
      }

      // ── Trash selected emails (small set) ───────────────────
      case "trash": {
        const body = await req.json() as { emailIds: string[] };
        if (!Array.isArray(body.emailIds)) {
          return new Response(
            JSON.stringify({ error: "emailIds array required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await trashEmails(googleAccessToken, body.emailIds);
        break;
      }

      // ── Legacy: server-side collect + trash all ──────────────
      case "trashAll": {
        const body = await req.json() as { q: string };
        if (!body.q || typeof body.q !== "string") {
          return new Response(
            JSON.stringify({ error: "q (query string) is required for trashAll" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await trashAllByQuery(googleAccessToken, body.q);
        break;
      }

      case "archive": {
        const body = await req.json() as { emailIds: string[] };
        if (!Array.isArray(body.emailIds)) {
          return new Response(
            JSON.stringify({ error: "emailIds array required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await archiveEmails(googleAccessToken, body.emailIds);
        break;
      }

      case "markRead": {
        const body = await req.json() as { emailIds: string[] };
        if (!Array.isArray(body.emailIds)) {
          return new Response(
            JSON.stringify({ error: "emailIds array required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await markAsRead(googleAccessToken, body.emailIds);
        break;
      }

      case "stats": {
        result = await getStats(googleAccessToken);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Invalid action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Gmail API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
