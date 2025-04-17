"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import db from "@/lib/data"
import { format } from "date-fns"
import { CheckCircle, XCircle, FileText, User, Calendar, DollarSign, Tag } from "lucide-react"

interface ApprovalDrawerProps {
  isOpen: boolean
  onClose: () => void
  onAction: (action: "approve" | "reject", approvalId: string, comment: string) => void
  approvalId: string | null
}

export default function ApprovalDrawer({ isOpen, onClose, onAction, approvalId }: ApprovalDrawerProps) {
  const [approval, setApproval] = useState<any | null>(null)
  const [transaction, setTransaction] = useState<any | null>(null)
  const [requester, setRequester] = useState<any | null>(null)
  const [category, setCategory] = useState<any | null>(null)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!approvalId) return

      try {
        setIsLoading(true)

        // Load approval
        const approvalData = await db.approvals.findFirst({
          where: { id: approvalId },
        })

        if (!approvalData) return
        setApproval(approvalData)

        // Load transactions
        if (approvalData.transactionId) {
          const transactionData = await db.transactions.findFirst({
            where: { id: approvalData.transactionId },
          })
          setTransaction(transactionData)

          // Load category
          if (transactionData?.categoryId) {
            const categoryData = await db.categories.findFirst({
              where: { id: transactionData.categoryId },
            })
            setCategory(categoryData)
          }
        }

        // Load requester
        if (approvalData.requestedBy) {
          const userData = await db.users.findFirst({
            where: { id: approvalData.requestedBy },
          })
          setRequester(userData)
        }

        setComment("")
      } catch (error) {
        console.error("Error loading approval data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && approvalId) {
      loadData()
    }
  }, [isOpen, approvalId])

  const handleApprove = () => {
    if (!approval) return
    onAction("approve", approval.id, comment)
  }

  const handleReject = () => {
    if (!approval) return
    onAction("reject", approval.id, comment)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
          >
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          >
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          >
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Approval Request
          </SheetTitle>
          <SheetDescription>Review and respond to this approval request</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : !approval ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Approval request not found</p>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            {/* Status */}
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Status</h3>
              {getStatusBadge(approval.status)}
            </div>

            {/* Transaction Details */}
            {transaction && (
              <div className="space-y-4">
                <div className="border rounded-md p-4 space-y-3">
                  <h3 className="font-medium">{transaction.title}</h3>

                  {transaction.description && (
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center">
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        Amount
                      </p>
                      <p
                        className={`text-sm font-medium ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Tag className="h-3.5 w-3.5 mr-1" />
                        Category
                      </p>
                      <p className="text-sm">{category?.name || "Uncategorized"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center">
                        <User className="h-3.5 w-3.5 mr-1" />
                        Requested By
                      </p>
                      <p className="text-sm">{requester?.name || "Unknown"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Date
                      </p>
                      <p className="text-sm">{format(new Date(approval.createdAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            {approval.status === "pending" && (
              <div className="space-y-2">
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment to your decision..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Previous Comments */}
            {approval.comment && (
              <div className="space-y-2 border-t pt-4">
                <h4 className="text-sm font-medium">Decision Comment</h4>
                <div className="bg-muted p-3 rounded-md text-sm">{approval.comment}</div>
              </div>
            )}
          </div>
        )}

        <SheetFooter>
          {approval?.status === "pending" ? (
            <>
              <Button type="button" variant="outline" onClick={handleReject} className="gap-1.5">
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button type="button" onClick={handleApprove} className="gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

