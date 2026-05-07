import { useEffect, useRef, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paperclip, Star, Loader2, MailCheck } from "lucide-react";
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
  isBuffering?: boolean; // true while we're still fetching all pages
}

const EmailList = ({
  emails,
  selectedEmails,
  onSelectionChange,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  isBuffering,
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
    <div className="flex-1 bg-card border border-border relative">
      {/* Table Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-background">
        <Checkbox
          checked={selectedEmails.length === emails.length && emails.length > 0}
          onCheckedChange={toggleAll}
        />
        <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
          <div className="col-span-4 md:col-span-3">Sender</div>
          <div className="col-span-6 md:col-span-5">Subject</div>
          <div className="hidden md:block md:col-span-2">Category</div>
          <div className="hidden md:block md:col-span-1 text-right">Size</div>
          <div className="col-span-2 md:col-span-1 text-right">Date</div>
        </div>
      </div>

      {/* Email Rows */}
      <div className="divide-y divide-border">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`flex items-center gap-4 px-4 py-3 hover:bg-background transition-colors cursor-pointer ${!email.isRead ? "bg-primary/5" : ""
              }`}
            onClick={() => toggleEmail(email.id)}
          >
            <Checkbox
              checked={selectedEmails.includes(email.id)}
              onCheckedChange={() => toggleEmail(email.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4 md:col-span-3 flex items-center gap-2">
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
              <div className="col-span-6 md:col-span-5 min-w-0">
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
              <div className="hidden md:block md:col-span-2">
                <Badge variant="secondary" className={categoryColors[email.category] || "bg-secondary text-secondary-foreground"}>
                  {email.category}
                </Badge>
              </div>
              <div className="hidden md:block md:col-span-1 text-right text-sm text-muted-foreground">
                {email.size}
              </div>
              <div className="col-span-2 md:col-span-1 text-right text-sm text-muted-foreground">
                {email.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Trigger (infinite scroll sentinel) */}
      <div ref={loadMoreRef} className="h-1" />

      {/* End of List */}
      {!hasMore && !isBuffering && emails.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-3 border-t border-border">
          <MailCheck className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">
            All {emails.length.toLocaleString()} emails loaded
          </span>
        </div>
      )}

      {/* Buffering overlay — blocks actions while pages are still loading */}
      {isBuffering && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
        >
          {/* Spinning ring */}
          <div className="relative flex items-center justify-center">
            <svg className="animate-spin" width="72" height="72" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="30" stroke="white" strokeWidth="4" opacity="0.15" />
              <path
                d="M36 6 A30 30 0 0 1 66 36"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <Loader2 className="absolute h-7 w-7 animate-spin text-primary" />
          </div>

          {/* Status text */}
          <div className="text-center space-y-1 px-6">
            <p className="text-sm font-semibold text-white">
              Loading all matching emails…
            </p>
            <p className="text-xs text-white/70">
              {emails.length.toLocaleString()} fetched so far — please wait
            </p>
            <p className="text-xs text-white/40 mt-1">
              Delete &amp; Archive will unlock once everything is loaded
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailList;
