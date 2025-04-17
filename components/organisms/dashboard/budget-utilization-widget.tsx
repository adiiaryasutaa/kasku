import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function budgetUtilizationWidget({
  budgetUtilization,
  totalBudget,
}: {
  budgetUtilization: number;
  totalBudget: number;
}) {
  return (
    <Card className="flex items-center p-4">
      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
        <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      </div>
      <CardContent className="p-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Budget Utilization
        </p>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {budgetUtilization}%
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Budget: $
          {totalBudget.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </CardContent>
    </Card>
  );
}
