import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
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

const CategoryChart = ({ categoryCounts }: CategoryChartProps) => {
  let data: { name: string; value: number; color: string }[] = [];

  if (categoryCounts) {
    // Check if it's the specific structure we expect from backend
    if ('promotions' in categoryCounts && typeof categoryCounts.promotions === 'number') {
      const stats = categoryCounts as {
        promotions: number;
        social: number;
        updates: number;
        forums: number;
        personal: number;
      };
      data = [
        { name: "Personal", value: stats.personal, color: chartColors[0] },
        { name: "Promotions", value: stats.promotions, color: chartColors[1] },
        { name: "Social", value: stats.social, color: chartColors[2] },
        { name: "Updates", value: stats.updates, color: chartColors[3] },
        { name: "Forums", value: stats.forums, color: chartColors[4] },
      ].filter(item => item.value > 0);
    } else {
      // Fallback for the old Record<string, number> if used elsewhere
      data = Object.entries(categoryCounts).map(([name, value], index) => ({
        name,
        value,
        color: chartColors[index % chartColors.length],
      }));
    }
  }

  // If no data, show a placeholder or empty state
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
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Email Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0",
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
