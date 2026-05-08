import { useEffect, useRef, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { Paperclip, Star, Loader2, Trash2, CheckCircle2 } from "lucide-react";
=======
import { Paperclip, Star, Loader2, MailCheck } from "lucide-react";
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
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
  hasActiveFilter?: boolean;
  deleting?: boolean;
  onLoadMore?: () => void;
<<<<<<< HEAD
  onTrashAll?: () => void;
=======
  isBuffering?: boolean; // true while we're still fetching all pages
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
}

const EmailList = ({
  emails,
  selectedEmails,
  onSelectionChange,
  loading,
  loadingMore,
  hasMore,
  hasActiveFilter,
  deleting,
  onLoadMore,
<<<<<<< HEAD
  onTrashAll,
=======
  isBuffering,
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
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

  // ── Stage 1: Initial full-screen loader ────────────────────────────────────
  if (loading && emails.length === 0) {
    return (
      <div className="flex-1 bg-card border border-border rounded-lg flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">Loading emails…</p>
            <p className="text-sm text-muted-foreground">Fetching your inbox from Gmail</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Stage 0: No filter applied, no emails ─────────────────────────────────
  if (!loading && emails.length === 0 && !hasActiveFilter) {
    return (
      <div className="flex-1 bg-card border border-border rounded-lg flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-foreground">Apply a filter to get started</p>
          <p className="text-sm text-muted-foreground">
            Use the sidebar to filter by category, time period, or email type.
          </p>
        </div>
      </div>
    );
  }

  // ── Stage 2: Buffering — emails are loading but we already have some ───────
  const isBuffering = loadingMore || (loading && emails.length > 0);

  return (
<<<<<<< HEAD
    <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden relative">

      {/* ── Deleting overlay ─────────────────────────────────────────────── */}
      {deleting && (
        <div className="absolute inset-0 z-30 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full border-4 border-destructive/20 border-t-destructive animate-spin" />
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">Moving emails to Trash…</p>
              <p className="text-sm text-muted-foreground">Please wait, this may take a moment</p>
            </div>
          </div>
        </div>
      )}

=======
    <div className="flex-1 bg-card border border-border relative">
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
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
            className={`flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer ${
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
              <div className="col-span-4 md:col-span-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${!email.isRead ? "font-semibold text-foreground" : "text-foreground"}`}>
                    {email.sender}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{email.senderEmail}</p>
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
                <p className="text-xs text-muted-foreground truncate">{email.preview}</p>
              </div>
              <div className="hidden md:block md:col-span-2">
                <Badge
                  variant="secondary"
                  className={categoryColors[email.category] || "bg-secondary text-secondary-foreground"}
                >
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

<<<<<<< HEAD
      {/* Load More trigger (infinite scroll) */}
      <div ref={loadMoreRef} className="h-1" />

      {/* ── Stage 2: Buffering footer ─────────────────────────────────────── */}
      {isBuffering && (
        <div className="border-t border-border bg-muted/20 px-4 py-5">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Buffering emails… {emails.length.toLocaleString()} loaded so far
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Loading all matching emails before enabling Trash All
              </p>
            </div>
            {/* Progress dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
          {/* Indeterminate progress bar */}
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* ── Stage 3: All loaded — show count + Trash All ─────────────────── */}
      {!isBuffering && !hasMore && emails.length > 0 && hasActiveFilter && !deleting && (
        <div className="border-t border-border bg-card px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {emails.length.toLocaleString()} email{emails.length !== 1 ? "s" : ""} loaded
                </p>
                <p className="text-xs text-muted-foreground">All matching emails are ready</p>
              </div>
            </div>
            {onTrashAll && (
              <Button
                variant="destructive"
                className="gap-2 font-semibold"
                onClick={onTrashAll}
              >
                <Trash2 className="h-4 w-4" />
                Trash All {emails.length.toLocaleString()} Emails
              </Button>
            )}
          </div>
        </div>
      )}

      {/* No more emails message (no filter active) */}
      {!isBuffering && !hasMore && emails.length > 0 && !hasActiveFilter && (
        <div className="text-center py-4 border-t border-border">
          <span className="text-sm text-muted-foreground">All emails loaded</span>
=======
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
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
        </div>
      )}
    </div>
  );
};

export default EmailList;
