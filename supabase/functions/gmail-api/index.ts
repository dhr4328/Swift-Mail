import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-google-token',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(timestamp: string): string {
  const date = new Date(parseInt(timestamp));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function categorizeEmail(from: string, subject: string, labels: string[]): string {
  const lowerFrom = from.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  // Check labels first
  if (labels.includes('CATEGORY_PROMOTIONS')) return 'Promotions';
  if (labels.includes('CATEGORY_SOCIAL')) return 'Social';
  if (labels.includes('CATEGORY_UPDATES')) return 'Updates';
  if (labels.includes('CATEGORY_FORUMS')) return 'Forums';
  if (labels.includes('CATEGORY_PERSONAL')) return 'Personal';

  // Domain-based categorization
  if (lowerFrom.includes('newsletter') || lowerFrom.includes('substack') || lowerFrom.includes('medium')) return 'Newsletters';
  if (lowerFrom.includes('linkedin') || lowerFrom.includes('facebook') || lowerFrom.includes('twitter') || lowerFrom.includes('instagram')) return 'Social';
  if (lowerFrom.includes('amazon') || lowerFrom.includes('ebay') || lowerFrom.includes('shop') || lowerFrom.includes('store')) return 'Promotions';
  if (lowerFrom.includes('bank') || lowerFrom.includes('chase') || lowerFrom.includes('paypal') || lowerFrom.includes('venmo')) return 'Finance';
  if (lowerFrom.includes('noreply') || lowerFrom.includes('no-reply')) return 'Notifications';

  // Subject-based categorization
  if (lowerSubject.includes('order') || lowerSubject.includes('shipping') || lowerSubject.includes('delivery')) return 'Promotions';
  if (lowerSubject.includes('invoice') || lowerSubject.includes('payment') || lowerSubject.includes('statement')) return 'Finance';
  if (lowerSubject.includes('meeting') || lowerSubject.includes('agenda') || lowerSubject.includes('project')) return 'Work';

  return 'Personal';
}

function parseEmail(message: GmailMessage): EmailData {
  const headers = message.payload?.headers || [];
  const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const from = getHeader('From');
  const subject = getHeader('Subject') || '(No Subject)';
  const labelIds = message.labelIds || [];

  // Parse sender name and email
  const fromMatch = from.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]*)>?$/);
  const senderName = fromMatch?.[1]?.trim() || fromMatch?.[2]?.split('@')[0] || 'Unknown';
  const senderEmail = fromMatch?.[2] || from;

  return {
    id: message.id,
    sender: senderName,
    senderEmail: senderEmail,
    subject: subject,
    preview: message.snippet || '',
    date: formatDate(message.internalDate || Date.now().toString()),
    category: categorizeEmail(from, subject, labelIds),
    size: formatBytes(message.sizeEstimate || 0),
    hasAttachment: labelIds.includes('ATTACHMENT') || (message.payload?.parts?.length || 0) > 1,
    isStarred: labelIds.includes('STARRED'),
    isRead: !labelIds.includes('UNREAD'),
  };
}

interface FetchEmailsResult {
  emails: EmailData[];
  nextPageToken?: string;
}

async function fetchEmails(accessToken: string, maxResults: number = 50, pageToken?: string, q?: string): Promise<FetchEmailsResult> {
  // Build URL with optional pageToken for pagination
  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
  if (pageToken) {
    url += `&pageToken=${encodeURIComponent(pageToken)}`;
  }
  if (q) {
    url += `&q=${encodeURIComponent(q)}`;
  }

  const listResponse = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listResponse.ok) {
    const error = await listResponse.text();
    throw new Error(`Failed to fetch emails: ${error}`);
  }

  const listData = await listResponse.json();
  const messages = listData.messages || [];
  const nextPageToken = listData.nextPageToken;

  // Fetch full message details in parallel (batch of 10)
  const emails: EmailData[] = [];
  const batchSize = 10;

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const batchPromises = batch.map(async (msg: { id: string }) => {
      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (msgResponse.ok) {
        const msgData = await msgResponse.json();
        return parseEmail(msgData);
      }
      return null;
    });

    const batchResults = await Promise.all(batchPromises);
    emails.push(...batchResults.filter((e): e is EmailData => e !== null));
  }

  return { emails, nextPageToken };
}

async function trashEmails(accessToken: string, emailIds: string[]): Promise<{ success: boolean; trashedCount: number }> {
  const results = await Promise.all(
    emailIds.map(async (id) => {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.ok;
    })
  );

  const trashedCount = results.filter(Boolean).length;
  return { success: trashedCount === emailIds.length, trashedCount };
}

async function archiveEmails(accessToken: string, emailIds: string[]): Promise<{ success: boolean; archivedCount: number }> {
  const results = await Promise.all(
    emailIds.map(async (id) => {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ removeLabelIds: ['INBOX'] }),
        }
      );
      return response.ok;
    })
  );

  const archivedCount = results.filter(Boolean).length;
  return { success: archivedCount === emailIds.length, archivedCount };
}

async function markAsRead(accessToken: string, emailIds: string[]): Promise<{ success: boolean; markedCount: number }> {
  const results = await Promise.all(
    emailIds.map(async (id) => {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
        }
      );
      return response.ok;
    })
  );

  const markedCount = results.filter(Boolean).length;
  return { success: markedCount === emailIds.length, markedCount };
}

async function getStats(accessToken: string): Promise<{
  totalEmails: number;
  unread: number;
  categories: {
    promotions: number;
    social: number;
    updates: number;
    forums: number;
    personal: number;
  };
  storageUsed?: string;
}> {
  // Get profile for total counts
  const profileResponse = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/profile',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let totalEmails = 0;
  if (profileResponse.ok) {
    const profile = await profileResponse.json();
    totalEmails = profile.messagesTotal || 0;
  }

  // Helper to get count for a label
  const getLabelCount = async (labelId: string): Promise<number> => {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=${labelId}&maxResults=1`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data.resultSizeEstimate || 0;
    }
    return 0;
  };

  const [unread, promotions, social, updates, forums] = await Promise.all([
    getLabelCount('UNREAD'),
    getLabelCount('CATEGORY_PROMOTIONS'),
    getLabelCount('CATEGORY_SOCIAL'),
    getLabelCount('CATEGORY_UPDATES'),
    getLabelCount('CATEGORY_FORUMS'),
  ]);

  // Personal is usually what's left, or we can approximate it. 
  // Since we can't easily query "Excluding all other categories", we'll infer it or just leave it for now.
  // A simple approximation for Personal is Total - (Promotions + Social + Updates + Forums).
  // Note: resultSizeEstimate is an estimate, so this might be negative effectively, so we clamp it.
  const personal = Math.max(0, totalEmails - (promotions + social + updates + forums));

  return {
    totalEmails,
    unread,
    categories: {
      promotions,
      social,
      updates,
      forums,
      personal
    }
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseToken = authHeader.replace('Bearer ', '');

    // Create Supabase client to get user session
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user's session to extract the provider token (Google access token)
    const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseToken);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the Google access token from the custom header
    const googleAccessToken = req.headers.get('x-google-token');

    if (!googleAccessToken) {
      return new Response(
        JSON.stringify({ error: 'No Google access token provided. Please sign in again.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Token is already retrieved above
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    let result;

    switch (action) {
      case 'list': {
        const maxResults = parseInt(url.searchParams.get('maxResults') || '50');
        const pageToken = url.searchParams.get('pageToken') || undefined;
        const q = url.searchParams.get('q') || undefined;
        result = await fetchEmails(googleAccessToken, maxResults, pageToken, q);
        break;
      }
      case 'trash': {
        const body = await req.json();
        const emailIds = body.emailIds as string[];
        if (!emailIds || !Array.isArray(emailIds)) {
          return new Response(
            JSON.stringify({ error: 'emailIds array required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await trashEmails(googleAccessToken, emailIds);
        break;
      }
      case 'archive': {
        const body = await req.json();
        const emailIds = body.emailIds as string[];
        if (!emailIds || !Array.isArray(emailIds)) {
          return new Response(
            JSON.stringify({ error: 'emailIds array required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await archiveEmails(googleAccessToken, emailIds);
        break;
      }
      case 'markRead': {
        const body = await req.json();
        const emailIds = body.emailIds as string[];
        if (!emailIds || !Array.isArray(emailIds)) {
          return new Response(
            JSON.stringify({ error: 'emailIds array required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await markAsRead(googleAccessToken, emailIds);
        break;
      }
      case 'stats': {
        result = await getStats(googleAccessToken);
        break;
      }
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Gmail API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
