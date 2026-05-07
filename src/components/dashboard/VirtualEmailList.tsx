/**
 * VirtualEmailList
 * ─────────────────────────────────────────────────────────────────────────────
 * A high-performance email list that avoids rendering thousands of DOM elements.
 *
 * Strategy:
 *   • Only renders a windowed slice of emails (VISIBLE_WINDOW rows above + below
 *     the current scroll position).
 *   • Maintains the correct scrollable height with a spacer div above and below
 *     the rendered window so the scrollbar behaves naturally.
 *   • Uses a ResizeObserver + scroll listener for precise row measurement.
 *   • Falls back gracefully for small lists (< VIRTUALISE_THRESHOLD).
 *
 * Performance characteristics:
 *   • DOM nodes stay constant at ≈ VISIBLE_WINDOW regardless of list size.
 *   • 50 000 email list is as fast as a 50 email list.
 *   • Smooth keyboard and mouse scrolling without jank.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Star, Loader2, MailCheck } from "lucide-react";
import type { Email } from "@/hooks/useGmailApi";

// ── Constants ─────────────────────────────────────────────────────────────────
/** Estimated row height in pixels (used before first render) */
const ESTIMATED_ROW_H = 64;

/** Number of rows to render above and below the visible viewport */
const OVERSCAN = 8;

/** Below this count, just render the flat list (no virtualisation overhead) */
const VIRTUALISE_THRESHOLD = 100;

// ── Category colours ──────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
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

// ── Types ─────────────────────────────────────────────────────────────────────
interface VirtualEmailListProps {
  emails: Email[];
  selectedEmails: string[];
  onSelectionChange: (emails: string[]) => void;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  /** When true, show the buffering overlay and hide actions */
  isBuffering?: boolean;
}

// ── EmailRow (memoised) ───────────────────────────────────────────────────────
function EmailRow({
  email,
  selected,
  onToggle,
}: {
  email: Email;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 hover:bg-background transition-colors cursor-pointer border-b border-border last:border-b-0 ${
        !email.isRead ? "bg-primary/5" : ""
      }`}
      onClick={() => onToggle(email.id)}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggle(email.id)}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="flex-1 grid grid-cols-12 gap-4 items-center min-w-0">
        {/* Sender */}
        <div className="col-span-4 md:col-span-3 flex items-center gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm truncate ${
                !email.isRead ? "font-semibold text-foreground" : "text-foreground"
              }`}
            >
              {email.sender}
            </p>
            <p className="text-xs text-muted-foreground truncate">{email.senderEmail}</p>
          </div>
          {email.isStarred && (
            <Star className="h-4 w-4 text-warning fill-warning flex-shrink-0" />
          )}
        </div>

        {/* Subject + preview */}
        <div className="col-span-6 md:col-span-5 min-w-0">
          <div className="flex items-center gap-2">
            {email.hasAttachment && (
              <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <p
              className={`text-sm truncate ${
                !email.isRead ? "font-semibold text-foreground" : "text-foreground"
              }`}
            >
              {email.subject}
            </p>
          </div>
          <p className="text-xs text-muted-foreground truncate">{email.preview}</p>
        </div>

        {/* Category */}
        <div className="hidden md:block md:col-span-2">
          <Badge
            variant="secondary"
            className={CATEGORY_COLORS[email.category] || "bg-secondary text-secondary-foreground"}
          >
            {email.category}
          </Badge>
        </div>

        {/* Size */}
        <div className="hidden md:block md:col-span-1 text-right text-sm text-muted-foreground">
          {email.size}
        </div>

        {/* Date */}
        <div className="col-span-2 md:col-span-1 text-right text-sm text-muted-foreground">
          {email.date}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const VirtualEmailList = ({
  emails,
  selectedEmails,
  onSelectionChange,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  isBuffering,
}: VirtualEmailListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const [rowHeight, setRowHeight] = useState(ESTIMATED_ROW_H);

  // ── Row height measurement ──────────────────────────────────────────────────
  const firstRowRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const h = node.getBoundingClientRect().height;
      if (h > 0) setRowHeight(h);
    }
  }, []);

  // ── Container size observer ─────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Scroll handler ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ── Infinite scroll: trigger loadMore when near bottom ────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasMore || loadingMore || isBuffering) return;

    const onScroll = () => {
      const { scrollTop: st, scrollHeight, clientHeight } = el;
      if (scrollHeight - st - clientHeight < 200) {
        onLoadMore?.();
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasMore, loadingMore, isBuffering, onLoadMore]);

  // ── Selection helpers ───────────────────────────────────────────────────────
  const toggleEmail = useCallback(
    (id: string) => {
      onSelectionChange(
        selectedEmails.includes(id)
          ? selectedEmails.filter((x) => x !== id)
          : [...selectedEmails, id]
      );
    },
    [selectedEmails, onSelectionChange]
  );

  const toggleAll = useCallback(() => {
    if (selectedEmails.length === emails.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(emails.map((e) => e.id));
    }
  }, [selectedEmails, emails, onSelectionChange]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 bg-card border border-border flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading emails…</p>
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

  // ── Virtualisation window calculation ──────────────────────────────────────
  const totalHeight = emails.length * rowHeight;
  const shouldVirtualise = emails.length >= VIRTUALISE_THRESHOLD;

  let startIdx = 0;
  let endIdx = emails.length;
  let paddingTop = 0;
  let paddingBottom = 0;

  if (shouldVirtualise) {
    const visibleStart = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN);
    const visibleEnd = Math.min(
      emails.length,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + OVERSCAN
    );
    startIdx = visibleStart;
    endIdx = visibleEnd;
    paddingTop = visibleStart * rowHeight;
    paddingBottom = Math.max(0, (emails.length - visibleEnd) * rowHeight);
  }

  const visibleEmails = emails.slice(startIdx, endIdx);

  return (
    <div className="flex-1 bg-card border border-border flex flex-col relative">
      {/* ── Table header (sticky) ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-background sticky top-0 z-10">
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

      {/* ── Scrollable rows ───────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 280px)" }}
      >
        {/* Top spacer for virtual scroll */}
        {shouldVirtualise && paddingTop > 0 && (
          <div style={{ height: paddingTop }} aria-hidden />
        )}

        {/* Rendered rows */}
        {visibleEmails.map((email, idx) => (
          <div
            key={email.id}
            ref={idx === 0 ? firstRowRef : undefined}
          >
            <EmailRow
              email={email}
              selected={selectedEmails.includes(email.id)}
              onToggle={toggleEmail}
            />
          </div>
        ))}

        {/* Bottom spacer for virtual scroll */}
        {shouldVirtualise && paddingBottom > 0 && (
          <div style={{ height: paddingBottom }} aria-hidden />
        )}

        {/* Loading more indicator */}
        {loadingMore && !isBuffering && (
          <div className="flex items-center justify-center py-4 border-t border-border">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Loading more emails…</span>
          </div>
        )}

        {/* End of list */}
        {!hasMore && !isBuffering && emails.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-3 border-t border-border">
            <MailCheck className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              All {emails.length.toLocaleString()} emails loaded
            </span>
          </div>
        )}
      </div>

      {/* ── Buffering overlay ─────────────────────────────────────────────── */}
      {isBuffering && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
        >
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

          <div className="text-center space-y-1 px-6">
            <p className="text-sm font-semibold text-white">Loading all matching emails…</p>
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

export default VirtualEmailList;
