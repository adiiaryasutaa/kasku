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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus } from "lucide-react"

interface AddMemberDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  email: string
  role: string
  onEmailChange: (value: string) => void
  onRoleChange: (value: string) => void
  onSubmit: () => void
}

export function AddMemberDialog({
  isOpen,
  onOpenChange,
  email,
  role,
  onEmailChange,
  onRoleChange,
  onSubmit,
}: AddMemberDialogProps) {
  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full access to all organization settings and data."
      case "treasurer":
        return "Can manage finances, approve transactions, and view reports."
      case "member":
        return "Can create transactions and view basic reports."
      case "viewer":
        return "Read-only access to organization data."
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Invite a new member to your organization. They will receive an email invitation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={onRoleChange}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="treasurer">Treasurer</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getRoleDescription(role)}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Send Invitation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
