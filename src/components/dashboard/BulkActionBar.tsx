import { Trash2, Archive, MailOpen, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  totalMatchingCount?: number;
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
  hasActiveFilter,
  deleting,
  isBuffering,
  onClearSelection,
  onDelete,
  onDeleteAll,
  onArchive,
  onMarkRead,
}: BulkActionBarProps) => {
  // While loading all pages, show a persistent buffering banner
  if (isBuffering) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/60 border border-border rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Fetching all emails…</p>
          <p className="text-xs text-muted-foreground">Delete, Archive and other actions will appear once every email is loaded.</p>
        </div>
      </div>
    );
  }

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
              Delete All
              {totalMatchingCount ? ` (${totalMatchingCount.toLocaleString()})` : ""}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkActionBar;
