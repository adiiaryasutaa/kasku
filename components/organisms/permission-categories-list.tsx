"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PermissionItem } from "@/components/molecules/permission-item"

interface Role {
  permissions: {
    id: string
    category: string
    isGranted: boolean
  }[]
}

interface PermissionCategory {
  id: string
  name: string
  permissions: {
    id: string
    name: string
    description: string
    category: string
  }[]
}

interface PermissionCategoriesListProps {
  role: Role
  permissionCategories: PermissionCategory[]
  onTogglePermission: (permissionId: string, isGranted: boolean) => void
  onToggleCategory: (categoryId: string, isGranted: boolean) => void
}

export function PermissionCategoriesList({
  role,
  permissionCategories,
  onTogglePermission,
  onToggleCategory,
}: PermissionCategoriesListProps) {
  const countPermissions = (categoryId: string) => {
    const categoryPermissions = role.permissions.filter((p) => p.category === categoryId)
    const granted = categoryPermissions.filter((p) => p.isGranted).length
    const total = categoryPermissions.length
    return `${granted}/${total}`
  }

  const areAllPermissionsInCategoryGranted = (categoryId: string) => {
    const categoryPermissions = role.permissions.filter((p) => p.category === categoryId)
    return categoryPermissions.every((p) => p.isGranted)
  }

  const areSomePermissionsInCategoryGranted = (categoryId: string) => {
    const categoryPermissions = role.permissions.filter((p) => p.category === categoryId)
    return categoryPermissions.some((p) => p.isGranted) && !categoryPermissions.every((p) => p.isGranted)
  }

  return (
    <Accordion type="multiple" className="w-full">
      {permissionCategories.map((category) => (
        <AccordionItem value={category.id} key={category.id}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={areAllPermissionsInCategoryGranted(category.id)}
                indeterminate={areSomePermissionsInCategoryGranted(category.id)}
                onCheckedChange={(checked) => onToggleCategory(category.id, checked === true)}
                onClick={(e) => e.stopPropagation()}
              />
              <span>{category.name}</span>
              <Badge variant="outline" className="ml-2">
                {countPermissions(category.id)}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pl-6">
              {category.permissions.map((permission) => {
                const rolePermission = role.permissions.find((p) => p.id === permission.id)
                const isGranted = rolePermission?.isGranted || false

                return (
                  <PermissionItem
                    key={permission.id}
                    id={permission.id}
                    name={permission.name}
                    description={permission.description}
                    isGranted={isGranted}
                    onToggle={onTogglePermission}
                  />
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
