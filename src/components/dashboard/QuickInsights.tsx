import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GmailStats } from "@/hooks/useGmailApi";
import {
  Tag,
  Users,
  Rss,
  MessageSquare,
  Paperclip,
  Clock,
  ArrowRight,
} from "lucide-react";

interface QuickInsightsProps {
  stats: GmailStats | null;
  emailCount: number;
  onApplyFilter: (filterId: string) => void;
}

const QuickInsights = ({ stats, emailCount, onApplyFilter }: QuickInsightsProps) => {
  if (!stats) return null;

  const insights = [
    {
      icon: Tag,
      label: "Promotions",
      value: stats.categories.promotions.toLocaleString(),
      sub: "marketing & offers",
      filterId: "promotions",
      accent: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      icon: Users,
      label: "Social",
      value: stats.categories.social.toLocaleString(),
      sub: "social network alerts",
      filterId: "social",
      accent: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Rss,
      label: "Updates",
      value: stats.categories.updates.toLocaleString(),
      sub: "newsletters & digests",
      filterId: "newsletters",
      accent: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: MessageSquare,
      label: "Forums",
      value: stats.categories.forums.toLocaleString(),
      sub: "forum threads",
      filterId: "forums",
      accent: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Paperclip,
      label: "Attachments",
      value: stats.attachments?.toLocaleString() ?? "—",
      sub: "emails with files",
      filterId: "attachments",
      accent: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      icon: Clock,
      label: "Unread",
      value: stats.unread?.toLocaleString() ?? "—",
      sub: "need your attention",
      filterId: "unread",
      accent: "text-slate-500",
      bg: "bg-slate-500/10",
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Quick Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {insights.map((item) => (
            <button
              key={item.label}
              onClick={() => onApplyFilter(item.filterId)}
              className="group flex flex-col gap-2 p-4 rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all text-left bg-background"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                <item.icon className={`h-4 w-4 ${item.accent}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground leading-tight">{item.value}</p>
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-primary">View emails</span>
                <ArrowRight className="h-3 w-3 text-primary" />
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickInsights;
