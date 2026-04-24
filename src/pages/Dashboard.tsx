import { useState, useEffect } from "react";
import { Mail, Inbox, Users, Paperclip, HardDrive, LogOut, Search, Menu, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useGmailApi } from "@/hooks/useGmailApi";
import StatCard from "@/components/dashboard/StatCard";
import CategoryChart from "@/components/dashboard/CategoryChart";
import StorageChart from "@/components/dashboard/StorageChart";
import InboxHealthCard from "@/components/dashboard/InboxHealthCard";
import QuickInsights from "@/components/dashboard/QuickInsights";
import FilterSidebar from "@/components/dashboard/FilterSidebar";
import EmailList from "@/components/dashboard/EmailList";
import BulkActionBar from "@/components/dashboard/BulkActionBar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { emails, stats, loading, loadingMore, error, hasMore, fetchEmails, loadMoreEmails, loadAllEmails, fetchStats, trashEmails, archiveEmails, markAsRead } = useGmailApi();

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "emails">("overview");

  // Fetch data on mount
  useEffect(() => {
    fetchStats().catch(console.error);
  }, [fetchStats]);

  // Calculate top senders
  const topSenders = emails.reduce((acc, email) => {
    const sender = email.sender;
    const emailAddr = email.senderEmail;
    const key = `sender:${emailAddr}`;
    if (!acc[key]) {
      acc[key] = { id: key, label: sender, count: 0 };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { id: string; label: string; count: number }>);

  const allSenders = Object.values(topSenders)
    .sort((a, b) => b.count - a.count)
    .map(({ id, label }) => ({ id, label }));

  // Construct Gmail query from filters
  const buildGmailQuery = (filters: string[]) => {
    if (filters.length === 0) return undefined;

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
      "older": "older_than:1y",
      "2years": "older_than:2y",
      "3years": "older_than:3y",
    };

    const categories = filters.filter(f => categoryMap[f]).map(f => categoryMap[f]);
    const types = filters.filter(f => typeMap[f]).map(f => typeMap[f]);
    const times = filters.filter(f => timeMap[f]).map(f => timeMap[f]);
    const senders = filters.filter(f => f.startsWith("sender:")).map(f => `from:${f.split(":")[1]}`);

    // Combine logic: Categories with OR, others with AND
    let queryParts = [];

    if (categories.length > 0) {
      if (categories.length > 1) {
        queryParts.push(`{${categories.join(" ")}}`); // {cat1 cat2} means OR in Gmail search
      } else {
        queryParts.push(categories[0]);
      }
    }

    if (types.length > 0) queryParts.push(...types);
    if (times.length > 0) queryParts.push(...times);
    if (senders.length > 0) {
      if (senders.length > 1) {
        queryParts.push(`{${senders.join(" ")}}`); // OR for multiple senders
      } else {
        queryParts.push(senders[0]);
      }
    }

    return queryParts.join(" ");
  };

  // ... rest of UseEffect ...

  // ... inside render ...


  // Fetch emails when filters or search query changes
  useEffect(() => {
    const filterQuery = buildGmailQuery(selectedFilters);
    // Combine filter query with search bar query if both exist
    let finalQuery = filterQuery;
    if (searchQuery) {
      finalQuery = finalQuery ? `${finalQuery} ${searchQuery}` : searchQuery;
    }

    // Debounce could be added here if needed, but for now direct call
    fetchEmails(50, true, finalQuery).catch(console.error);
  }, [fetchEmails, selectedFilters, searchQuery]); // Added searchQuery to dependency to trigger server-side search

  const handleRefresh = async () => {
    try {
      const query = buildGmailQuery(selectedFilters);
      await Promise.all([fetchEmails(50, true, query ? (searchQuery ? `${query} ${searchQuery}` : query) : searchQuery), fetchStats()]);
      toast({
        title: "Refreshed",
        description: "Email list updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: error || "Failed to refresh emails.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const currentQuery = () => {
    const q = buildGmailQuery(selectedFilters);
    return q ? (searchQuery ? `${q} ${searchQuery}` : q) : searchQuery;
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleDelete = async () => {
    if (selectedEmails.length === 0) return;

    try {
      const result = await trashEmails(selectedEmails);
      toast({
        title: "Moved to Trash",
        description: `${result.trashedCount} email(s) moved to trash.`,
      });
      setSelectedEmails([]);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to move emails to trash.",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async () => {
    if (selectedEmails.length === 0) return;

    try {
      const result = await archiveEmails(selectedEmails);
      toast({
        title: "Archived",
        description: `${result.archivedCount} email(s) archived successfully.`,
      });
      setSelectedEmails([]);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to archive emails.",
        variant: "destructive",
      });
    }
  };

  const handleMarkRead = async () => {
    if (selectedEmails.length === 0) return;

    try {
      const result = await markAsRead(selectedEmails);
      toast({
        title: "Marked as Read",
        description: `${result.markedCount} email(s) marked as read.`,
      });
      setSelectedEmails([]);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to mark emails as read.",
        variant: "destructive",
      });
    }
  };

  // Filter emails based on search query - REMOVE client side filtering since we do server side now
  // OR keep it for instant feedback on loaded items, but usually better to rely on server for consistency
  // For now I'll just pass `emails` strictly since `fetchEmails` handles the filtering
  const filteredEmails = emails;

  // Calculate category counts for charts
  const categoryCounts = emails.reduce((acc, email) => {
    acc[email.category] = (acc[email.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSuggestionClick = (filterId: string) => {
    setActiveTab("emails");
    setSelectedFilters([filterId]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "emails" && hasMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAllEmails(currentQuery())}
                disabled={loading || loadingMore}
                className="hidden sm:flex items-center gap-2 mr-2"
              >
                <RefreshCw className={`h-3 w-3 ${loadingMore ? 'animate-spin' : ''}`} />
                {loadingMore ? 'Loading All...' : 'Load All'}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background border border-border text-sm">
              <div className="w-2 h-2 bg-success rounded-full" />
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

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "overview"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("emails")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "emails"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              Emails
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === "overview" ? (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className={`grid sm:grid-cols-2 ${stats?.storageUsed ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
              <StatCard
                title="Total Emails"
                value={stats?.totalEmails?.toLocaleString() || emails.length.toString()}
                icon={Inbox}
                description="In your inbox"
              />
              <StatCard
                title="Social"
                value={stats?.categories.social?.toLocaleString() || categoryCounts['Social']?.toString() || "0"}
                icon={Users}
                description={`${stats?.categories.social ? Math.round((stats.categories.social / (stats.totalEmails || 1)) * 100) : 0}% of inbox`}
              />
              <StatCard
                title="With Attachments"
                value={(stats?.attachments ?? emails.filter(e => e.hasAttachment).length).toLocaleString()}
                icon={Paperclip}
                description="Files in emails"
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

            {/* Charts Row */}
            <div className={`grid ${stats?.storageUsed ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
              <CategoryChart categoryCounts={stats?.categories} />
              {stats?.storageUsed && <StorageChart />}
            </div>

            {/* Inbox Health + Quick Insights */}
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
            {/* Sidebar - Desktop */}
            <div className="hidden md:block">
              <FilterSidebar
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
                topSenders={allSenders}
              />
            </div>

            {/* Email List */}
            <div className="flex-1 space-y-4">
              {/* Mobile Load All Button */}
              <div className="md:hidden flex justify-end">
                {hasMore && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAllEmails(currentQuery())}
                    disabled={loading || loadingMore}
                    className="w-full"
                  >
                    {loadingMore ? 'Loading All...' : 'Load All Emails'}
                  </Button>
                )}
              </div>
              <BulkActionBar
                selectedCount={selectedEmails.length}
                onClearSelection={() => setSelectedEmails([])}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onMarkRead={handleMarkRead}
              />
              <EmailList
                emails={filteredEmails}
                selectedEmails={selectedEmails}
                onSelectionChange={setSelectedEmails}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onLoadMore={() => loadMoreEmails(currentQuery())}
                onLoadAll={() => loadAllEmails(currentQuery())}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
