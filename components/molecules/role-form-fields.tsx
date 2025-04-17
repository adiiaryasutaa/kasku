"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface RoleFormFieldsProps {
  name: string
  description: string
  isDefault?: boolean
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onDefaultChange?: (value: boolean) => void
  showDefaultToggle?: boolean
}

export function RoleFormFields({
  name,
  description,
  isDefault = false,
  onNameChange,
  onDescriptionChange,
  onDefaultChange,
  showDefaultToggle = false,
}: RoleFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role-name">Role Name</Label>
        <Input
          id="role-name"
          placeholder="e.g., Project Manager"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role-description">Description</Label>
        <Input
          id="role-description"
          placeholder="Brief description of this role"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
      {showDefaultToggle && onDefaultChange && (
        <div className="flex items-center space-x-2">
          <Switch id="is-default" checked={isDefault} onCheckedChange={onDefaultChange} />
          <Label htmlFor="is-default">Make this the default role for new members</Label>
        </div>
      )}
    </div>
  )
}
