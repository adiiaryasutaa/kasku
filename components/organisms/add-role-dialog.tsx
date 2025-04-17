"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { RoleFormFields } from "@/components/molecules/role-form-fields"

interface AddRoleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  name: string
  description: string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onSubmit: () => void
}

export function AddRoleDialog({
  isOpen,
  onOpenChange,
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onSubmit,
}: AddRoleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9">
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>Create a custom role with specific permissions for your organization.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RoleFormFields
            name={name}
            description={description}
            onNameChange={onNameChange}
            onDescriptionChange={onDescriptionChange}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Create Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
