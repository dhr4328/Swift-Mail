import { useState } from "react";
import { Mail, Inbox, AlertTriangle, HardDrive, LogOut, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/dashboard/StatCard";
import CategoryChart from "@/components/dashboard/CategoryChart";
import StorageChart from "@/components/dashboard/StorageChart";
import CleaningSuggestions from "@/components/dashboard/CleaningSuggestions";
import FilterSidebar from "@/components/dashboard/FilterSidebar";
import EmailList from "@/components/dashboard/EmailList";
import BulkActionBar from "@/components/dashboard/BulkActionBar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "emails">("overview");

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleDelete = () => {
    toast({
      title: "Moved to Trash",
      description: `${selectedEmails.length} email(s) moved to trash. Undo?`,
      action: (
        <Button variant="outline" size="sm" onClick={() => setSelectedEmails([])}>
          Undo
        </Button>
      ),
    });
    setSelectedEmails([]);
  };

  const handleArchive = () => {
    toast({
      title: "Archived",
      description: `${selectedEmails.length} email(s) archived successfully.`,
    });
    setSelectedEmails([]);
  };

  const handleMarkRead = () => {
    toast({
      title: "Marked as Read",
      description: `${selectedEmails.length} email(s) marked as read.`,
    });
    setSelectedEmails([]);
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
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === "overview" ? (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Emails"
                value="5,130"
                icon={Inbox}
                description="In your inbox"
              />
              <StatCard
                title="Promotions"
                value="2,100"
                icon={Mail}
                description="40.9% of inbox"
                trend={{ value: 12, positive: false }}
              />
              <StatCard
                title="Spam-like"
                value="420"
                icon={AlertTriangle}
                description="Needs attention"
              />
              <StatCard
                title="Storage Used"
                value="7.5 GB"
                icon={HardDrive}
                description="of 15 GB"
              />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <CategoryChart />
              <StorageChart />
            </div>

            {/* Cleaning Suggestions */}
            <CleaningSuggestions />
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar - Desktop */}
            <div className="hidden md:block">
              <FilterSidebar
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
              />
            </div>

            {/* Email List */}
            <div className="flex-1 space-y-4">
              <BulkActionBar
                selectedCount={selectedEmails.length}
                onClearSelection={() => setSelectedEmails([])}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onMarkRead={handleMarkRead}
              />
              <EmailList
                selectedEmails={selectedEmails}
                onSelectionChange={setSelectedEmails}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
