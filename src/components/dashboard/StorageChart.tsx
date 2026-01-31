import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const storageData = [
  { category: "Attachments", size: "4.2 GB", percentage: 56 },
  { category: "Promotions", size: "1.8 GB", percentage: 24 },
  { category: "Personal", size: "850 MB", percentage: 11 },
  { category: "Work", size: "450 MB", percentage: 6 },
  { category: "Other", size: "200 MB", percentage: 3 },
];

const StorageChart = () => {
  const totalUsed = 7.5;
  const totalAvailable = 15;
  const percentageUsed = (totalUsed / totalAvailable) * 100;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Storage Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Used</span>
            <span className="font-medium text-foreground">{totalUsed} GB / {totalAvailable} GB</span>
          </div>
          <Progress value={percentageUsed} className="h-2" />
        </div>

        <div className="space-y-3">
          {storageData.map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" />
                <span className="text-sm text-foreground">{item.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{item.size}</span>
                <span className="text-sm font-medium text-foreground w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageChart;
