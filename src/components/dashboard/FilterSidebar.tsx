import { useState } from "react";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FilterGroup {
  name: string;
  options: { id: string; label: string; count: number }[];
}

const filterGroups: FilterGroup[] = [
  {
    name: "Categories",
    options: [
      { id: "personal", label: "Personal", count: 1240 },
      { id: "work", label: "Work", count: 890 },
      { id: "promotions", label: "Promotions", count: 2100 },
      { id: "newsletters", label: "Newsletters", count: 560 },
      { id: "social", label: "Social Media", count: 340 },
      { id: "finance", label: "Finance", count: 180 },
      { id: "spam", label: "Spam-like", count: 420 },
    ],
  },
  {
    name: "Time Period",
    options: [
      { id: "1month", label: "Last month", count: 450 },
      { id: "3months", label: "Last 3 months", count: 1200 },
      { id: "6months", label: "Last 6 months", count: 2100 },
      { id: "1year", label: "Last year", count: 3500 },
      { id: "older", label: "Older than 1 year", count: 1630 },
    ],
  },
  {
    name: "Email Type",
    options: [
      { id: "unread", label: "Unread", count: 234 },
      { id: "attachments", label: "With attachments", count: 890 },
      { id: "large", label: "Large (>5MB)", count: 156 },
      { id: "starred", label: "Starred", count: 45 },
    ],
  },
];

interface FilterSidebarProps {
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

const FilterSidebar = ({ selectedFilters, onFilterChange }: FilterSidebarProps) => {
  const [openGroups, setOpenGroups] = useState<string[]>(["Categories"]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  const toggleFilter = (filterId: string) => {
    onFilterChange(
      selectedFilters.includes(filterId)
        ? selectedFilters.filter((f) => f !== filterId)
        : [...selectedFilters, filterId]
    );
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className="w-64 bg-card border-r border-border h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">Filters</span>
        </div>
        {selectedFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            Clear all
          </Button>
        )}
      </div>

      {filterGroups.map((group) => (
        <Collapsible
          key={group.name}
          open={openGroups.includes(group.name)}
          onOpenChange={() => toggleGroup(group.name)}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
            {group.name}
            {openGroups.includes(group.name) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-1">
            {group.options.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-background px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedFilters.includes(option.id)}
                    onCheckedChange={() => toggleFilter(option.id)}
                  />
                  <span className="text-sm text-foreground">{option.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{option.count}</span>
              </label>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default FilterSidebar;
