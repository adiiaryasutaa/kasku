"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import db from "@/lib/data";

interface ApprovalRequest {
  id: string;
  title: string;
  amount: string;
  requester: {
    name: string;
    avatar: string;
  };
  category: string;
  timestamp: string;
  description?: string;
  attachment?: boolean;
}

interface ApprovalRequestsProps {
  className?: string;
}

export default function ApprovalRequests({ className }: ApprovalRequestsProps) {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApprovalRequests() {
      try {
        // Fetch pending transactions that need approval
        const pendingTransactions = await db.transactions.findMany({
          where: {
            status: "pending",
            organizationId: "org_01",
          },
        });

        // Fetch users to get requester information
        const users = await db.users.findMany();

        // Create a lookup map for users
        const userMap = users.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {} as Record<string, any>);

        // Fetch categories to get category names
        const categories = await db.categories.findMany();

        // Create a lookup map for categories
        const categoryMap = categories.reduce((map, cat) => {
          map[cat.id] = cat.name;
          return map;
        }, {} as Record<string, string>);

        // Transform data for the component
        const formattedRequests = pendingTransactions.map((tx) => {
          const user = userMap[tx.createdBy] || {
            name: "Unknown User",
            avatarUrl: "/placeholder.svg",
          };

          return {
            id: tx.id,
            title: tx.title,
            amount: `$${tx.amount.toFixed(2)}`,
            requester: {
              name: user.name,
              avatar:
                user.avatarUrl ||
                "https://ui-avatars.com/api/?rounded=true&name=" + user.name,
            },
            category: categoryMap[tx.categoryId] || "Uncategorized",
            timestamp: new Date(tx.createdAt).toLocaleString(),
            description: tx.description,
            attachment: !!tx.attachmentUrl,
          };
        });

        setRequests(formattedRequests);
      } catch (error) {
        console.error("Error loading approval requests:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadApprovalRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await db.transactions.update({
        where: { id },
        data: { status: "completed" },
      });

      // Remove the approved request from the list
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await db.transactions.update({
        where: { id },
        data: { status: "rejected" },
      });

      // Remove the declined request from the list
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading approval requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          No pending approvals
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          All transactions have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", "rounded-lg", className)}>
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className={cn(
              "p-4 rounded-lg border border-zinc-100 dark:border-zinc-800",
              "hover:border-zinc-200 dark:hover:border-zinc-700",
              "transition-all duration-200"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image
                  src={
                    request.requester.avatar ||
                    "https://ui-avatars.com/api/?rounded=true&name=" +
                      request.requester.name
                  }
                  alt={request.requester.name}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {request.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    By {request.requester.name} • {request.category}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {request.amount}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {request.timestamp}
              </span>

              {request.attachment && (
                <button className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 ml-auto">
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Receipt</span>
                </button>
              )}
            </div>

            {request.description && (
              <p className="text-xs text-zinc-700 dark:text-zinc-300 mb-3 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded">
                {request.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs bg-[oklch(1 0 0)]"
                onClick={() => handleDecline(request.id)}
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                Decline
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => handleApprove(request.id)}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
