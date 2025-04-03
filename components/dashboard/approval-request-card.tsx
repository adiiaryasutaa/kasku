import { AlertCircle, ArrowRight } from "lucide-react";
import ApprovalRequests from "../approval-requests";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";

export default function ApprovalRequestCard() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white text-left flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
          Pending Approvals
        </h2>
      </CardHeader>
      <CardContent className="flex-1">
        <ApprovalRequests />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" className="text-xs">
          View All Requests
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
