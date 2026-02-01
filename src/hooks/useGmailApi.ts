import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

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
  const [emails, setEmails] = useState<Email[]>([]);
  const [stats, setStats] = useState<GmailStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const nextPageTokenRef = useRef<string | null>(null);

  const getAuthHeaders = async () => {
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
  };

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
      const response = await fetch(`${FUNCTION_URL}?action=trash`, {
        method: "POST",
        headers,
        body: JSON.stringify({ emailIds }),
      });

      if (response.status === 401) {
        window.location.href = "/";
        throw new Error("Unauthorized - Please login again");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to trash emails");
      }

      const result = await response.json();
      setEmails((prev) => prev.filter((email) => !emailIds.includes(email.id)));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to trash emails";
      setError(message);
      throw err;
    }
  }, []);

  const archiveEmails = useCallback(async (emailIds: string[]) => {
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTION_URL}?action=archive`, {
        method: "POST",
        headers,
        body: JSON.stringify({ emailIds }),
      });

      if (response.status === 401) {
        window.location.href = "/";
        throw new Error("Unauthorized - Please login again");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to archive emails");
      }

      const result = await response.json();
      setEmails((prev) => prev.filter((email) => !emailIds.includes(email.id)));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to archive emails";
      setError(message);
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (emailIds: string[]) => {
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTION_URL}?action=markRead`, {
        method: "POST",
        headers,
        body: JSON.stringify({ emailIds }),
      });

      if (response.status === 401) {
        window.location.href = "/";
        throw new Error("Unauthorized - Please login again");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark emails as read");
      }

      const result = await response.json();
      setEmails((prev) =>
        prev.map((email) =>
          emailIds.includes(email.id) ? { ...email, isRead: true } : email
        )
      );
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to mark emails as read";
      setError(message);
      throw err;
    }
  }, []);

  return {
    emails,
    stats,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchEmails,
    loadMoreEmails,
    fetchStats,
    trashEmails,
    archiveEmails,
    markAsRead,
  };
};
