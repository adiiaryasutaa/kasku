"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import db from "@/lib/data"
import { UserPlus } from "lucide-react"

interface MemberDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  organizationId: string
}

export default function MemberDrawer({ isOpen, onClose, onSave, organizationId }: MemberDrawerProps) {
  const [formData, setFormData] = useState({
    userId: "",
    roleId: "",
    email: "",
  })
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isInviteMode, setIsInviteMode] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        // Load users
        const usersData = await db.users.findMany()
        setUsers(usersData)

        // Load roles
        const rolesData = await db.roles.findMany()
        setRoles(rolesData)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    if (isOpen) {
      loadData()
      // Reset form
      setFormData({
        userId: "",
        roleId: "",
        email: "",
      })
      setIsInviteMode(false)
      setErrors({})
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user database
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (isInviteMode) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address"
      }
    } else {
      if (!formData.userId) {
        newErrors.userId = "User is required"
      }
    }

    if (!formData.roleId) {
      newErrors.roleId = "Role is required"
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
      if (isInviteMode) {
        // In a real app, this would send an invitation email
        // For now, we'll just simulate adding a new member
        const newMember = {
          id: `member_${Date.now()}`,
          organizationId,
          userId: `invited_${Date.now()}`,
          roleId: formData.roleId,
          status: "invited",
          email: formData.email,
          invitedAt: new Date().toISOString(),
        }

        await db.organizationMembers.create({
          data: newMember,
        })

        onSave(newMember)
      } else {
        // Add existing user as member
        const newMember = {
          id: `member_${Date.now()}`,
          organizationId,
          userId: formData.userId,
          roleId: formData.roleId,
          status: "active",
          joinedAt: new Date().toISOString(),
        }

        await db.organizationMembers.create({
          data: newMember,
        })

        onSave(newMember)
      }

      onClose()
    } catch (error) {
      console.error("Error adding member:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Member
          </SheetTitle>
          <SheetDescription>Add a new member to your organization or invite someone by email.</SheetDescription>
        </SheetHeader>

        <div className="flex items-center space-x-4 py-4">
          <Button
            type="button"
            variant={isInviteMode ? "outline" : "default"}
            onClick={() => setIsInviteMode(false)}
            className="flex-1"
          >
            Existing User
          </Button>
          <Button
            type="button"
            variant={isInviteMode ? "default" : "outline"}
            onClick={() => setIsInviteMode(true)}
            className="flex-1"
          >
            Invite by Email
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            {isInviteMode ? (
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="userId">
                  User <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.userId} onValueChange={(value) => handleSelectChange("userId", value)}>
                  <SelectTrigger id="userId" className={errors.userId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.userId && <p className="text-xs text-red-500">{errors.userId}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="roleId">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.roleId} onValueChange={(value) => handleSelectChange("roleId", value)}>
                <SelectTrigger id="roleId" className={errors.roleId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && <p className="text-xs text-red-500">{errors.roleId}</p>}
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : isInviteMode ? "Send Invitation" : "Add Member"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

