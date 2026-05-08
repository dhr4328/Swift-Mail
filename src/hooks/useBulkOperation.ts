/**
 * useBulkOperation
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates a two-phase bulk email operation without loading full email
 * objects into React state:
 *
 *  Phase 1 – ID collection
 *    • Calls the edge-function `fetchIds` action (lightweight, IDs only)
 *    • Keeps all IDs in a plain JS array (NOT React state) to avoid re-renders
 *    • Reports live count via a single `progress` state object
 *
 *  Phase 2 – Batch delete / archive
 *    • Splits IDs into chunks of 1 000 (Gmail batchDelete max)
 *    • Sends each chunk to the edge-function `batchDelete` action
 *    • Retries failed chunks up to 3 times with exponential back-off
 *    • Reports per-chunk progress live
 *
 * The hook intentionally does NOT touch the email display list.
 * After completion the caller is responsible for refreshing the email list.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

// ── Constants ─────────────────────────────────────────────────────────────────
const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-api`;

/** Max IDs per batchDelete call (Gmail API limit) */
const DELETE_CHUNK_SIZE = 1000;

/** Max concurrent batchDelete requests (stay within Gmail rate limits) */
const MAX_CONCURRENT_DELETES = 3;

/** Retry attempts per chunk */
const MAX_CHUNK_RETRIES = 3;

/** Base delay for exponential back-off (ms) */
const RETRY_BASE_MS = 600;

// ── Types ─────────────────────────────────────────────────────────────────────
export type BulkPhase =
  | "idle"
  | "fetching"   // Phase 1: collecting IDs
  | "deleting"   // Phase 2: sending batchDelete requests
  | "done"
  | "error";

export interface BulkProgress {
  phase: BulkPhase;
  /** Total IDs collected so far (Phase 1 updates this live) */
  fetchedCount: number;
  /** How many delete chunks we expect in total */
  totalChunks: number;
  /** How many chunks have finished (success or after retries) */
  completedChunks: number;
  /** IDs successfully deleted */
  deletedCount: number;
  /** IDs that ultimately failed after all retries */
  failedCount: number;
  /** Human-readable status line */
  statusLine: string;
  /** Non-null when phase === 'error' */
  error: string | null;
}

const INITIAL_PROGRESS: BulkProgress = {
  phase: "idle",
  fetchedCount: 0,
  totalChunks: 0,
  completedChunks: 0,
  deletedCount: 0,
  failedCount: 0,
  statusLine: "",
  error: null,
};

// ── Helper ────────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useBulkOperation() {
  const [progress, setProgress] = useState<BulkProgress>(INITIAL_PROGRESS);

  /**
   * Guard against duplicate concurrent runs.
   * Using a ref so it doesn't trigger re-renders.
   */
  const isRunningRef = useRef(false);

  /**
   * A ref that accumulates ALL collected IDs.
   * Kept out of React state to prevent thousands of re-renders.
   */
  const allIdsRef = useRef<string[]>([]);

  // ── Auth headers ────────────────────────────────────────────────────────────
  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/";
      throw new Error("Not authenticated");
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      "x-google-token": session.provider_token || "",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    };
  }, []);

  // ── Phase 1: collect all IDs ────────────────────────────────────────────────
  /**
   * Calls the backend `fetchIds` action which paginates through the entire
   * mailbox server-side and returns ONLY message IDs + lightweight metadata.
   * No full email objects are ever sent to the frontend.
   */
  const collectIds = useCallback(
    async (query: string | undefined): Promise<string[]> => {
      const headers = await getAuthHeaders();
      let url = `${FUNCTION_URL}?action=fetchIds`;
      if (query) url += `&q=${encodeURIComponent(query)}`;

      setProgress((p) => ({
        ...p,
        phase: "fetching",
        fetchedCount: 0,
        statusLine: "Fetching email IDs from server…",
      }));

      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? `fetchIds failed: ${res.status}`);
      }

      const data = (await res.json()) as { ids: { id: string }[]; total: number };
      const ids = data.ids.map((m) => m.id);

      setProgress((p) => ({
        ...p,
        fetchedCount: ids.length,
        statusLine: `Fetched ${ids.length.toLocaleString()} emails`,
      }));

      return ids;
    },
    [getAuthHeaders]
  );

  // ── Phase 2: delete in chunks ───────────────────────────────────────────────
  /**
   * Splits `ids` into chunks of DELETE_CHUNK_SIZE (1 000) and sends them to
   * the backend `batchDelete` action. Processes MAX_CONCURRENT_DELETES chunks
   * in parallel. Failed chunks are retried with exponential back-off.
   */
  const deleteInChunks = useCallback(
    async (ids: string[]): Promise<{ deletedCount: number; failedCount: number }> => {
      // Split into chunks
      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += DELETE_CHUNK_SIZE) {
        chunks.push(ids.slice(i, i + DELETE_CHUNK_SIZE));
      }

      const totalChunks = chunks.length;
      let completedChunks = 0;
      let deletedCount = 0;
      let failedCount = 0;

      setProgress((p) => ({
        ...p,
        phase: "deleting",
        totalChunks,
        completedChunks: 0,
        deletedCount: 0,
        statusLine: `Deleting batch 0 / ${totalChunks}…`,
      }));

      const headers = await getAuthHeaders();

      /**
       * Deletes a single chunk with up to MAX_CHUNK_RETRIES retry attempts.
       * Returns the number of successfully deleted IDs from this chunk.
       */
      const deleteChunkWithRetry = async (chunk: string[], chunkIdx: number): Promise<number> => {
        let lastError: unknown;

        for (let attempt = 0; attempt <= MAX_CHUNK_RETRIES; attempt++) {
          try {
            const res = await fetch(`${FUNCTION_URL}?action=batchDelete`, {
              method: "POST",
              headers,
              body: JSON.stringify({ ids: chunk }),
            });

            if (res.status === 429 || res.status === 503) {
              // Rate limited — back off before retrying
              const delay = RETRY_BASE_MS * Math.pow(2, attempt);
              console.warn(
                `Chunk ${chunkIdx} rate-limited (attempt ${attempt + 1}), waiting ${delay}ms`
              );
              await sleep(delay);
              continue;
            }

            if (!res.ok) {
              const errData = await res.json().catch(() => ({ error: "Unknown" }));
              throw new Error(errData.error ?? `HTTP ${res.status}`);
            }

            const data = (await res.json()) as {
              deletedCount: number;
              failedCount: number;
              errors: string[];
            };

            if (data.errors?.length) {
              console.warn(`Chunk ${chunkIdx} partial failure:`, data.errors.slice(0, 3));
            }

            return data.deletedCount ?? chunk.length;
          } catch (err) {
            lastError = err;
            if (attempt < MAX_CHUNK_RETRIES) {
              const delay = RETRY_BASE_MS * Math.pow(2, attempt);
              console.warn(`Chunk ${chunkIdx} attempt ${attempt + 1} failed, retrying in ${delay}ms`);
              await sleep(delay);
            }
          }
        }

        // All retries exhausted
        console.error(`Chunk ${chunkIdx} permanently failed:`, lastError);
        return 0;
      };

      // Process with limited concurrency
      for (let i = 0; i < chunks.length; i += MAX_CONCURRENT_DELETES) {
        const windowChunks = chunks.slice(i, i + MAX_CONCURRENT_DELETES);

        const results = await Promise.allSettled(
          windowChunks.map((chunk, offset) => deleteChunkWithRetry(chunk, i + offset))
        );

        for (let j = 0; j < results.length; j++) {
          const r = results[j];
          completedChunks++;

          if (r.status === "fulfilled") {
            deletedCount += r.value;
            if (r.value < windowChunks[j].length) {
              failedCount += windowChunks[j].length - r.value;
            }
          } else {
            failedCount += windowChunks[j].length;
          }
        }

        // Report progress after each window
        setProgress((p) => ({
          ...p,
          completedChunks,
          deletedCount,
          failedCount,
          statusLine: `Deleting batch ${completedChunks} / ${totalChunks}…`,
        }));
      }

      return { deletedCount, failedCount };
    },
    [getAuthHeaders]
  );

  // ── Public: runBulkDelete ───────────────────────────────────────────────────
  /**
   * Entry point for the bulk delete flow.
   *
   * @param query   Gmail query string (e.g. "category:promotions older_than:1y")
   * @param onDone  Callback called on successful completion
   */
  const runBulkDelete = useCallback(
    async (query: string | undefined, onDone?: (deletedCount: number) => void) => {
      // Prevent duplicate concurrent runs
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      allIdsRef.current = [];

      setProgress({
        ...INITIAL_PROGRESS,
        phase: "fetching",
        statusLine: "Connecting to Gmail…",
      });

      try {
        // ── Phase 1 ───────────────────────────────────────────
        const ids = await collectIds(query);
        allIdsRef.current = ids;

        if (ids.length === 0) {
          setProgress((p) => ({
            ...p,
            phase: "done",
            statusLine: "No emails matched the filter.",
          }));
          isRunningRef.current = false;
          return;
        }

        // ── Phase 2 ───────────────────────────────────────────
        const { deletedCount, failedCount } = await deleteInChunks(ids);

        const summary =
          failedCount === 0
            ? `Completed — ${deletedCount.toLocaleString()} email(s) deleted.`
            : `Completed — ${deletedCount.toLocaleString()} deleted, ${failedCount.toLocaleString()} failed.`;

        setProgress((p) => ({
          ...p,
          phase: "done",
          deletedCount,
          failedCount,
          statusLine: summary,
        }));

        onDone?.(deletedCount);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Bulk delete failed";
        console.error("runBulkDelete error:", err);
        setProgress((p) => ({
          ...p,
          phase: "error",
          error: message,
          statusLine: `Error: ${message}`,
        }));
      } finally {
        isRunningRef.current = false;
      }
    },
    [collectIds, deleteInChunks]
  );

  // ── Public: reset ───────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (isRunningRef.current) return; // can't reset while running
    allIdsRef.current = [];
    setProgress(INITIAL_PROGRESS);
  }, []);

  // ── Public: abort (best-effort) ─────────────────────────────────────────────
  // Note: we can't abort in-flight fetch calls without AbortController.
  // The `isRunningRef` prevents starting a second run, and the UI hides
  // the modal immediately giving the perception of cancellation.

  return { progress, runBulkDelete, reset };
}
