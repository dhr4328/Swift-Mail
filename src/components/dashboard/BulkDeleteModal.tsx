/**
 * BulkDeleteModal
 * ─────────────────────────────────────────────────────────────────────────────
 * A two-screen modal:
 *
 *  Screen 1 – Confirmation
 *    • Warns the user about permanent deletion
 *    • Shows the active filter so they know what will be deleted
 *    • Requires explicit confirmation click
 *
 *  Screen 2 – Live Progress
 *    • Shows animated phase indicators:
 *        ○ "Fetching email IDs…"     (Phase 1)
 *        ○ "Deleting batch X / Y…"   (Phase 2)
 *        ○ "Completed"               (done)
 *        ○ "Error: …"                (error)
 *    • Animated progress bar
 *    • Cannot be dismissed while a deletion is in progress (safeguard)
 *    • Shows a summary and close button when done
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Trash2,
  XCircle,
  ServerCrash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { BulkProgress } from "@/hooks/useBulkOperation";

// ── Types ─────────────────────────────────────────────────────────────────────
interface BulkDeleteModalProps {
  /** Controls visibility */
  open: boolean;
  /** The human-readable label of the current filter, e.g. "Promotions" */
  filterLabel: string;
  /** Live progress from useBulkOperation */
  progress: BulkProgress;
  /** Called when the user confirms and wants the deletion to start */
  onConfirm: () => void;
  /** Called when the modal should close (only allowed when idle/done/error) */
  onClose: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Derive an 0-100 progress value suitable for the progress bar */
function derivePercent(p: BulkProgress): number {
  if (p.phase === "idle") return 0;
  if (p.phase === "fetching") return 10; // indeterminate-ish
  if (p.phase === "done") return 100;
  if (p.phase === "error") return 100;
  if (p.totalChunks === 0) return 15;
  // Phase 2: map chunk completion to 15–100 range
  return Math.round(15 + (p.completedChunks / p.totalChunks) * 85);
}

function PhaseIcon({ phase }: { phase: BulkProgress["phase"] }) {
  switch (phase) {
    case "fetching":
    case "deleting":
      return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
    case "done":
      return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    case "error":
      return <XCircle className="h-6 w-6 text-destructive" />;
    default:
      return <ServerCrash className="h-6 w-6 text-muted-foreground" />;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
const BulkDeleteModal = ({
  open,
  filterLabel,
  progress,
  onConfirm,
  onClose,
}: BulkDeleteModalProps) => {
  const [confirmed, setConfirmed] = useState(false);

  // Reset "confirmed" whenever modal opens fresh
  useEffect(() => {
    if (open && progress.phase === "idle") {
      setConfirmed(false);
    }
  }, [open, progress.phase]);

  // Move to progress screen once confirmed
  useEffect(() => {
    if (confirmed && progress.phase === "idle") {
      onConfirm();
    }
  }, [confirmed, progress.phase, onConfirm]);

  if (!open) return null;

  const isRunning = progress.phase === "fetching" || progress.phase === "deleting";
  const isDone = progress.phase === "done";
  const isError = progress.phase === "error";
  const percent = derivePercent(progress);

  // ── Backdrop click handler ──────────────────────────────────────────────────
  const handleBackdropClick = () => {
    if (!isRunning) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-delete-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Header stripe */}
        <div
          className={`h-1.5 w-full transition-all duration-500 ${
            isError
              ? "bg-destructive"
              : isDone
              ? "bg-green-500"
              : "bg-primary"
          }`}
        />

        <div className="p-6 space-y-5">
          {/* ── Confirmation Screen ─────────────────────────────────────── */}
          {!confirmed && progress.phase === "idle" && (
            <>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-destructive/10 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h2
                    id="bulk-delete-title"
                    className="text-lg font-semibold text-foreground"
                  >
                    Delete All Emails?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will{" "}
                    <span className="font-medium text-destructive">
                      permanently delete
                    </span>{" "}
                    every email matching{" "}
                    <span className="font-semibold text-foreground">
                      "{filterLabel}"
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* Warnings */}
              <ul className="space-y-2 text-sm text-muted-foreground bg-muted/40 rounded-xl p-4 border border-border">
                <li className="flex items-center gap-2">
                  <span className="text-destructive font-bold">•</span>
                  All matching emails will be permanently deleted
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-destructive font-bold">•</span>
                  This action cannot be undone
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground/60 font-bold">•</span>
                  Emails spanning multiple pages will all be deleted
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground/60 font-bold">•</span>
                  Large mailboxes may take a few minutes
                </li>
              </ul>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => setConfirmed(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Yes, Delete All
                </Button>
              </div>
            </>
          )}

          {/* ── Progress Screen ──────────────────────────────────────────── */}
          {(confirmed || isRunning || isDone || isError) && progress.phase !== "idle" && (
            <>
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 p-2 rounded-xl ${
                    isError
                      ? "bg-destructive/10"
                      : isDone
                      ? "bg-green-500/10"
                      : "bg-primary/10"
                  }`}
                >
                  <PhaseIcon phase={progress.phase} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2
                    id="bulk-delete-title"
                    className="text-lg font-semibold text-foreground"
                  >
                    {isDone
                      ? "Deletion Complete"
                      : isError
                      ? "Something went wrong"
                      : "Deleting emails…"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {progress.statusLine || "Please wait…"}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <Progress
                  value={percent}
                  className={`h-2 transition-all duration-300 ${
                    isError ? "[&>div]:bg-destructive" : isDone ? "[&>div]:bg-green-500" : ""
                  }`}
                />

                {/* Phase step indicators */}
                <div className="flex justify-between text-xs text-muted-foreground px-0.5">
                  <StepLabel
                    label="Fetching IDs"
                    active={progress.phase === "fetching"}
                    done={
                      progress.phase === "deleting" ||
                      progress.phase === "done" ||
                      progress.phase === "error"
                    }
                  />
                  <StepLabel
                    label="Deleting"
                    active={progress.phase === "deleting"}
                    done={progress.phase === "done"}
                    isError={progress.phase === "error"}
                  />
                  <StepLabel
                    label="Done"
                    active={false}
                    done={progress.phase === "done"}
                    isError={progress.phase === "error"}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <StatBox
                  label="Fetched"
                  value={progress.fetchedCount.toLocaleString()}
                  accent="text-primary"
                />
                <StatBox
                  label="Deleted"
                  value={progress.deletedCount.toLocaleString()}
                  accent="text-green-500"
                />
                <StatBox
                  label="Failed"
                  value={progress.failedCount.toLocaleString()}
                  accent={progress.failedCount > 0 ? "text-destructive" : "text-muted-foreground"}
                />
              </div>

              {/* Chunk progress (Phase 2 only) */}
              {(progress.phase === "deleting" || isDone) && progress.totalChunks > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Batch{" "}
                  <span className="font-semibold text-foreground">
                    {progress.completedChunks}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {progress.totalChunks}
                  </span>{" "}
                  processed
                </p>
              )}

              {/* Error message */}
              {isError && progress.error && (
                <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                  {progress.error}
                </p>
              )}

              {/* Warning: do not close while running */}
              {isRunning && (
                <p className="text-xs text-muted-foreground text-center">
                  ⚠ Do not close this window — deletion is in progress
                </p>
              )}

              {/* Actions (only when not running) */}
              {!isRunning && (
                <div className="flex justify-end pt-1">
                  <Button variant={isError ? "destructive" : "default"} onClick={onClose}>
                    {isError ? "Dismiss" : "Done"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StepLabel({
  label,
  active,
  done,
  isError,
}: {
  label: string;
  active: boolean;
  done: boolean;
  isError?: boolean;
}) {
  return (
    <span
      className={`transition-colors font-medium ${
        isError
          ? "text-destructive"
          : done
          ? "text-green-500"
          : active
          ? "text-primary"
          : "text-muted-foreground/50"
      }`}
    >
      {label}
    </span>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-muted/40 border border-border rounded-xl py-3 px-2">
      <span className={`text-xl font-bold tabular-nums ${accent}`}>{value}</span>
      <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}

export default BulkDeleteModal;
