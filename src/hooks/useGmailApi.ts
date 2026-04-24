import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export interface Email {
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

export interface GmailStats {
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
}

interface FetchEmailsResponse {
  emails: Email[];
  nextPageToken?: string;
}

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-api`;


export const useGmailApi = () => {
  const { toast } = useToast();
  const [emails, setEmails] = useState<Email[]>([]);
  const [stats, setStats] = useState<GmailStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const nextPageTokenRef = useRef<string | null>(null);

  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/"; // Simple redirect for now
      throw new Error("Not authenticated");
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      "x-google-token": session.provider_token || "",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    };
  }, []);

  const fetchEmails = useCallback(async (maxResults: number = 50, reset: boolean = true, query?: string) => {
    if (reset) {
      setLoading(true);
      nextPageTokenRef.current = null;
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const headers = await getAuthHeaders();
      let url = `${FUNCTION_URL}?action=list&maxResults=${maxResults}`;

      if (!reset && nextPageTokenRef.current) {
        url += `&pageToken=${encodeURIComponent(nextPageTokenRef.current)}`;
      }

      if (query) {
        url += `&q=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url, { headers });

      if (response.status === 401) {
        window.location.href = "/";
        throw new Error("Unauthorized - Please login again");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch emails");
      }

      const data: FetchEmailsResponse = await response.json();

      nextPageTokenRef.current = data.nextPageToken || null;
      setHasMore(!!data.nextPageToken);

      if (reset) {
        setEmails(data.emails);
      } else {
        setEmails((prev) => [...prev, ...data.emails]);
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch emails";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMoreEmails = useCallback(async (query?: string) => {
    if (!hasMore || loadingMore || loading) return;
    return fetchEmails(50, false, query);
  }, [fetchEmails, hasMore, loadingMore, loading]);

  const loadAllEmails = useCallback(async (query?: string) => {
    if (loading || loadingMore) return;

    setLoadingMore(true);
    let currentPageToken = nextPageTokenRef.current;

    try {
      while (currentPageToken) {
        // We use fetch directly here to avoid state updates between every single batch which causes re-renders
        // However, we want to update the list progressively if possible, or just once at the end.
        // For better UX, let's just reuse fetchEmails but we need to manage the recursive call carefully.
        // Easiest is to just call fetchEmails in a loop, but wait for each to finish.

        // Actually, re-using fetchEmails is safer as it handles state, but we need to await it.
        // The issue is fetchEmails state updates are async. 
        // Let's implement a loop here that manually calls the API and updates state at intervals or end.

        const headers = await getAuthHeaders();
        let url = `${FUNCTION_URL}?action=list&maxResults=50`; // Keep strict 50 per batch to be safe
        if (currentPageToken) {
          url += `&pageToken=${encodeURIComponent(currentPageToken)}`;
        }
        if (query) {
          url += `&q=${encodeURIComponent(query)}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error("Failed to fetch page");

        const data: FetchEmailsResponse = await response.json();

        // Update state progressively
        setEmails(prev => [...prev, ...data.emails]);

        currentPageToken = data.nextPageToken || null;
        nextPageTokenRef.current = currentPageToken;
        setHasMore(!!currentPageToken);

        // Small delay to prevent freezing UI completely (though async)
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (err) {
      console.error("Error loading all emails:", err);
      // Don't throw, just stop loading
      toast({
        title: "Partial Load",
        description: "Stopped loading emails due to an error.",
        variant: "destructive"
      });
    } finally {
      setLoadingMore(false);
    }
  }, [getAuthHeaders]); // dependency on getAuthHeaders (we need to export it or include it in dependency) -> getAuthHeaders is inside hook, so it's fine. Wait, getAuthHeaders is defined inside.


  const fetchStats = useCallback(async () => {
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTION_URL}?action=stats`, { headers });

      if (response.status === 401) {
        window.location.href = "/";
        throw new Error("Unauthorized - Please login again");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch stats";
      setError(message);
      throw err;
    }
  }, []);

  const trashEmails = useCallback(async (emailIds: string[]) => {
    setError(null);
    try {
      const headers = await getAuthHeaders();

      // OPTIMIZATION: Process in parallel chunks (Threading) to ensure all emails are processed
      // and to speed up the operation.
      const BATCH_SIZE = 50;
      const chunks = [];
      for (let i = 0; i < emailIds.length; i += BATCH_SIZE) {
        chunks.push(emailIds.slice(i, i + BATCH_SIZE));
      }

      await Promise.all(chunks.map(async (chunk) => {
        const response = await fetch(`${FUNCTION_URL}?action=trash`, {
          method: "POST",
          headers,
          body: JSON.stringify({ emailIds: chunk }),
        });

        if (response.status === 401) {
          // We can't catch all auth errors in parallel easily without redirecting multiple times
          // but handle basic check
          // window.location.href = "/"; // Avoid redirect loop
          throw new Error("Unauthorized");
        }

        if (!response.ok) {
          // Log error but try to continue or throw?
          // If one batch fails, we should probably throw to let user know not all succeeded
          // but for now let's just log and continue best effort?
          // No, user wants ALL deleted. Throwing stops the optimistic update.
          console.error("Batch failed");
          throw new Error("Batch failed");
        }
      }));

      // If we get here, all chunks (that didn't throw) are done.
      // Optimistically update UI
      setEmails((prev) => prev.filter((email) => !emailIds.includes(email.id)));
      return { success: true, trashedCount: emailIds.length };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to trash emails";
      setError(message);
      // Even on error, fetch fresh list to sync state
      // fetchEmails(50, true).catch(console.error); 
      throw err;
    }
  }, [getAuthHeaders]);

  const archiveEmails = useCallback(async (emailIds: string[]) => {
    setError(null);
    try {
      const headers = await getAuthHeaders();

      const BATCH_SIZE = 50;
      const chunks = [];
      for (let i = 0; i < emailIds.length; i += BATCH_SIZE) {
        chunks.push(emailIds.slice(i, i + BATCH_SIZE));
      }

      await Promise.all(chunks.map(async (chunk) => {
        const response = await fetch(`${FUNCTION_URL}?action=archive`, {
          method: "POST",
          headers,
          body: JSON.stringify({ emailIds: chunk }),
        });

        if (response.status === 401) throw new Error("Unauthorized");
        if (!response.ok) throw new Error("Batch failed");
      }));

      setEmails((prev) => prev.filter((email) => !emailIds.includes(email.id)));
      return { success: true, archivedCount: emailIds.length };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to archive emails";
      setError(message);
      throw err;
    }
  }, [getAuthHeaders]);

  const markAsRead = useCallback(async (emailIds: string[]) => {
    setError(null);
    try {
      const headers = await getAuthHeaders();

      const BATCH_SIZE = 50;
      const chunks = [];
      for (let i = 0; i < emailIds.length; i += BATCH_SIZE) {
        chunks.push(emailIds.slice(i, i + BATCH_SIZE));
      }

      await Promise.all(chunks.map(async (chunk) => {
        const response = await fetch(`${FUNCTION_URL}?action=markRead`, {
          method: "POST",
          headers,
          body: JSON.stringify({ emailIds: chunk }),
        });

        if (response.status === 401) throw new Error("Unauthorized");
        if (!response.ok) throw new Error("Batch failed");
      }));

      setEmails((prev) =>
        prev.map((email) =>
          emailIds.includes(email.id) ? { ...email, isRead: true } : email
        )
      );
      return { success: true, markedCount: emailIds.length };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to mark emails as read";
      setError(message);
      throw err;
    }
  }, [getAuthHeaders]);

  return {
    emails,
    stats,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchEmails,
    loadMoreEmails,
    loadAllEmails,
    fetchStats,
    trashEmails,
    archiveEmails,
    markAsRead,
  };
};
