import { useEffect, useRef, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Star, Loader2 } from "lucide-react";
import type { Email } from "@/hooks/useGmailApi";

const categoryColors: Record<string, string> = {
  Personal: "bg-primary/20 text-primary",
  Work: "bg-secondary/40 text-secondary-foreground",
  Promotions: "bg-muted/60 text-muted-foreground",
  Newsletters: "bg-accent text-accent-foreground",
  Social: "bg-primary/10 text-foreground",
  Finance: "bg-secondary/20 text-foreground",
  Updates: "bg-muted text-muted-foreground",
  Forums: "bg-accent/50 text-accent-foreground",
  Notifications: "bg-secondary/30 text-secondary-foreground",
};

interface EmailListProps {
  emails: Email[];
  selectedEmails: string[];
  onSelectionChange: (emails: string[]) => void;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const EmailList = ({
  emails,
  selectedEmails,
  onSelectionChange,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
}: EmailListProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const toggleEmail = (emailId: string) => {
    onSelectionChange(
      selectedEmails.includes(emailId)
        ? selectedEmails.filter((id) => id !== emailId)
        : [...selectedEmails, emailId]
    );
  };

  const toggleAll = () => {
    if (selectedEmails.length === emails.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(emails.map((e) => e.id));
    }
  };

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loadingMore && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, loadingMore, onLoadMore]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  if (loading) {
    return (
      <div className="flex-1 bg-card border border-border flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading emails...</p>
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 bg-card border border-border flex items-center justify-center py-20">
        <p className="text-muted-foreground">No emails found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-card border border-border">
      {/* Table Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-background">
        <Checkbox
          checked={selectedEmails.length === emails.length && emails.length > 0}
          onCheckedChange={toggleAll}
        />
        <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
          <div className="col-span-3">Sender</div>
          <div className="col-span-5">Subject</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1 text-right">Size</div>
          <div className="col-span-1 text-right">Date</div>
        </div>
      </div>

      {/* Email Rows */}
      <div className="divide-y divide-border">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`flex items-center gap-4 px-4 py-3 hover:bg-background transition-colors cursor-pointer ${
              !email.isRead ? "bg-primary/5" : ""
            }`}
            onClick={() => toggleEmail(email.id)}
          >
            <Checkbox
              checked={selectedEmails.includes(email.id)}
              onCheckedChange={() => toggleEmail(email.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${!email.isRead ? "font-semibold text-foreground" : "text-foreground"}`}>
                    {email.sender}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {email.senderEmail}
                  </p>
                </div>
                {email.isStarred && <Star className="h-4 w-4 text-warning fill-warning flex-shrink-0" />}
              </div>
              <div className="col-span-5 min-w-0">
                <div className="flex items-center gap-2">
                  {email.hasAttachment && <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  <p className={`text-sm truncate ${!email.isRead ? "font-semibold text-foreground" : "text-foreground"}`}>
                    {email.subject}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {email.preview}
                </p>
              </div>
              <div className="col-span-2">
                <Badge variant="secondary" className={categoryColors[email.category] || "bg-secondary text-secondary-foreground"}>
                  {email.category}
                </Badge>
              </div>
              <div className="col-span-1 text-right text-sm text-muted-foreground">
                {email.size}
              </div>
              <div className="col-span-1 text-right text-sm text-muted-foreground">
                {email.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="h-1" />
      
      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex items-center justify-center py-4 border-t border-border">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Loading more emails...</span>
        </div>
      )}
      
      {/* End of List */}
      {!hasMore && emails.length > 0 && (
        <div className="text-center py-4 border-t border-border">
          <span className="text-sm text-muted-foreground">No more emails to load</span>
        </div>
      )}
    </div>
  );
};

export default EmailList;
