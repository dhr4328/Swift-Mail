<<<<<<< HEAD
import { useState, useEffect, useCallback, useRef } from "react";
import { Mail, Inbox, Users, HardDrive, LogOut, Search, Menu, RefreshCw } from "lucide-react";
=======
/**
 * Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Main authenticated view. Integrates:
 *
 *  • VirtualEmailList   – virtualized rendering (50k+ emails, no DOM bloat)
 *  • BulkActionBar      – locks actions while buffering; unlocks when ready
 *  • BulkDeleteModal    – two-phase confirmation + live progress modal
 *  • useBulkOperation   – orchestrates lightweight ID fetch + chunked delete
 *
 * Architecture notes
 *  • Email *display* list is fetched page-by-page into React state (for UI)
 *  • Bulk *delete* uses a separate lightweight ID-only path that never
 *    loads email content into the browser
 *  • All bulk deletion progress is reported via useBulkOperation.progress
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Inbox,
  Users,
  HardDrive,
  LogOut,
  Search,
  Menu,
  RefreshCw,
} from "lucide-react";
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useGmailApi } from "@/hooks/useGmailApi";
import { useBulkOperation } from "@/hooks/useBulkOperation";
import StatCard from "@/components/dashboard/StatCard";
import CategoryChart from "@/components/dashboard/CategoryChart";
import StorageChart from "@/components/dashboard/StorageChart";
import InboxHealthCard from "@/components/dashboard/InboxHealthCard";
import QuickInsights from "@/components/dashboard/QuickInsights";
import FilterSidebar from "@/components/dashboard/FilterSidebar";
import BulkActionBar from "@/components/dashboard/BulkActionBar";
import BulkDeleteModal from "@/components/dashboard/BulkDeleteModal";
import VirtualEmailList from "@/components/dashboard/VirtualEmailList";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FILTER_LABELS: Record<string, string> = {
  personal: "Personal",
  work: "Work",
  promotions: "Promotions",
  newsletters: "Newsletters",
  social: "Social Media",
  forums: "Forums",
  finance: "Finance",
  spam: "Spam-like",
  unread: "Unread",
  attachments: "With Attachments",
  large: "Large (>5 MB)",
  starred: "Starred",
  "1month": "Last Month",
  "6months": "Last 6 Months",
  "1year": "Last Year",
  older: "Older than 1 Year",
  "2years": "Older than 2 Years",
  "3years": "Older than 3 Years",
};

// ── Filter label helpers ──────────────────────────────────────────────────────
const FILTER_LABELS: Record<string, string> = {
  personal: "Personal",
  work: "Work",
  promotions: "Promotions",
  newsletters: "Newsletters",
  social: "Social Media",
  forums: "Forums",
  finance: "Finance",
  spam: "Spam-like",
  unread: "Unread",
  attachments: "With attachments",
  large: "Large (>5MB)",
  starred: "Starred",
  "1month": "Last month",
  "6months": "Last 6 months",
  "1year": "Last year",
  older: "Older than 1 year",
  "2years": "Older than 2 years",
  "3years": "Older than 3 years",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
<<<<<<< HEAD
  const {
    emails,
    stats,
    loading,
    loadingMore,
    deleting,
    error,
    hasMore,
    fetchEmails,
    loadMoreEmails,
    loadAllEmails,
    fetchStats,
    trashEmails,
    trashAllByQuery,
    archiveEmails,
    markAsRead,
  } = useGmailApi();
=======
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4

  // ── Gmail API hook (display list) ─────────────────────────────────────────
  const {
    emails,
    stats,
    loading,
    loadingMore,
    deleting,
    error,
    hasMore,
    fetchEmails,
    loadMoreEmails,
    loadAllEmails,
    fetchStats,
    trashEmails,
    archiveEmails,
    markAsRead,
  } = useGmailApi();

  // ── Bulk operation hook (ID-only path, no DOM rendering) ──────────────────
  const { progress: bulkProgress, runBulkDelete, reset: resetBulk } = useBulkOperation();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "emails">("overview");
<<<<<<< HEAD
  const [trashAllOpen, setTrashAllOpen] = useState(false);

  // Ref to avoid stale closure in the load-all effect
  const loadAllRef = useRef(loadAllEmails);
  loadAllRef.current = loadAllEmails;

  // ── Fetch stats on mount ────────────────────────────────────────────────────
=======
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // ── Fetch stats on mount ──────────────────────────────────────────────────
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
  useEffect(() => {
    fetchStats().catch(console.error);
  }, [fetchStats]);

<<<<<<< HEAD
  // ── Build Gmail query from active filters ───────────────────────────────────
  const buildGmailQuery = useCallback((filters: string[]): string => {
=======
  // ── Build Gmail query string from active filters ──────────────────────────
  const buildGmailQuery = useCallback((filters: string[]): string | undefined => {
    if (filters.length === 0) return undefined;

>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
    const categoryMap: Record<string, string> = {
      personal: "category:personal",
      work: "category:primary",
      promotions: "category:promotions",
      newsletters: "category:updates",
      social: "category:social",
      forums: "category:forums",
      finance: "category:updates",
      spam: "in:spam",
    };
    const typeMap: Record<string, string> = {
      unread: "is:unread",
      attachments: "has:attachment",
      large: "larger:5M",
      starred: "is:starred",
    };
    const timeMap: Record<string, string> = {
      "1month": "newer_than:1m",
      "6months": "newer_than:6m",
      "1year": "newer_than:1y",
      older: "older_than:1y",
      "2years": "older_than:2y",
      "3years": "older_than:3y",
    };

    const categories = filters.filter((f) => categoryMap[f]).map((f) => categoryMap[f]);
    const types = filters.filter((f) => typeMap[f]).map((f) => typeMap[f]);
    const times = filters.filter((f) => timeMap[f]).map((f) => timeMap[f]);
    const senders = filters
      .filter((f) => f.startsWith("sender:"))
      .map((f) => `from:${f.split(":")[1]}`);

    const parts: string[] = [];
    if (categories.length > 0)
      parts.push(categories.length > 1 ? `{${categories.join(" ")}}` : categories[0]);
    if (types.length > 0) parts.push(...types);
    if (times.length > 0) parts.push(...times);
    if (senders.length > 0)
      parts.push(senders.length > 1 ? `{${senders.join(" ")}}` : senders[0]);

<<<<<<< HEAD
    return parts.join(" ");
  }, []);

=======
    return parts.join(" ") || undefined;
  }, []);

  /** Combined query (filter + search bar) */
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
  const currentQuery = useCallback((): string => {
    const q = buildGmailQuery(selectedFilters);
    return q ? (searchQuery ? `${q} ${searchQuery}` : q) : searchQuery;
  }, [buildGmailQuery, selectedFilters, searchQuery]);

<<<<<<< HEAD
=======
  /** Human-readable label for the current filter (shown in modals) */
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
  const filterLabel = (): string => {
    if (selectedFilters.length === 0 && !searchQuery) return "All Emails";
    const labels = selectedFilters.map((f) => FILTER_LABELS[f] || f);
    if (searchQuery) labels.push(`"${searchQuery}"`);
    return labels.join(", ");
  };

<<<<<<< HEAD
  const hasActiveFilter = selectedFilters.length > 0 || !!searchQuery;

  // ── Scenario 1 + 2: When filters change, fetch first page THEN auto-load all pages
  useEffect(() => {
    const q = currentQuery() || undefined;
    fetchEmails(50, true, q)
      .then(() => loadAllRef.current(q))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, searchQuery]);

  // ── Top senders (derived) ──────────────────────────────────────────────────
=======
  // ── Auto-fetch all pages when filters change ──────────────────────────────
  useEffect(() => {
    const finalQuery = currentQuery() || undefined;
    fetchEmails(50, true, finalQuery)
      .then(() => loadAllEmails(finalQuery))
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, searchQuery]);

  // ── Top senders (derived from loaded emails) ──────────────────────────────
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
  const allSenders = Object.values(
    emails.reduce((acc, email) => {
      const key = `sender:${email.senderEmail}`;
      if (!acc[key]) acc[key] = { id: key, label: email.sender, count: 0 };
      acc[key].count++;
      return acc;
    }, {} as Record<string, { id: string; label: string; count: number }>)
  )
    .sort((a, b) => b.count - a.count)
    .map(({ id, label }) => ({ id, label }));

<<<<<<< HEAD
  // ── Category counts ────────────────────────────────────────────────────────
=======
  // ── Category counts for charts ─────────────────────────────────────────────
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
  const categoryCounts = emails.reduce((acc, email) => {
    acc[email.category] = (acc[email.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

<<<<<<< HEAD
  // ── Refresh ────────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    try {
      const q = currentQuery() || undefined;
      await fetchEmails(50, true, q);
      await loadAllEmails(q);
      await fetchStats();
=======
  // ── Refresh ───────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    try {
      const q = currentQuery() || undefined;
      await Promise.all([fetchEmails(50, true, q), fetchStats()]);
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
      toast({ title: "Refreshed", description: "Email list updated." });
    } catch {
      toast({
        title: "Error",
        description: error || "Failed to refresh emails.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

<<<<<<< HEAD
  // ── Selected-email actions ─────────────────────────────────────────────────
=======
  // ── Selected-email actions (small sets) ───────────────────────────────────
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
  const handleDelete = async () => {
    if (selectedEmails.length === 0) return;
    try {
      const result = await trashEmails(selectedEmails);
      toast({ title: "Moved to Trash", description: `${result.trashedCount} email(s) moved to trash.` });
      setSelectedEmails([]);
<<<<<<< HEAD
      const q = currentQuery() || undefined;
      fetchEmails(50, true, q).then(() => loadAllEmails(q)).catch(console.error);
=======
      fetchEmails(50, true, currentQuery() || undefined).catch(console.error);
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
    } catch {
      toast({ title: "Error", description: "Failed to move emails to trash.", variant: "destructive" });
    }
  };

  const handleArchive = async () => {
    if (selectedEmails.length === 0) return;
    try {
      const result = await archiveEmails(selectedEmails);
      toast({ title: "Archived", description: `${result.archivedCount} email(s) archived.` });
      setSelectedEmails([]);
      fetchEmails(50, true, currentQuery() || undefined).catch(console.error);
    } catch {
      toast({ title: "Error", description: "Failed to archive emails.", variant: "destructive" });
    }
  };

  const handleMarkRead = async () => {
    if (selectedEmails.length === 0) return;
    try {
      const result = await markAsRead(selectedEmails);
      toast({ title: "Marked as Read", description: `${result.markedCount} email(s) marked as read.` });
      setSelectedEmails([]);
      fetchEmails(50, true, currentQuery() || undefined).catch(console.error);
    } catch {
      toast({ title: "Error", description: "Failed to mark emails as read.", variant: "destructive" });
    }
  };

<<<<<<< HEAD
  // ── Scenario 3 + 4: Trash All ─────────────────────────────────────────────
  const handleTrashAllRequest = () => {
    if (emails.length === 0) return;
    setTrashAllOpen(true);
  };

  const handleTrashAllConfirm = async () => {
    setTrashAllOpen(false);
    const q = currentQuery();
    if (!q) return;

    try {
      const result = await trashAllByQuery(q);
      toast({
        title: "✅ Done — Moved to Trash",
        description: `${result.trashedCount.toLocaleString()} email(s) moved to Gmail Trash.`,
        duration: 6000,
      });
      setTimeout(() => {
        toast({
          title: "🗑️ Don't forget Gmail Trash",
          description:
            "Emails sit in Trash for 30 days before auto-deletion. Go to Gmail → Trash → 'Empty Trash Now' to free storage immediately.",
          duration: 12000,
        });
      }, 1500);
      setSelectedEmails([]);
      fetchStats().catch(console.error);
    } catch {
      toast({
        title: "Error",
        description: "Failed to move emails to trash. Please try again.",
        variant: "destructive",
      });
    }
  };

=======
  // ── Bulk delete all (via new scalable path) ────────────────────────────────
  const handleDeleteAll = () => {
    const q = currentQuery();
    if (!q && emails.length === 0) return; // nothing to delete
    setBulkModalOpen(true);
  };

  const handleBulkConfirm = () => {
    const q = currentQuery();
    runBulkDelete(q || undefined, (deletedCount) => {
      // Primary success toast
      toast({
        title: "✅ Moved to Trash",
        description: `${deletedCount.toLocaleString()} email(s) moved to Gmail Trash.`,
        duration: 5000,
      });
      // Follow-up reminder about Gmail Trash
      setTimeout(() => {
        toast({
          title: "🗑️ Don't forget Gmail Trash",
          description:
            "Emails are in your Gmail Trash. Delete them there to free storage instantly, or they'll auto-delete in 30 days.",
          duration: 12000,
        });
      }, 1500);
      setSelectedEmails([]);
      // Refresh display list after bulk delete
      fetchEmails(50, true, q || undefined).catch(console.error);
      fetchStats().catch(console.error);
    });
  };

  const handleBulkModalClose = () => {
    if (bulkProgress.phase === "fetching" || bulkProgress.phase === "deleting") return;
    setBulkModalOpen(false);
    resetBulk();
  };

  // ── Overview suggestion click ─────────────────────────────────────────────
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
  const handleSuggestionClick = (filterId: string) => {
    setActiveTab("emails");
    setSelectedFilters([filterId]);
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const isBuffering = loading || loadingMore;
  const hasActiveFilter = selectedFilters.length > 0 || !!searchQuery;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <FilterSidebar
                  selectedFilters={selectedFilters}
                  onFilterChange={setSelectedFilters}
                  topSenders={allSenders}
                />
              </SheetContent>
            </Sheet>
            <Mail className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground hidden sm:inline">
              Smart Gmail Cleaner
            </span>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background border border-border text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-foreground truncate max-w-[150px]">
                {user?.email || "user@gmail.com"}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

<<<<<<< HEAD
      {/* ── Tab Navigation ──────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6">
            {(["overview", "emails"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
=======
      {/* ── Tab Navigation ─────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("emails")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "emails"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Emails
            </button>
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
          </nav>
        </div>
      </div>

<<<<<<< HEAD
      {/* ── Main Content ────────────────────────────────────────────────────── */}
=======
      {/* ── Main Content ───────────────────────────────────────────────────── */}
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
      <main className="container mx-auto px-4 py-6">
        {activeTab === "overview" ? (
          <div className="space-y-6">
            {/* Stats grid */}
            <div
              className={`grid sm:grid-cols-2 ${
                stats?.storageUsed ? "lg:grid-cols-3" : "lg:grid-cols-2"
              } gap-4`}
            >
              <StatCard
                title="Total Emails"
                value={stats?.totalEmails?.toLocaleString() || emails.length.toString()}
                icon={Inbox}
                description="In your inbox"
              />
              <StatCard
                title="Social"
                value={
                  stats?.categories.social?.toLocaleString() ||
                  categoryCounts["Social"]?.toString() ||
                  "0"
                }
                icon={Users}
                description={`${
                  stats?.categories.social
                    ? Math.round((stats.categories.social / (stats.totalEmails || 1)) * 100)
                    : 0
                }% of inbox`}
              />
              {stats?.storageUsed && (
                <StatCard
                  title="Storage Used"
                  value={stats.storageUsed}
                  icon={HardDrive}
                  description="of 15 GB"
                />
              )}
            </div>

            {/* Charts */}
<<<<<<< HEAD
            <div className={`grid ${stats?.storageUsed ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-6`}>
=======
            <div
              className={`grid ${stats?.storageUsed ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-6`}
            >
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
              <CategoryChart categoryCounts={stats?.categories} />
              {stats?.storageUsed && <StorageChart />}
            </div>

            {/* Health + Insights */}
            <div className="grid lg:grid-cols-2 gap-6">
              <InboxHealthCard stats={stats} />
              <QuickInsights
                stats={stats}
                emailCount={emails.length}
                onApplyFilter={handleSuggestionClick}
              />
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar – desktop */}
            <div className="hidden md:block">
              <FilterSidebar
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
                topSenders={allSenders}
              />
            </div>

            {/* Email list + actions */}
            <div className="flex-1 space-y-4">
<<<<<<< HEAD
              {/* Selection action bar (only when emails are checked) */}
=======
              {/*
               * BulkActionBar
               * ─ Shows selection actions when emails are checked
               * ─ "Delete All" opens the BulkDeleteModal (scalable path)
               */}
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
              <BulkActionBar
                selectedCount={selectedEmails.length}
                hasActiveFilter={hasActiveFilter}
                deleting={deleting}
                onClearSelection={() => setSelectedEmails([])}
                onDelete={handleDelete}
                onDeleteAll={handleTrashAllRequest}
                onArchive={handleArchive}
                onMarkRead={handleMarkRead}
              />

<<<<<<< HEAD
              {/* Email list — handles all 4 stages internally */}
              <EmailList
=======
              {/*
               * VirtualEmailList
               * ─ Renders only a windowed slice of the email list (no DOM bloat)
               * ─ Shows buffering overlay while pages are still loading
               * ─ Shows "Trash All" sticky footer once all emails are loaded
               */}
              <VirtualEmailList
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
                emails={emails}
                selectedEmails={selectedEmails}
                onSelectionChange={setSelectedEmails}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                hasActiveFilter={hasActiveFilter}
                deleting={deleting}
                onLoadMore={() => loadMoreEmails(currentQuery())}
<<<<<<< HEAD
                onTrashAll={hasActiveFilter ? handleTrashAllRequest : undefined}
=======
                isBuffering={isBuffering}
                hasActiveFilter={hasActiveFilter}
                onDeleteAll={handleDeleteAll}
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
              />
            </div>
          </div>
        )}
      </main>

<<<<<<< HEAD
      {/* ── Trash All Confirmation Dialog ───────────────────────────────────── */}
      <AlertDialog open={trashAllOpen} onOpenChange={setTrashAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move all emails to Trash?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  You are about to move{" "}
                  <span className="font-semibold text-foreground">
                    {emails.length.toLocaleString()} email
                    {emails.length !== 1 ? "s" : ""}
                  </span>{" "}
                  matching{" "}
                  <span className="font-semibold text-foreground">{filterLabel()}</span> to
                  Gmail Trash.
                </p>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>Emails will sit in Trash for 30 days before permanent deletion.</li>
                  <li>You can restore them from Gmail Trash during that window.</li>
                  <li>To free storage immediately, empty Trash in Gmail afterward.</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTrashAllConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Yes, Trash All {emails.length.toLocaleString()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
=======
      {/*
       * BulkDeleteModal
       * ─ Screen 1: confirmation with warnings
       * ─ Screen 2: live progress (phase + batch counter + stats grid)
       * ─ Cannot be dismissed while deletion is running
       */}
      <BulkDeleteModal
        open={bulkModalOpen}
        filterLabel={filterLabel()}
        progress={bulkProgress}
        onConfirm={handleBulkConfirm}
        onClose={handleBulkModalClose}
      />
>>>>>>> 3d26f21f92083472fe0046b5fa768114c91da1f4
    </div>
  );
};

export default Dashboard;
