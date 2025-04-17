"use client"

import { useState, useEffect } from "react"
import { MembersTemplate } from "@/components/templates/members-template"
import AppLayout from "@/components/layouts/app-layout"
import db from "@/lib/data"

interface Member {
  id: string
  userId: string
  organizationId: string
  role: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState("member")
  const [activeTab, setActiveTab] = useState("all")
  const [currentOrganizationId, setCurrentOrganizationId] = useState("org_01") // Default organization

  useEffect(() => {
    async function loadMembers() {
      try {
        setIsLoading(true)

        // Fetch organization members
        const organizationMembers = await db.organizationMembers.findMany({
          where: { organizationId: currentOrganizationId },
        })

        // Fetch users for member details
        const users = await db.users.findMany()

        // Create a lookup map for users
        const userMap = users.reduce(
          (map, user) => {
            map[user.id] = user
            return map
          },
          {} as Record<string, any>,
        )

        // Create member objects with user details
        const memberData = organizationMembers.map((member) => ({
          ...member,
          user: userMap[member.userId] || {
            id: member.userId,
            name: "Unknown User",
            email: "unknown@example.com",
            role: member.role,
            avatarUrl: null,
          },
        }))

        setMembers(memberData)
        setFilteredMembers(memberData)
      } catch (error) {
        console.error("Error loading members:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMembers()
  }, [currentOrganizationId])

  // Apply filters
  useEffect(() => {
    let result = [...members]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (member) => member.user.name.toLowerCase().includes(query) || member.user.email.toLowerCase().includes(query),
      )
    }

    // Filter by role
    if (roleFilter) {
      result = result.filter((member) => member.role === roleFilter)
    }

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter((member) => {
        if (activeTab === "admin") return member.role === "admin"
        if (activeTab === "treasurer") return member.role === "treasurer"
        if (activeTab === "member") return member.role === "member"
        if (activeTab === "viewer") return member.role === "viewer"
        return true
      })
    }

    setFilteredMembers(result)
  }, [members, searchQuery, roleFilter, activeTab])

  const handleAddMember = async () => {
    if (!newMemberEmail) return

    try {
      // In a real app, this would send an invitation or create a new user
      // For now, we'll simulate adding a new member

      const newUser = {
        id: `user_${Date.now()}`,
        name: newMemberEmail.split("@")[0], // Simple name from email
        email: newMemberEmail,
        role: newMemberRole,
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Create a new member
      const newMember = {
        id: `member_${newUser.id}`,
        userId: newUser.id,
        organizationId: currentOrganizationId,
        role: newMemberRole,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        user: newUser,
      }

      // Add to state
      setMembers((prev) => [...prev, newMember])

      // Reset form
      setNewMemberEmail("")
      setNewMemberRole("member")
      setIsAddMemberOpen(false)
    } catch (error) {
      console.error("Error adding member:", error)
    }
  }

  const handleChangeMemberRole = (memberId: string, newRole: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role: newRole, updatedAt: new Date().toISOString() } : member,
      ),
    )
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId))
  }

  return (
    <AppLayout>
      <MembersTemplate
        members={members}
        filteredMembers={filteredMembers}
        isLoading={isLoading}
        searchQuery={searchQuery}
        activeTab={activeTab}
        isAddMemberOpen={isAddMemberOpen}
        newMemberEmail={newMemberEmail}
        newMemberRole={newMemberRole}
        onSearchChange={setSearchQuery}
        onTabChange={setActiveTab}
        onAddMemberOpenChange={setIsAddMemberOpen}
        onNewMemberEmailChange={setNewMemberEmail}
        onNewMemberRoleChange={setNewMemberRole}
        onAddMember={handleAddMember}
        onChangeMemberRole={handleChangeMemberRole}
        onRemoveMember={handleRemoveMember}
      />
    </AppLayout>
  )
}
