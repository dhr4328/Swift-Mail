import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Star, StarIcon } from "lucide-react";

interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  date: string;
  category: string;
  size: string;
  hasAttachment: boolean;
  isStarred: boolean;
  isRead: boolean;
}

const mockEmails: Email[] = [
  {
    id: "1",
    sender: "Amazon",
    senderEmail: "noreply@amazon.com",
    subject: "Your order has shipped!",
    preview: "Track your package - expected delivery...",
    date: "2 hours ago",
    category: "Promotions",
    size: "124 KB",
    hasAttachment: false,
    isStarred: false,
    isRead: true,
  },
  {
    id: "2",
    sender: "LinkedIn",
    senderEmail: "notifications@linkedin.com",
    subject: "You have 5 new connection requests",
    preview: "John Doe and 4 others want to connect...",
    date: "5 hours ago",
    category: "Social",
    size: "89 KB",
    hasAttachment: false,
    isStarred: false,
    isRead: false,
  },
  {
    id: "3",
    sender: "Sarah Johnson",
    senderEmail: "sarah.j@company.com",
    subject: "Q4 Report - Review needed",
    preview: "Hi, please review the attached Q4 report...",
    date: "Yesterday",
    category: "Work",
    size: "2.4 MB",
    hasAttachment: true,
    isStarred: true,
    isRead: true,
  },
  {
    id: "4",
    sender: "Substack",
    senderEmail: "newsletter@substack.com",
    subject: "Weekly digest: Top stories this week",
    preview: "This week in tech: AI developments and more...",
    date: "2 days ago",
    category: "Newsletters",
    size: "156 KB",
    hasAttachment: false,
    isStarred: false,
    isRead: true,
  },
  {
    id: "5",
    sender: "Chase Bank",
    senderEmail: "alerts@chase.com",
    subject: "Your monthly statement is ready",
    preview: "Your January statement is now available...",
    date: "3 days ago",
    category: "Finance",
    size: "890 KB",
    hasAttachment: true,
    isStarred: false,
    isRead: false,
  },
  {
    id: "6",
    sender: "Netflix",
    senderEmail: "info@netflix.com",
    subject: "New releases this week",
    preview: "Check out what's new on Netflix...",
    date: "4 days ago",
    category: "Promotions",
    size: "234 KB",
    hasAttachment: false,
    isStarred: false,
    isRead: true,
  },
];

const categoryColors: Record<string, string> = {
  Personal: "bg-primary/20 text-primary",
  Work: "bg-secondary/40 text-secondary-foreground",
  Promotions: "bg-muted/60 text-muted-foreground",
  Newsletters: "bg-accent text-accent-foreground",
  Social: "bg-primary/10 text-foreground",
  Finance: "bg-secondary/20 text-foreground",
};

interface EmailListProps {
  selectedEmails: string[];
  onSelectionChange: (emails: string[]) => void;
}

const EmailList = ({ selectedEmails, onSelectionChange }: EmailListProps) => {
  const toggleEmail = (emailId: string) => {
    onSelectionChange(
      selectedEmails.includes(emailId)
        ? selectedEmails.filter((id) => id !== emailId)
        : [...selectedEmails, emailId]
    );
  };

  const toggleAll = () => {
    if (selectedEmails.length === mockEmails.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(mockEmails.map((e) => e.id));
    }
  };

  return (
    <div className="flex-1 bg-card border border-border">
      {/* Table Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-background">
        <Checkbox
          checked={selectedEmails.length === mockEmails.length && mockEmails.length > 0}
          onCheckedChange={toggleAll}
        />
        <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
          <div className="col-span-3">Sender</div>
          <div className="col-span-5">Subject</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1 text-right">Size</div>
          <div className="col-span-1 text-right">Date</div>
        </div>
      </div>

      {/* Email Rows */}
      <div className="divide-y divide-border">
        {mockEmails.map((email) => (
          <div
            key={email.id}
            className={`flex items-center gap-4 px-4 py-3 hover:bg-background transition-colors cursor-pointer ${
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
              <div className="col-span-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${!email.isRead ? "font-semibold text-foreground" : "text-foreground"}`}>
                    {email.sender}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {email.senderEmail}
                  </p>
                </div>
                {email.isStarred && <Star className="h-4 w-4 text-warning fill-warning flex-shrink-0" />}
              </div>
              <div className="col-span-5 min-w-0">
                <div className="flex items-center gap-2">
                  {email.hasAttachment && <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  <p className={`text-sm truncate ${!email.isRead ? "font-semibold text-foreground" : "text-foreground"}`}>
                    {email.subject}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {email.preview}
                </p>
              </div>
              <div className="col-span-2">
                <Badge variant="secondary" className={categoryColors[email.category] || "bg-secondary text-secondary-foreground"}>
                  {email.category}
                </Badge>
              </div>
              <div className="col-span-1 text-right text-sm text-muted-foreground">
                {email.size}
              </div>
              <div className="col-span-1 text-right text-sm text-muted-foreground">
                {email.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailList;
