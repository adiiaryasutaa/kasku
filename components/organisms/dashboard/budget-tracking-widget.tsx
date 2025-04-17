import { ArrowRight, Calendar } from "lucide-react";
import BudgetTracking from "../../budget-tracking";
import { Card, CardContent, CardFooter, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";

export default function budgetTrackingWidget() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
          Budget Tracking
        </h2>
      </CardHeader>
      <CardContent>
        <BudgetTracking />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" className="text-xs">
          View Detailed Budget Report
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
