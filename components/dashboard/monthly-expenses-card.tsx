import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function TotalBalanceCard({
  monthlyExpenses,
}: {
  monthlyExpenses: number;
}) {
  return (
    <Card className="flex items-center p-4">
      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
        <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
      </div>
      <CardContent className="p-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monthly Expenses
        </p>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          $
          {monthlyExpenses.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h3>
        <p className="text-xs text-red-600 dark:text-red-400">
          +8% from last month
        </p>
      </CardContent>
    </Card>
  );
}
