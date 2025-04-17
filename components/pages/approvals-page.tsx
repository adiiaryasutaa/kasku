"use client"

import { useState, useEffect } from "react"
import { CheckSquare, Search, CheckCircle, XCircle, FileText, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import AppLayout from "../layouts/app-layout"
import db from "@/lib/data"

interface Approval {
  id: string
  transactionId: string
  title: string
  description?: string
  amount: number
  type: "expense" | "income" | "budget" | "category"
  status: "pending" | "approved" | "rejected"
  categoryId: string
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

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [filteredApprovals, setFilteredApprovals] = useState<Approval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  useEffect(() => {
    async function loadApprovals() {
      try {
        setIsLoading(true)

        // Fetch pending transactions that need approval
        const pendingTransactions = await db.transactions.findMany({
          where: { status: "pending" },
        })

        // Fetch historical approvals
        const historicalApprovals = await db.approvals.findMany()

        // Fetch users for requester information
        const users = await db.users.findMany()
        const userMap = users.reduce(
          (map, user) => {
            map[user.id] = user
            return map
          },
          {} as Record<string, any>,
        )

        // Fetch categories for category names
        const categories = await db.categories.findMany()
        const categoryMap = categories.reduce(
          (map, cat) => {
            map[cat.id] = cat.name
            return map
          },
          {} as Record<string, string>,
        )

        // Create approval objects from pending transactions
        const pendingApprovals = pendingTransactions.map((tx) => {
          const user = userMap[tx.createdBy] || { name: "Unknown User", avatarUrl: "/placeholder.svg" }

          return {
            id: `approval_${tx.id}`,
            transactionId: tx.id,
            title: tx.title,
            description: tx.description,
            amount: tx.amount,
            type: tx.type as "expense" | "income",
            status: "pending" as const,
            categoryId: tx.categoryId,
            categoryName: categoryMap[tx.categoryId] || "Uncategorized",
            requestedBy: tx.createdBy,
            requesterName: user.name,
            requesterAvatar: user.avatarUrl,
            createdAt: tx.createdAt,
            updatedAt: tx.updatedAt,
            attachmentUrl: tx.attachmentUrl,
          }
        })

        // Enhance historical approvals with user and category information
        const enhancedHistoricalApprovals = historicalApprovals.map((approval) => {
          const requester = userMap[approval.requestedBy] || { name: "Unknown User", avatarUrl: "/placeholder.svg" }
          const approver = approval.approvedBy ? userMap[approval.approvedBy] : null

          return {
            ...approval,
            requesterName: requester.name,
            requesterAvatar: requester.avatarUrl,
            approverName: approver?.name,
            categoryName: categoryMap[approval.categoryId] || "Uncategorized",
          }
        })

        // Combine all approvals
        const allApprovals = [...pendingApprovals, ...enhancedHistoricalApprovals]

        // Sort by date (newest first)
        allApprovals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setApprovals(allApprovals)
        setFilteredApprovals(allApprovals.filter((a) => a.status === "pending"))
      } catch (error) {
        console.error("Error loading approvals:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadApprovals()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = [...approvals]

    // Filter by tab (status)
    if (activeTab !== "all") {
      result = result.filter((approval) => approval.status === activeTab)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (approval) =>
          approval.title.toLowerCase().includes(query) ||
          approval.description?.toLowerCase().includes(query) ||
          approval.requesterName?.toLowerCase().includes(query) ||
          approval.categoryName?.toLowerCase().includes(query),
      )
    }

    // Filter by type
    if (typeFilter) {
      result = result.filter((approval) => approval.type === typeFilter)
    }

    setFilteredApprovals(result)
  }, [approvals, searchQuery, typeFilter, activeTab])

  const handleApprove = (approvalId: string) => {
    setApprovals((prev) =>
      prev.map((approval) =>
        approval.id === approvalId
          ? {
              ...approval,
              status: "approved",
              updatedAt: new Date().toISOString(),
              approvedBy: "user_01", // Current user
              approverName: "Alex Johnson", // Current user name
            }
          : approval,
      ),
    )
  }

  const handleReject = () => {
    if (!selectedApproval) return

    setApprovals((prev) =>
      prev.map((approval) =>
        approval.id === selectedApproval.id
          ? {
              ...approval,
              status: "rejected",
              updatedAt: new Date().toISOString(),
              approvedBy: "user_01", // Current user
              approverName: "Alex Johnson", // Current user name
              rejectionReason,
            }
          : approval,
      ),
    )

    setRejectionReason("")
    setIsRejectDialogOpen(false)
    setSelectedApproval(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "expense":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          >
            Expense
          </Badge>
        )
      case "income":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          >
            Income
          </Badge>
        )
      case "budget":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
          >
            Budget
          </Badge>
        )
      case "category":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
          >
            Category
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approvals</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Review and manage approval requests</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="pending">
                    Pending
                    {approvals.filter((a) => a.status === "pending").length > 0 && (
                      <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                        {approvals.filter((a) => a.status === "pending").length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search approvals..."
                      className="pl-9 h-9 md:w-[200px] lg:w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[130px] h-9">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="budget">Budget</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : filteredApprovals.length === 0 ? (
              <div className="text-center p-8">
                <CheckSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {activeTab === "pending"
                    ? "No pending approvals"
                    : activeTab === "approved"
                      ? "No approved requests"
                      : activeTab === "rejected"
                        ? "No rejected requests"
                        : "No approval requests found"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery || typeFilter
                    ? "Try adjusting your filters to see more results"
                    : activeTab === "pending"
                      ? "All requests have been reviewed"
                      : "Approval requests will appear here"}
                </p>
              </div>
            ) : (
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
                    {filteredApprovals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell>
                          <div className="font-medium">{approval.title}</div>
                          {approval.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {approval.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Category: {approval.categoryName}
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(approval.type)}</TableCell>
                        <TableCell className="font-medium">${approval.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={approval.requesterAvatar || ""} alt={approval.requesterName} />
                              <AvatarFallback>{getAvatarFallback(approval.requesterName || "")}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{approval.requesterName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(approval.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell>{getStatusBadge(approval.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {approval.status === "pending" ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-red-600 dark:text-red-400"
                                  onClick={() => {
                                    setSelectedApproval(approval)
                                    setIsRejectDialogOpen(true)
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button size="sm" className="h-8" onClick={() => handleApprove(approval.id)}>
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
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedApproval(approval)
                                      setIsViewDetailsOpen(true)
                                    }}
                                  >
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
            )}
          </CardContent>
        </Card>

        {/* Approval Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {approvals.filter((a) => a.status === "pending").length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting your review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Approved This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {
                  approvals.filter(
                    (a) =>
                      a.status === "approved" &&
                      new Date(a.updatedAt).getMonth() === new Date().getMonth() &&
                      new Date(a.updatedAt).getFullYear() === new Date().getFullYear(),
                  ).length
                }
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Requests you've approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Average Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1.2 days</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Time to process requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
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
                    <strong>Title:</strong> {selectedApproval?.title}
                  </p>
                  <p>
                    <strong>Amount:</strong> ${selectedApproval?.amount.toFixed(2)}
                  </p>
                  <p>
                    <strong>Requester:</strong> {selectedApproval?.requesterName}
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
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
                Reject Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approval Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedApproval && (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{selectedApproval.title}</h3>
                      {selectedApproval.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedApproval.description}</p>
                      )}
                    </div>
                    <div>{getStatusBadge(selectedApproval.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="text-lg font-medium">${selectedApproval.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="text-lg font-medium">{selectedApproval.categoryName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Requested By</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={selectedApproval.requesterAvatar || ""}
                            alt={selectedApproval.requesterName}
                          />
                          <AvatarFallback>{getAvatarFallback(selectedApproval.requesterName || "")}</AvatarFallback>
                        </Avatar>
                        <span>{selectedApproval.requesterName}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Requested On</p>
                      <p className="text-lg font-medium">
                        {format(new Date(selectedApproval.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>

                    {selectedApproval.status !== "pending" && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedApproval.status === "approved" ? "Approved By" : "Rejected By"}
                          </p>
                          <p className="text-lg font-medium">{selectedApproval.approverName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedApproval.status === "approved" ? "Approved On" : "Rejected On"}
                          </p>
                          <p className="text-lg font-medium">
                            {format(new Date(selectedApproval.updatedAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {selectedApproval.rejectionReason && (
                    <div className="pt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rejection Reason</p>
                      <p className="text-sm mt-1 p-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-md">
                        {selectedApproval.rejectionReason}
                      </p>
                    </div>
                  )}

                  {selectedApproval.attachmentUrl && (
                    <div className="pt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Attachment</p>
                      <Button variant="outline" size="sm" className="mt-1">
                        <FileText className="mr-2 h-4 w-4" />
                        View Attachment
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsViewDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

