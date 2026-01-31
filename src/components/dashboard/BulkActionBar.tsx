import { Trash2, Archive, MailOpen, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onMarkRead: () => void;
}

const BulkActionBar = ({
  selectedCount,
  onClearSelection,
  onDelete,
  onArchive,
  onMarkRead,
}: BulkActionBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
      <div className="flex items-center gap-4">
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
      </div>
      
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
          Move to Trash
        </Button>
      </div>
    </div>
  );
};

export default BulkActionBar;
