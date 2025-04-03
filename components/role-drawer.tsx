"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import db from "@/lib/data"
import { Shield } from "lucide-react"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface RoleDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  role?: any // For editing existing role
  mode: "create" | "edit"
}

export default function RoleDrawer({ isOpen, onClose, onSave, role, mode }: RoleDrawerProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        // Load permissions
        const permissionsData = await db.permissions.findMany()
        setPermissions(permissionsData)

        if (mode === "edit" && role) {
          // Load role data
          setFormData({
            name: role.name || "",
            description: role.description || "",
          })

          // Load role permissions
          const rolePermissions = await db.rolePermissions.findMany({
            where: { roleId: role.id },
          })

          setSelectedPermissions(rolePermissions.map((rp) => rp.permissionId))
        } else {
          // Reset form for create mode
          setFormData({
            name: "",
            description: "",
          })
          setSelectedPermissions([])
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    if (isOpen) {
      loadData()
    }
  }, [isOpen, role, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, permissionId])
    } else {
      setSelectedPermissions((prev) => prev.filter((id) => id !== permissionId))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Role name is required"
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = "At least one permission must be selected"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (mode === "edit" && role) {
        // Update existing role
        const updatedRole = await db.roles.update({
          where: { id: role.id },
          data: {
            name: formData.name,
            description: formData.description,
            updatedAt: new Date().toISOString(),
          },
        })

        // Delete existing role permissions
        await db.rolePermissions.deleteMany({
          where: { roleId: role.id },
        })

        // Add new role permissions
        for (const permissionId of selectedPermissions) {
          await db.rolePermissions.create({
            data: {
              id: `rp_${Date.now()}_${permissionId}`,
              roleId: role.id,
              permissionId,
            },
          })
        }

        onSave(updatedRole)
      } else {
        // Create new role
        const newRole = await db.roles.create({
          data: {
            id: `role_${Date.now()}`,
            name: formData.name,
            description: formData.description,
            isSystem: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })

        // Add role permissions
        for (const permissionId of selectedPermissions) {
          await db.rolePermissions.create({
            data: {
              id: `rp_${Date.now()}_${permissionId}`,
              roleId: newRole.id,
              permissionId,
            },
          })
        }

        onSave(newRole)
      }

      onClose()
    } catch (error) {
      console.error("Error saving role:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Group permissions by category
  const permissionsByCategory = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {mode === "create" ? "Create New Role" : "Edit Role"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create" ? "Create a new role with specific permissions" : "Update role details and permissions"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            {/* Role Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Role Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Finance Manager"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of this role's responsibilities"
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label>
                Permissions <span className="text-red-500">*</span>
              </Label>
              {errors.permissions && <p className="text-xs text-red-500">{errors.permissions}</p>}

              <div className="border rounded-md divide-y">
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                  <div key={category} className="p-4">
                    <h4 className="font-medium mb-2 text-sm">{category}</h4>
                    <div className="space-y-2">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.name}
                            </label>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "create" ? "Create Role" : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

