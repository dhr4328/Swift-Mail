import { Trash2, Archive, MailOpen, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  totalMatchingCount?: number;
  loadedEmailCount?: number;   // total emails loaded so far (for display during buffering)
  hasActiveFilter: boolean;
  deleting?: boolean;
  isBuffering?: boolean; // true while all pages are still loading
  onClearSelection: () => void;
  onDelete: () => void;
  onDeleteAll: () => void;
  onArchive: () => void;
  onMarkRead: () => void;
}

const BulkActionBar = ({
  selectedCount,
  totalMatchingCount,
  loadedEmailCount = 0,
  hasActiveFilter,
  deleting,
  isBuffering,
  onClearSelection,
  onDelete,
  onDeleteAll,
  onArchive,
  onMarkRead,
}: BulkActionBarProps) => {

  // ── State 1: Buffering — filter was applied, loading all emails ──────────
  if (isBuffering && hasActiveFilter) {
    return (
      <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-xl">
        {/* Animated spinner */}
        <div className="relative flex-shrink-0">
          <div className="h-9 w-9 rounded-full border-2 border-primary/20 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </div>

        {/* Status text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Loading emails…
            {loadedEmailCount > 0 && (
              <span className="ml-2 text-primary font-bold tabular-nums">
                {loadedEmailCount.toLocaleString()} found
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Please wait — fetching all matching emails before enabling bulk actions.
          </p>
        </div>

        {/* Pulsing dots */}
        <div className="flex gap-1 flex-shrink-0">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── State 2: Ready — filter applied + all emails loaded → show Trash All ──
  if (hasActiveFilter && selectedCount === 0 && !deleting && !isBuffering) {
    const count = loadedEmailCount;
    return (
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent border border-green-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {count > 0
                ? <>
                    <span className="text-green-500 font-bold tabular-nums">{count.toLocaleString()}</span>
                    {" "}email{count !== 1 ? "s" : ""} ready to trash
                  </>
                : "No emails matched the filter"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              All emails loaded — click &ldquo;Trash All&rdquo; to move them to your Gmail Trash.
            </p>
          </div>
        </div>

        {count > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteAll}
            className="gap-2 shrink-0 bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-all hover:shadow-red-600/30 hover:scale-105"
          >
            <Trash2 className="h-4 w-4" />
            Trash All ({count.toLocaleString()})
          </Button>
        )}
      </div>
    );
  }

  // ── State 3: Emails selected → per-email action bar ───────────────────────
  if (selectedCount === 0 && !deleting) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-lg">
      <div className="flex items-center gap-4">
        {!deleting ? (
          <>
            <span className="text-sm font-medium">
              {selectedCount} email{selectedCount !== 1 ? "s" : ""} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Deleting all matching emails…</span>
          </div>
        )}
      </div>

      {!deleting && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onMarkRead}
            className="gap-2"
          >
            <MailOpen className="h-4 w-4" />
            Mark Read
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onArchive}
            className="gap-2"
          >
            <Archive className="h-4 w-4" />
            Archive
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
          {hasActiveFilter && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteAll}
              className="gap-2 bg-red-700 hover:bg-red-800 border-red-800"
            >
              <Trash2 className="h-4 w-4" />
              Trash All
              {totalMatchingCount ? ` (${totalMatchingCount.toLocaleString()})` : ""}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkActionBar;
