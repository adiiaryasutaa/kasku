"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Search, MoreHorizontal, Mail, Shield, UserX, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import Layout from "../layout"
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
            Admin
          </Badge>
        )
      case "treasurer":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            Treasurer
          </Badge>
        )
      case "member":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            Member
          </Badge>
        )
      case "viewer":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
            Viewer
          </Badge>
        )
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your organization's members and their roles</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
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
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newMemberRole} onValueChange={setNewMemberRole}>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {newMemberRole === "admin" && "Full access to all organization settings and data."}
                      {newMemberRole === "treasurer" && "Can manage finances, approve transactions, and view reports."}
                      {newMemberRole === "member" && "Can create transactions and view basic reports."}
                      {newMemberRole === "viewer" && "Read-only access to organization data."}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMember}>Send Invitation</Button>
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
                  <TabsTrigger value="all">All Members</TabsTrigger>
                  <TabsTrigger value="admin">Admins</TabsTrigger>
                  <TabsTrigger value="treasurer">Treasurers</TabsTrigger>
                  <TabsTrigger value="member">Members</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search members..."
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
            ) : filteredMembers.length === 0 ? (
              <div className="text-center p-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No members found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery || roleFilter
                    ? "Try adjusting your filters to see more results"
                    : "Get started by adding your first member"}
                </p>
                <Button onClick={() => setIsAddMemberOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.user.avatarUrl || ""} alt={member.user.name} />
                              <AvatarFallback>{getAvatarFallback(member.user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{member.user.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{member.user.email}</TableCell>
                        <TableCell>{getRoleBadge(member.role)}</TableCell>
                        <TableCell>{format(new Date(member.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => (window.location.href = `mailto:${member.user.email}`)}>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Email</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleChangeMemberRole(member.id, "admin")}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Make Admin</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeMemberRole(member.id, "treasurer")}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Make Treasurer</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeMemberRole(member.id, "member")}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Make Member</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeMemberRole(member.id, "viewer")}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Make Viewer</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                <span>Remove</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Descriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Understanding the different roles and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-medium text-purple-800 dark:text-purple-400">Admin</h3>
                </div>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Full organization access</li>
                  <li>• Manage members and roles</li>
                  <li>• Create and edit all data</li>
                  <li>• Approve transactions</li>
                  <li>• Access all reports</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-medium text-blue-800 dark:text-blue-400">Treasurer</h3>
                </div>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Manage financial data</li>
                  <li>• Create and edit transactions</li>
                  <li>• Approve transactions</li>
                  <li>• Access financial reports</li>
                  <li>• Cannot manage members</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-medium text-green-800 dark:text-green-400">Member</h3>
                </div>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Create transactions</li>
                  <li>• Edit own transactions</li>
                  <li>• View basic reports</li>
                  <li>• Cannot approve transactions</li>
                  <li>• Cannot manage members</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-medium text-gray-800 dark:text-gray-400">Viewer</h3>
                </div>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Read-only access</li>
                  <li>• View transactions</li>
                  <li>• View basic reports</li>
                  <li>• Cannot create or edit data</li>
                  <li>• Cannot approve transactions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

