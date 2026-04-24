import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GmailStats } from "@/hooks/useGmailApi";
import { ShieldCheck, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface InboxHealthCardProps {
  stats: GmailStats | null;
}

const InboxHealthCard = ({ stats }: InboxHealthCardProps) => {
  if (!stats) return null;

  const total = stats.totalEmails || 1;
  const unreadRate = Math.round((stats.unread / total) * 100);
  const promoRate = Math.round((stats.categories.promotions / total) * 100);
  const personalRate = Math.round((stats.categories.personal / total) * 100);

  // Score: higher personal %, lower unread %, lower promo % = better score
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        personalRate * 0.5 +
          (100 - unreadRate) * 0.3 +
          (100 - promoRate) * 0.2
      )
    )
  );

  const getGrade = () => {
    if (score >= 80) return { label: "Excellent", color: "text-emerald-500", ring: "stroke-emerald-500" };
    if (score >= 60) return { label: "Good", color: "text-blue-500", ring: "stroke-blue-500" };
    if (score >= 40) return { label: "Fair", color: "text-amber-500", ring: "stroke-amber-500" };
    return { label: "Needs Attention", color: "text-red-500", ring: "stroke-red-500" };
  };

  const grade = getGrade();

  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (score / 100) * circumference;

  const metrics = [
    {
      label: "Personal Mail",
      value: `${personalRate}%`,
      icon: personalRate >= 30 ? TrendingUp : TrendingDown,
      positive: personalRate >= 30,
    },
    {
      label: "Read Rate",
      value: `${100 - unreadRate}%`,
      icon: unreadRate <= 30 ? TrendingUp : TrendingDown,
      positive: unreadRate <= 30,
    },
    {
      label: "Promo Clutter",
      value: `${promoRate}%`,
      icon: promoRate <= 30 ? Minus : TrendingUp,
      positive: promoRate <= 30,
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Inbox Health Score</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Score Ring */}
          <div className="relative flex-shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className={`transition-all duration-700 ${grade.ring}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${grade.color}`}>{score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center gap-2">
              <span className={`text-base font-semibold ${grade.color}`}>{grade.label}</span>
            </div>
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <div className="flex items-center gap-1.5">
                  <m.icon
                    className={`h-3.5 w-3.5 ${m.positive ? "text-emerald-500" : "text-red-500"}`}
                  />
                  <span className="text-sm font-medium text-foreground">{m.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InboxHealthCard;
