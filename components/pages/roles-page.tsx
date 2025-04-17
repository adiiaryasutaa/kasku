"use client"

import { useState, useEffect } from "react"
import { Shield, Plus, Search, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "../layouts/app-layout"
import db from "@/lib/data"

interface Role {
  id: string
  name: string
  description: string
  isDefault: boolean
  isSystem: boolean
  createdAt: string
  updatedAt: string
  permissions: Permission[]
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  isGranted: boolean
}

interface PermissionCategory {
  id: string
  name: string
  permissions: Omit<Permission, "isGranted">[]
}

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

  useEffect(() => {
    async function loadRolesAndPermissions() {
      try {
        setIsLoading(true)

        // Fetch roles
        const rolesData = await db.roles.findMany()

        // Fetch permissions
        const permissionsData = await db.permissions.findMany()

        // Fetch role permissions mapping
        const rolePermissionsData = await db.rolePermissions.findMany()

        // Group permissions by category
        const permissionsByCategory: Record<string, PermissionCategory> = {}

        permissionsData.forEach((permission) => {
          if (!permissionsByCategory[permission.category]) {
            permissionsByCategory[permission.category] = {
              id: permission.category,
              name: permission.category.charAt(0).toUpperCase() + permission.category.slice(1), // Capitalize
              permissions: [],
            }
          }

          permissionsByCategory[permission.category].permissions.push({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            category: permission.category,
          })
        })

        setPermissionCategories(Object.values(permissionsByCategory))

        // Create role objects with permissions
        const rolesWithPermissions = rolesData.map((role) => {
          // Get permissions for this role
          const rolePermissions = permissionsData.map((permission) => {
            // Check if this permission is granted for this role
            const permissionMapping = rolePermissionsData.find(
              (rp) => rp.roleId === role.id && rp.permissionId === permission.id,
            )

            return {
              ...permission,
              isGranted: permissionMapping ? permissionMapping.isGranted : false,
            }
          })

          return {
            ...role,
            permissions: rolePermissions,
          }
        })

        setRoles(rolesWithPermissions)
        setFilteredRoles(rolesWithPermissions)
      } catch (error) {
        console.error("Error loading roles and permissions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRolesAndPermissions()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = [...roles]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (role) => role.name.toLowerCase().includes(query) || role.description.toLowerCase().includes(query),
      )
    }

    // Filter by tab
    if (activeTab === "system") {
      result = result.filter((role) => role.isSystem)
    } else if (activeTab === "custom") {
      result = result.filter((role) => !role.isSystem)
    }

    setFilteredRoles(result)
  }, [roles, searchQuery, activeTab])

  const handleAddRole = () => {
    if (!newRoleName) return

    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: newRoleName,
      description: newRoleDescription,
      isDefault: false,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: permissionCategories.flatMap((category) =>
        category.permissions.map((permission) => ({
          ...permission,
          isGranted: false, // New roles start with no permissions
        })),
      ),
    }

    setRoles((prev) => [...prev, newRole])
    setNewRoleName("")
    setNewRoleDescription("")
    setIsAddRoleOpen(false)
  }

  const handleEditRole = () => {
    if (!currentRole) return

    setRoles((prev) =>
      prev.map((role) => (role.id === currentRole.id ? { ...currentRole, updatedAt: new Date().toISOString() } : role)),
    )

    setIsEditRoleOpen(false)
    setCurrentRole(null)
  }

  const handleDeleteRole = (roleId: string) => {
    setRoles((prev) => prev.filter((role) => role.id !== roleId))
  }

  const handleTogglePermission = (permissionId: string, isGranted: boolean) => {
    if (!currentRole) return

    setCurrentRole({
      ...currentRole,
      permissions: currentRole.permissions.map((permission) =>
        permission.id === permissionId ? { ...permission, isGranted } : permission,
      ),
    })
  }

  const handleToggleAllPermissionsInCategory = (categoryId: string, isGranted: boolean) => {
    if (!currentRole) return

    setCurrentRole({
      ...currentRole,
      permissions: currentRole.permissions.map((permission) =>
        permission.category === categoryId ? { ...permission, isGranted } : permission,
      ),
    })
  }

  const countPermissions = (role: Role, categoryId?: string) => {
    const permissions = categoryId ? role.permissions.filter((p) => p.category === categoryId) : role.permissions

    const granted = permissions.filter((p) => p.isGranted).length
    const total = permissions.length

    return `${granted}/${total}`
  }

  const areAllPermissionsInCategoryGranted = (categoryId: string) => {
    if (!currentRole) return false

    const categoryPermissions = currentRole.permissions.filter((p) => p.category === categoryId)
    return categoryPermissions.every((p) => p.isGranted)
  }

  const areSomePermissionsInCategoryGranted = (categoryId: string) => {
    if (!currentRole) return false

    const categoryPermissions = currentRole.permissions.filter((p) => p.category === categoryId)
    return categoryPermissions.some((p) => p.isGranted) && !categoryPermissions.every((p) => p.isGranted)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage roles and their permissions within your organization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Create a custom role with specific permissions for your organization.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Role Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Project Manager"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of this role"
                      value={newRoleDescription}
                      onChange={(e) => setNewRoleDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRole}>Create Role</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="all">All Roles</TabsTrigger>
                  <TabsTrigger value="system">System Roles</TabsTrigger>
                  <TabsTrigger value="custom">Custom Roles</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search roles..."
                      className="pl-9 h-9 md:w-[200px] lg:w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center p-8">
                <Shield className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No roles found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery
                    ? "Try adjusting your search to see more results"
                    : "Get started by adding your first custom role"}
                </p>
                <Button onClick={() => setIsAddRoleOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              </div>
            ) : (
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
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>{countPermissions(role)} permissions granted</TableCell>
                        <TableCell>
                          {role.isDefault ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                            >
                              Default
                            </Badge>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {role.isSystem ? (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                            >
                              System
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                            >
                              Custom
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setCurrentRole(role)
                                setIsEditRoleOpen(true)
                              }}
                              disabled={role.isSystem} // Can't edit system roles
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 dark:text-red-400"
                              onClick={() => handleDeleteRole(role.id)}
                              disabled={role.isSystem} // Can't delete system roles
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
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

        {/* Edit Role Dialog */}
        <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Role: {currentRole?.name}</DialogTitle>
              <DialogDescription>Customize the permissions for this role</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Role Name</Label>
                  <Input
                    id="edit-name"
                    value={currentRole?.name || ""}
                    onChange={(e) => setCurrentRole((curr) => (curr ? { ...curr, name: e.target.value } : null))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={currentRole?.description || ""}
                    onChange={(e) => setCurrentRole((curr) => (curr ? { ...curr, description: e.target.value } : null))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-default"
                    checked={currentRole?.isDefault || false}
                    onCheckedChange={(checked) =>
                      setCurrentRole((curr) => (curr ? { ...curr, isDefault: checked } : null))
                    }
                  />
                  <Label htmlFor="is-default">Make this the default role for new members</Label>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Permissions</h3>

                <Accordion type="multiple" className="w-full">
                  {permissionCategories.map((category) => (
                    <AccordionItem value={category.id} key={category.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={areAllPermissionsInCategoryGranted(category.id)}
                            indeterminate={areSomePermissionsInCategoryGranted(category.id)}
                            onCheckedChange={(checked) =>
                              handleToggleAllPermissionsInCategory(category.id, checked === true)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span>{category.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {currentRole ? countPermissions(currentRole, category.id) : "0/0"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-6">
                          {category.permissions.map((permission) => (
                            <div className="flex items-start gap-2" key={permission.id}>
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={
                                  currentRole?.permissions.find((p) => p.id === permission.id)?.isGranted || false
                                }
                                onCheckedChange={(checked) => handleTogglePermission(permission.id, checked === true)}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <label
                                  htmlFor={`permission-${permission.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {permission.name}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditRole}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

