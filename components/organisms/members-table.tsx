"use client"

import { format } from "date-fns"
import { MoreHorizontal, Mail, Shield, User, UserX, Users } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/atoms/status-badge"
import { UserAvatar } from "@/components/molecules/user-avatar"
import { EmptyState } from "@/components/molecules/empty-state"
import { LoadingSpinner } from "@/components/atoms/loading-spinner"

interface Member {
  id: string
  role: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
}

interface MembersTableProps {
  members: Member[]
  isLoading: boolean
  searchQuery: string
  onAddMember: () => void
  onChangeMemberRole: (memberId: string, newRole: string) => void
  onRemoveMember: (memberId: string) => void
}

export function MembersTable({
  members,
  isLoading,
  searchQuery,
  onAddMember,
  onChangeMemberRole,
  onRemoveMember,
}: MembersTableProps) {
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members found"
        description={
          searchQuery ? "Try adjusting your filters to see more results" : "Get started by adding your first member"
        }
        actionLabel={!searchQuery ? "Add Member" : undefined}
        onAction={!searchQuery ? onAddMember : undefined}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <UserAvatar name={member.user.name} avatarUrl={member.user.avatarUrl} />
                  <div className="font-medium">{member.user.name}</div>
                </div>
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                <StatusBadge
                  variant={member.role as any}
                  label={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                />
              </TableCell>
              <TableCell>{format(new Date(member.createdAt), "MMM d, yyyy")}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => (window.location.href = `mailto:${member.user.email}`)}>
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Email</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onChangeMemberRole(member.id, "admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Make Admin</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChangeMemberRole(member.id, "treasurer")}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Make Treasurer</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChangeMemberRole(member.id, "member")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Make Member</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChangeMemberRole(member.id, "viewer")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Make Viewer</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400"
                      onClick={() => onRemoveMember(member.id)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      <span>Remove</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
