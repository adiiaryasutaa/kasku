"use client"

import { useEffect, useState } from "react"
import { RolesTemplate } from "@/components/templates/roles-template"
import AppLayout from "@/components/layouts/app-layout"
import { Role } from "@prisma/client";
import { getCurrentRolesWithPermissionOrganization } from "@/actions/role";
import { useOrganization } from "@/contexts/organization-context";
import { PermissionCategory } from "@/types/permission";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const { currentOrganization } = useOrganization();

  useEffect(() => {

    async function fetchData() {
      setIsLoading(true);

      const roles: Role[] = currentOrganization ? await getCurrentRolesWithPermissionOrganization(currentOrganization) : [];

      setRoles(roles);
      setFilteredRoles(roles);
      setIsLoading(false);
    }

    fetchData()
  }, [currentOrganization])

  const handleAddRole = async () => {};
  const handleEditRole = async () => {};
  const handleDeleteRole = async () => {};
  const handleEditRoleClick = async () => {};

  return (
    <AppLayout>
      <RolesTemplate
        roles={roles}
        filteredRoles={filteredRoles}
        permissionCategories={permissionCategories}
        isLoading={isLoading}
        searchQuery={searchQuery}
        activeTab={activeTab}
        isAddRoleOpen={isAddRoleOpen}
        isEditRoleOpen={isEditRoleOpen}
        currentRole={currentRole}
        newRoleName={newRoleName}
        newRoleDescription={newRoleDescription}
        onSearchChange={setSearchQuery}
        onTabChange={setActiveTab}
        onAddRoleOpenChange={setIsAddRoleOpen}
        onEditRoleOpenChange={setIsEditRoleOpen}
        onNewRoleNameChange={setNewRoleName}
        onNewRoleDescriptionChange={setNewRoleDescription}
        onCurrentRoleChange={setCurrentRole}
        onAddRole={handleAddRole}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
        onEditRoleClick={handleEditRoleClick}
      />
    </AppLayout>
  )
}
