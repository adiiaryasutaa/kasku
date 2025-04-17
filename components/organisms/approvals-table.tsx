"use client"

import { format } from "date-fns"
import { CheckCircle, CheckSquare, Eye, FileText, MoreHorizontal, XCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/atoms/status-badge"
import { UserAvatar } from "@/components/molecules/user-avatar"
import { EmptyState } from "@/components/molecules/empty-state"
import { LoadingSpinner } from "@/components/atoms/loading-spinner"

interface Approval {
  id: string
  title: string
  description?: string
  amount: number
  type: "expense" | "income" | "budget" | "category"
  status: "pending" | "approved" | "rejected"
  categoryName?: string
  requestedBy: string
  requesterName?: string
  requesterAvatar?: string
  createdAt: string
  attachmentUrl?: string
}

interface ApprovalsTableProps {
  approvals: Approval[]
  isLoading: boolean
  activeTab: string
  searchQuery: string
  onApprove: (approvalId: string) => void
  onReject: (approval: Approval) => void
  onViewDetails: (approval: Approval) => void
}

export function ApprovalsTable({
  approvals,
  isLoading,
  activeTab,
  searchQuery,
  onApprove,
  onReject,
  onViewDetails,
}: ApprovalsTableProps) {
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (approvals.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title={
          activeTab === "pending"
            ? "No pending approvals"
            : activeTab === "approved"
              ? "No approved requests"
              : activeTab === "rejected"
                ? "No rejected requests"
                : "No approval requests found"
        }
        description={
          searchQuery
            ? "Try adjusting your filters to see more results"
            : activeTab === "pending"
              ? "All requests have been reviewed"
              : "Approval requests will appear here"
        }
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvals.map((approval) => (
            <TableRow key={approval.id}>
              <TableCell>
                <div className="font-medium">{approval.title}</div>
                {approval.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{approval.description}</div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Category: {approval.categoryName}</div>
              </TableCell>
              <TableCell>
                <StatusBadge
                  variant={approval.type}
                  label={approval.type.charAt(0).toUpperCase() + approval.type.slice(1)}
                />
              </TableCell>
              <TableCell className="font-medium">${approval.amount.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserAvatar name={approval.requesterName || ""} avatarUrl={approval.requesterAvatar} size="sm" />
                  <span className="text-sm">{approval.requesterName}</span>
                </div>
              </TableCell>
              <TableCell>{format(new Date(approval.createdAt), "MMM d, yyyy")}</TableCell>
              <TableCell>
                <StatusBadge
                  variant={approval.status}
                  label={approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {approval.status === "pending" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-red-600 dark:text-red-400"
                        onClick={() => onReject(approval)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" className="h-8" onClick={() => onApprove(approval.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(approval)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        {approval.attachmentUrl && (
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>View Attachment</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
