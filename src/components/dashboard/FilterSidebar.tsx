import { useState } from "react";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FilterGroup {
  name: string;
  options: { id: string; label: string }[];
}

const filterGroups: FilterGroup[] = [
  {
    name: "Categories",
    options: [
      { id: "personal", label: "Personal" },
      { id: "work", label: "Work" },
      { id: "promotions", label: "Promotions" },
      { id: "newsletters", label: "Newsletters" },
      { id: "social", label: "Social Media" },
      { id: "finance", label: "Finance" },
      { id: "spam", label: "Spam-like" },
    ],
  },
  {
    name: "Time Period",
    options: [
      { id: "1month", label: "Last month" },
      { id: "6months", label: "Last 6 months" },
      { id: "1year", label: "Last year" },
      { id: "older", label: "Older than 1 year" },
      { id: "2years", label: "Older than 2 years" },
      { id: "3years", label: "Older than 3 years" },
    ],
  },
  {
    name: "Email Type",
    options: [
      { id: "unread", label: "Unread" },
      { id: "attachments", label: "With attachments" },
      { id: "large", label: "Large (>5MB)" },
      { id: "starred", label: "Starred" },
    ],
  },
];

interface FilterSidebarProps {
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  topSenders?: { id: string; label: string }[];
}

const FilterSidebar = ({ selectedFilters, onFilterChange, topSenders = [] }: FilterSidebarProps) => {
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const allGroups = [
    ...filterGroups,
    ...(topSenders.length > 0 ? [{
      name: "Senders",
      options: topSenders
    }] : [])
  ];

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

      {allGroups.map((group) => (
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
          <CollapsibleContent className={`space-y-2 pt-1 ${group.name === "Senders" ? "max-h-80 overflow-y-auto pr-1" : ""}`}>
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
              </label>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default FilterSidebar;
