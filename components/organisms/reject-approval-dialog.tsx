"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Approval {
  id: string
  title: string
  amount: number
  requesterName?: string
}

interface RejectApprovalDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  approval: Approval | null
  rejectionReason: string
  onReasonChange: (value: string) => void
  onConfirm: () => void
}

export function RejectApprovalDialog({
  isOpen,
  onOpenChange,
  approval,
  rejectionReason,
  onReasonChange,
  onConfirm,
}: RejectApprovalDialogProps) {
  if (!approval) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Approval Request</DialogTitle>
          <DialogDescription>Please provide a reason for rejecting this request.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Request Details</h3>
            <div className="text-sm">
              <p>
                <strong>Title:</strong> {approval.title}
              </p>
              <p>
                <strong>Amount:</strong> ${approval.amount.toFixed(2)}
              </p>
              <p>
                <strong>Requester:</strong> {approval.requesterName}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Rejection Reason
            </label>
            <Input
              id="reason"
              placeholder="Please provide a reason for rejection"
              value={rejectionReason}
              onChange={(e) => onReasonChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!rejectionReason.trim()}>
            Reject Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
