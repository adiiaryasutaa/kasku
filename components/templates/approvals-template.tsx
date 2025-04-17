"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/molecules/page-header"
import { ApprovalsTable } from "@/components/organisms/approvals-table"
import { RejectApprovalDialog } from "@/components/organisms/reject-approval-dialog"
import { ApprovalDetailsDialog } from "@/components/organisms/approval-details-dialog"
import { StatCard } from "@/components/molecules/stat-card"
import { FilterTabs } from "@/components/organisms/filter-tabs"

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

interface ApprovalsTemplateProps {
  approvals: Approval[]
  filteredApprovals: Approval[]
  isLoading: boolean
  searchQuery: string
  typeFilter: string
  activeTab: string
  selectedApproval: Approval | null
  isViewDetailsOpen: boolean
  rejectionReason: string
  isRejectDialogOpen: boolean
  onSearchChange: (value: string) => void
  onTypeFilterChange: (value: string) => void
  onTabChange: (value: string) => void
  onViewDetailsOpenChange: (open: boolean) => void
  onRejectDialogOpenChange: (open: boolean) => void
  onRejectionReasonChange: (value: string) => void
  onSelectedApprovalChange: (approval: Approval | null) => void
  onApprove: (approvalId: string) => void
  onReject: () => void
}

export function ApprovalsTemplate({
  approvals,
  filteredApprovals,
  isLoading,
  searchQuery,
  typeFilter,
  activeTab,
  selectedApproval,
  isViewDetailsOpen,
  rejectionReason,
  isRejectDialogOpen,
  onSearchChange,
  onTypeFilterChange,
  onTabChange,
  onViewDetailsOpenChange,
  onRejectDialogOpenChange,
  onRejectionReasonChange,
  onSelectedApprovalChange,
  onApprove,
  onReject,
}: ApprovalsTemplateProps) {
  const pendingCount = approvals.filter((a) => a.status === "pending").length
  const approvedThisMonth = approvals.filter(
    (a) =>
      a.status === "approved" &&
      new Date(a.updatedAt).getMonth() === new Date().getMonth() &&
      new Date(a.updatedAt).getFullYear() === new Date().getFullYear(),
  ).length

  const tabs = [
    {
      value: "pending",
      label: "Pending",
      count: pendingCount,
      badgeVariant: "pending",
    },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" },
  ]

  const additionalFilters = (
    <Select value={typeFilter} onValueChange={onTypeFilterChange}>
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
  )

  const handleRejectClick = (approval: Approval) => {
    onSelectedApprovalChange(approval)
    onRejectDialogOpenChange(true)
  }

  const handleViewDetailsClick = (approval: Approval) => {
    onSelectedApprovalChange(approval)
    onViewDetailsOpenChange(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title="Approvals" description="Review and manage approval requests" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="pending" value={activeTab} onValueChange={onTabChange}>
            <FilterTabs
              activeTab={activeTab}
              onTabChange={onTabChange}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              tabs={tabs}
              additionalFilters={additionalFilters}
              searchPlaceholder="Search approvals..."
            />
          </Tabs>
        </CardHeader>
        <CardContent>
          <ApprovalsTable
            approvals={filteredApprovals}
            isLoading={isLoading}
            activeTab={activeTab}
            searchQuery={searchQuery}
            onApprove={onApprove}
            onReject={handleRejectClick}
            onViewDetails={handleViewDetailsClick}
          />
        </CardContent>
      </Card>

      {/* Approval Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Pending Approvals" value={pendingCount} description="Awaiting your review" />
        <StatCard title="Approved This Month" value={approvedThisMonth} description="Requests you've approved" />
        <StatCard title="Average Response Time" value="1.2 days" description="Time to process requests" />
      </div>

      {/* Reject Dialog */}
      <RejectApprovalDialog
        isOpen={isRejectDialogOpen}
        onOpenChange={onRejectDialogOpenChange}
        approval={selectedApproval}
        rejectionReason={rejectionReason}
        onReasonChange={onRejectionReasonChange}
        onConfirm={onReject}
      />

      {/* View Details Dialog */}
      <ApprovalDetailsDialog
        isOpen={isViewDetailsOpen}
        onOpenChange={onViewDetailsOpenChange}
        approval={selectedApproval}
      />
    </div>
  )
}
