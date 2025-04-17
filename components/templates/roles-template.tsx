"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { PageHeader } from "@/components/molecules/page-header"
import { RoleFilters } from "@/components/organisms/role-filters"
import { RolesTable } from "@/components/organisms/roles-table"
import { AddRoleDialog } from "@/components/organisms/add-role-dialog"
import { EditRoleDialog } from "@/components/organisms/edit-role-dialog"
import { Role } from "@prisma/client";
import { PermissionCategory } from "@/types/permission";

interface RolesTemplateProps {
	roles: Role[]
	filteredRoles: Role[]
	permissionCategories: PermissionCategory[]
	isLoading: boolean
	searchQuery: string
	activeTab: string
	isAddRoleOpen: boolean
	isEditRoleOpen: boolean
	currentRole: Role | null
	newRoleName: string
	newRoleDescription: string
	onSearchChange: (value: string) => void
	onTabChange: (value: string) => void
	onAddRoleOpenChange: (open: boolean) => void
	onEditRoleOpenChange: (open: boolean) => void
	onNewRoleNameChange: (value: string) => void
	onNewRoleDescriptionChange: (value: string) => void
	onCurrentRoleChange: (role: Role | null) => void
	onAddRole: () => void
	onEditRole: () => void
	onDeleteRole: (roleId: string) => void
	onEditRoleClick: (role: Role) => void
}

export function RolesTemplate({
	roles,
	filteredRoles,
	permissionCategories,
	isLoading,
	searchQuery,
	activeTab,
	isAddRoleOpen,
	isEditRoleOpen,
	currentRole,
	newRoleName,
	newRoleDescription,
	onSearchChange,
	onTabChange,
	onAddRoleOpenChange,
	onEditRoleOpenChange,
	onNewRoleNameChange,
	onNewRoleDescriptionChange,
	onCurrentRoleChange,
	onAddRole,
	onEditRole,
	onDeleteRole,
	onEditRoleClick,
}: RolesTemplateProps) {
	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<PageHeader
					title="Roles & Permissions"
					description="Manage roles and their permissions within your organization"
				/>
				<div className="flex items-center gap-2">
					<AddRoleDialog
						isOpen={isAddRoleOpen}
						onOpenChange={onAddRoleOpenChange}
						name={newRoleName}
						description={newRoleDescription}
						onNameChange={onNewRoleNameChange}
						onDescriptionChange={onNewRoleDescriptionChange}
						onSubmit={onAddRole}
					/>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange}>
						<RoleFilters
							activeTab={activeTab}
							onTabChange={onTabChange}
							searchQuery={searchQuery}
							onSearchChange={onSearchChange}
						/>
					</Tabs>
				</CardHeader>
				<CardContent>
					<RolesTable
						roles={filteredRoles}
						isLoading={isLoading}
						searchQuery={searchQuery}
						onAddRole={() => onAddRoleOpenChange(true)}
						onEditRole={onEditRoleClick}
						onDeleteRole={onDeleteRole}
					/>
				</CardContent>
			</Card>

			<EditRoleDialog
				isOpen={isEditRoleOpen}
				onOpenChange={onEditRoleOpenChange}
				role={currentRole}
				permissionCategories={permissionCategories}
				onRoleChange={onCurrentRoleChange}
				onSubmit={onEditRole}
			/>
		</div>
	)
}
