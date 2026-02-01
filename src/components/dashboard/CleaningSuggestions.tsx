import { Trash2, Archive, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GmailStats } from "@/hooks/useGmailApi";

interface CleaningSuggestionsProps {
  stats: GmailStats | null;
  onApplyFilter: (filterId: string) => void;
}

const CleaningSuggestions = ({ stats, onApplyFilter }: CleaningSuggestionsProps) => {
  const suggestions = [
    {
      id: 1,
      icon: Clock,
      title: "Old Emails",
      description: "Clean emails older than 3 years to free up space",
      count: null,
      action: "Clean",
      variant: "destructive" as const,
      filterId: "3years"
    },
    {
      id: 2,
      icon: Tag,
      title: "Promotional Emails",
      description: `Remove ${stats?.categories.promotions.toLocaleString() || "shopping"} promotional emails`,
      count: stats?.categories.promotions || 0,
      action: "Clean",
      variant: "default" as const,
      filterId: "promotions"
    },
    {
      id: 3,
      icon: Archive,
      title: "Social Notifications",
      description: `Archive ${stats?.categories.social.toLocaleString() || "social"} notification emails`,
      count: stats?.categories.social || 0,
      action: "Archive",
      variant: "secondary" as const,
      filterId: "social"
    },
    {
      id: 4,
      icon: Trash2,
      title: "Unread Clutter",
      description: `Review ${stats?.unread.toLocaleString() || "unread"} unread emails`,
      count: stats?.unread || 0,
      action: "Review",
      variant: "outline" as const,
      filterId: "unread"
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Smart Cleaning Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-center justify-between p-4 bg-background border border-border hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-card border border-border">
                <suggestion.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{suggestion.title}</p>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {suggestion.count !== null && suggestion.count > 0 && (
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline">{suggestion.count}</span>
              )}
              <Button
                variant={suggestion.variant}
                size="sm"
                onClick={() => onApplyFilter(suggestion.filterId)}
              >
                {suggestion.action}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CleaningSuggestions;
