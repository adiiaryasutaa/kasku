"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RoleFormFields } from "@/components/molecules/role-form-fields"
import { PermissionCategoriesList } from "@/components/organisms/permission-categories-list"
import { Role } from "@prisma/client";

interface EditRoleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onRoleChange: (role: Role | null) => void
  onSubmit: () => void
}

export function EditRoleDialog({
  isOpen,
  onOpenChange,
  role,
  onRoleChange,
  onSubmit,
}: EditRoleDialogProps) {
  if (!role) return null

  const handleTogglePermission = (permissionId: string, isGranted: boolean) => {
    if (!role) return

    onRoleChange({
      ...role,
      permissions: role.permissions.map((permission) =>
        permission.id === permissionId ? { ...permission, isGranted } : permission,
      ),
    })
  }

  const handleToggleAllPermissionsInCategory = (categoryId: string, isGranted: boolean) => {
    if (!role) return

    onRoleChange({
      ...role,
      permissions: role.permissions.map((permission) =>
        permission.category === categoryId ? { ...permission, isGranted } : permission,
      ),
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Role: {role.name}</DialogTitle>
          <DialogDescription>Customize the permissions for this role</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4 mb-4">
            <RoleFormFields
              name={role.name}
              description={role.description}
              isDefault={role.isDefault}
              onNameChange={(value) => onRoleChange({ ...role, name: value })}
              onDescriptionChange={(value) => onRoleChange({ ...role, description: value })}
              onDefaultChange={(value) => onRoleChange({ ...role, isDefault: value })}
              showDefaultToggle={true}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Permissions</h3>
            <PermissionCategoriesList
              role={role}
              permissionCategories={permissionCategories}
              onTogglePermission={handleTogglePermission}
              onToggleCategory={handleToggleAllPermissionsInCategory}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
