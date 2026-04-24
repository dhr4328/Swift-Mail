import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = [
  { bg: "hsl(var(--chart-1))", light: "hsl(var(--chart-1) / 0.15)" },
  { bg: "hsl(var(--chart-2))", light: "hsl(var(--chart-2) / 0.15)" },
  { bg: "hsl(var(--chart-3))", light: "hsl(var(--chart-3) / 0.15)" },
  { bg: "hsl(var(--chart-4))", light: "hsl(var(--chart-4) / 0.15)" },
  { bg: "hsl(var(--chart-5))", light: "hsl(var(--chart-5) / 0.15)" },
];

interface CategoryChartProps {
  categoryCounts?: {
    promotions: number;
    social: number;
    updates: number;
    forums: number;
    personal: number;
  } | Record<string, number>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
        <p className="font-semibold text-foreground">{d.name}</p>
        <p className="text-muted-foreground">{d.value.toLocaleString()} emails</p>
        <p className="text-muted-foreground">{d.pct}% of inbox</p>
      </div>
    );
  }
  return null;
};

const CategoryChart = ({ categoryCounts }: CategoryChartProps) => {
  let rawData: { name: string; value: number }[] = [];

  if (categoryCounts) {
    if ("promotions" in categoryCounts && typeof categoryCounts.promotions === "number") {
      const s = categoryCounts as any;
      rawData = [
        { name: "Personal", value: s.personal },
        { name: "Promotions", value: s.promotions },
        { name: "Social", value: s.social },
        { name: "Updates", value: s.updates },
        { name: "Forums", value: s.forums },
      ].filter((d) => d.value > 0);
    } else {
      rawData = Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .filter((d) => d.value > 0);
    }
  }

  const total = rawData.reduce((s, d) => s + d.value, 0);
  const data = rawData
    .map((d) => ({ ...d, pct: total > 0 ? Math.round((d.value / total) * 100) : 0 }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Email Categories</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          No category data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Email Categories</CardTitle>
          <span className="text-sm text-muted-foreground">{total.toLocaleString()} total</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Horizontal Bar Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              barCategoryGap="30%"
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length].bg} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pills with percentage */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: COLORS[index % COLORS.length].light }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length].bg }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.pct}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
