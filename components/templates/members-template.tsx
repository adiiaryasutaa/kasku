"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { PageHeader } from "@/components/molecules/page-header"
import { MembersTable } from "@/components/organisms/members-table"
import { AddMemberDialog } from "@/components/organisms/add-member-dialog"
import { RoleDescriptionsGrid } from "@/components/organisms/role-descriptions-grid"
import { FilterTabs } from "@/components/organisms/filter-tabs"

interface Member {
  id: string
  userId: string
  organizationId: string
  role: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string
  }
}

interface MembersTemplateProps {
  members: Member[]
  filteredMembers: Member[]
  isLoading: boolean
  searchQuery: string
  activeTab: string
  isAddMemberOpen: boolean
  newMemberEmail: string
  newMemberRole: string
  onSearchChange: (value: string) => void
  onTabChange: (value: string) => void
  onAddMemberOpenChange: (open: boolean) => void
  onNewMemberEmailChange: (value: string) => void
  onNewMemberRoleChange: (value: string) => void
  onAddMember: () => void
  onChangeMemberRole: (memberId: string, newRole: string) => void
  onRemoveMember: (memberId: string) => void
}

export function MembersTemplate({
  members,
  filteredMembers,
  isLoading,
  searchQuery,
  activeTab,
  isAddMemberOpen,
  newMemberEmail,
  newMemberRole,
  onSearchChange,
  onTabChange,
  onAddMemberOpenChange,
  onNewMemberEmailChange,
  onNewMemberRoleChange,
  onAddMember,
  onChangeMemberRole,
  onRemoveMember,
}: MembersTemplateProps) {
  const tabs = [
    { value: "all", label: "All Members" },
    { value: "admin", label: "Admins" },
    { value: "treasurer", label: "Treasurers" },
    { value: "member", label: "Members" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title="Members" description="Manage your organization's members and their roles" />
        <div className="flex items-center gap-2">
          <AddMemberDialog
            isOpen={isAddMemberOpen}
            onOpenChange={onAddMemberOpenChange}
            email={newMemberEmail}
            role={newMemberRole}
            onEmailChange={onNewMemberEmailChange}
            onRoleChange={onNewMemberRoleChange}
            onSubmit={onAddMember}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange}>
            <FilterTabs
              activeTab={activeTab}
              onTabChange={onTabChange}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              tabs={tabs}
              searchPlaceholder="Search members..."
            />
          </Tabs>
        </CardHeader>
        <CardContent>
          <MembersTable
            members={filteredMembers}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onAddMember={() => onAddMemberOpenChange(true)}
            onChangeMemberRole={onChangeMemberRole}
            onRemoveMember={onRemoveMember}
          />
        </CardContent>
      </Card>

      <RoleDescriptionsGrid />
    </div>
  )
}
