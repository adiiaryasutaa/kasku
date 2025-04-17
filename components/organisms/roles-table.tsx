"use client"

import { Edit, Shield, Trash } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RoleBadge } from "@/components/atoms/role-badge"
import { PermissionCount } from "@/components/atoms/permission-count"
import { EmptyState } from "@/components/molecules/empty-state"
import { LoadingSpinner } from "@/components/atoms/loading-spinner"
import { Role } from "@prisma/client";

interface RolesTableProps {
  roles: Role[]
  isLoading: boolean
  searchQuery: string
  onAddRole: () => void
  onEditRole: (role: Role) => void
  onDeleteRole: (roleId: string) => void
}

export function RolesTable({ roles, isLoading, searchQuery, onAddRole, onEditRole, onDeleteRole }: RolesTableProps) {
  const countPermissions = (role: Role) => {
    const granted = role.permissions.filter((p) => p.isGranted).length
    const total = role.permissions.length
    return { granted, total }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (roles.length === 0) {
    return (
      <EmptyState
        icon={Shield}
        title="No roles found"
        description={
          searchQuery ? "Try adjusting your search to see more results" : "Get started by adding your first custom role"
        }
        actionLabel={!searchQuery ? "Add Role" : undefined}
        onAction={!searchQuery ? onAddRole : undefined}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => {
            const { granted, total } = countPermissions(role)

            return (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <PermissionCount granted={granted} total={total} />
                </TableCell>
                <TableCell>
                  {role.isDefault ? (
                    <RoleBadge variant="default" label="Default" />
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {role.isSystem ? (
                    <RoleBadge variant="system" label="System" />
                  ) : (
                    <RoleBadge variant="custom" label="Custom" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEditRole(role)}
                      disabled={role.isSystem}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 dark:text-red-400"
                      onClick={() => onDeleteRole(role.id)}
                      disabled={role.isSystem}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
