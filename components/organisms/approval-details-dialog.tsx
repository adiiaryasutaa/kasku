"use client"

import { format } from "date-fns"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/atoms/status-badge"
import { UserAvatar } from "@/components/molecules/user-avatar"

interface Approval {
  id: string
  title: string
  description?: string
  amount: number
  type: string
  status: string
  categoryName?: string
  requestedBy: string
  requesterName?: string
  requesterAvatar?: string
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approverName?: string
  rejectionReason?: string
  attachmentUrl?: string
}

interface ApprovalDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  approval: Approval | null
}

export function ApprovalDetailsDialog({ isOpen, onOpenChange, approval }: ApprovalDetailsDialogProps) {
  if (!approval) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approval Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{approval.title}</h3>
              {approval.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{approval.description}</p>
              )}
            </div>
            <div>
              <StatusBadge
                variant={approval.status as any}
                label={approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
              <p className="text-lg font-medium">${approval.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
              <p className="text-lg font-medium">{approval.categoryName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Requested By</p>
              <div className="flex items-center gap-2 mt-1">
                <UserAvatar name={approval.requesterName || ""} avatarUrl={approval.requesterAvatar} size="sm" />
                <span>{approval.requesterName}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Requested On</p>
              <p className="text-lg font-medium">{format(new Date(approval.createdAt), "MMM d, yyyy")}</p>
            </div>

            {approval.status !== "pending" && (
              <>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {approval.status === "approved" ? "Approved By" : "Rejected By"}
                  </p>
                  <p className="text-lg font-medium">{approval.approverName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {approval.status === "approved" ? "Approved On" : "Rejected On"}
                  </p>
                  <p className="text-lg font-medium">{format(new Date(approval.updatedAt), "MMM d, yyyy")}</p>
                </div>
              </>
            )}
          </div>

          {approval.rejectionReason && (
            <div className="pt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Rejection Reason</p>
              <p className="text-sm mt-1 p-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-md">
                {approval.rejectionReason}
              </p>
            </div>
          )}

          {approval.attachmentUrl && (
            <div className="pt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Attachment</p>
              <Button variant="outline" size="sm" className="mt-1">
                <FileText className="mr-2 h-4 w-4" />
                View Attachment
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
