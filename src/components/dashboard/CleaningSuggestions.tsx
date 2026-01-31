import { Trash2, Archive, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const suggestions = [
  {
    id: 1,
    icon: Clock,
    title: "Old Emails",
    description: "Delete 1,234 emails older than 3 years",
    count: 1234,
    action: "Clean",
    variant: "destructive" as const,
  },
  {
    id: 2,
    icon: Tag,
    title: "Promotional Emails",
    description: "Remove 2,100 shopping and promotional emails",
    count: 2100,
    action: "Clean",
    variant: "default" as const,
  },
  {
    id: 3,
    icon: Archive,
    title: "Newsletter Archive",
    description: "Archive 560 old newsletter emails",
    count: 560,
    action: "Archive",
    variant: "secondary" as const,
  },
  {
    id: 4,
    icon: Trash2,
    title: "Bulk Senders",
    description: "Clean emails from 15 frequent bulk senders",
    count: 890,
    action: "Review",
    variant: "outline" as const,
  },
];

const CleaningSuggestions = () => {
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
            <Button variant={suggestion.variant} size="sm">
              {suggestion.action}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CleaningSuggestions;
