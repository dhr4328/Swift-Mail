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
  categoryCounts?: Record<string, number>;
}

const CategoryChart = ({ categoryCounts }: CategoryChartProps) => {
  const data = categoryCounts && Object.keys(categoryCounts).length > 0
    ? Object.entries(categoryCounts).map(([name, value], index) => ({
        name,
        value,
        color: chartColors[index % chartColors.length],
      }))
    : [
        { name: "Personal", value: 1240, color: chartColors[0] },
        { name: "Work", value: 890, color: chartColors[1] },
        { name: "Promotions", value: 2100, color: chartColors[2] },
        { name: "Newsletters", value: 560, color: chartColors[3] },
        { name: "Social", value: 340, color: chartColors[4] },
      ];

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
