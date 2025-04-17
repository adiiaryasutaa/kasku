import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function monthlyIncomeWidget({
  monthlyIncome,
}: {
  monthlyIncome: number;
}) {
  return (
    <Card className="flex items-center p-4">
      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
      <CardContent className="p-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monthly Income
        </p>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          $
          {monthlyIncome.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h3>
        <p className="text-xs text-green-600 dark:text-green-400">
          +15% from last month
        </p>
      </CardContent>
    </Card>
  );
}
