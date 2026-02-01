import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  promotions: number;
  unread: number;
  storageUsed: string;
}

const FUNCTION_URL = `https://nstcwgkoqaepsppjwosk.supabase.co/functions/v1/gmail-api`;

export const useGmailApi = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [stats, setStats] = useState<GmailStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("Not authenticated");
    }
    return {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchEmails = useCallback(async (maxResults: number = 50) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTION_URL}?action=list&maxResults=${maxResults}`, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch emails");
      }

      const data = await response.json();
      setEmails(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch emails";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTION_URL}?action=stats`, {
        headers,
      });

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
    } finally {
      setLoading(false);
    }
  }, []);

  const trashEmails = useCallback(async (emailIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTION_URL}?action=trash`, {
        method: "POST",
        headers,
        body: JSON.stringify({ emailIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to trash emails");
      }

      const result = await response.json();
      
      // Remove trashed emails from local state
      setEmails((prev) => prev.filter((email) => !emailIds.includes(email.id)));
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to trash emails";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveEmails = useCallback(async (emailIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTION_URL}?action=archive`, {
        method: "POST",
        headers,
        body: JSON.stringify({ emailIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to archive emails");
      }

      const result = await response.json();
      
      // Remove archived emails from local state
      setEmails((prev) => prev.filter((email) => !emailIds.includes(email.id)));
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to archive emails";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (emailIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTION_URL}?action=markRead`, {
        method: "POST",
        headers,
        body: JSON.stringify({ emailIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark emails as read");
      }

      const result = await response.json();
      
      // Update read status in local state
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
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    emails,
    stats,
    loading,
    error,
    fetchEmails,
    fetchStats,
    trashEmails,
    archiveEmails,
    markAsRead,
  };
};
