import { ArrowRight, Download, Wallet } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "@/components/ui/button";
import TransactionList from "../transaction-list";

export default function RecentTransactionCard() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white text-left flex items-center gap-2">
          <Wallet className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
          Recent Transactions
        </h2>
      </CardHeader>
      <CardContent>
        <TransactionList />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
        <Button variant="default" size="sm" className="text-xs">
          View All
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
