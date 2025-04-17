import { Shield, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleDescriptionCard } from "@/components/molecules/role-description-card"

export function RoleDescriptionsGrid() {
  const roleDescriptions = [
    {
      title: "Admin",
      icon: Shield,
      color: "purple",
      features: [
        "Full organization access",
        "Manage members and roles",
        "Create and edit all data",
        "Approve transactions",
        "Access all reports",
      ],
    },
    {
      title: "Treasurer",
      icon: Shield,
      color: "blue",
      features: [
        "Manage financial data",
        "Create and edit transactions",
        "Approve transactions",
        "Access financial reports",
        "Cannot manage members",
      ],
    },
    {
      title: "Member",
      icon: User,
      color: "green",
      features: [
        "Create transactions",
        "Edit own transactions",
        "View basic reports",
        "Cannot approve transactions",
        "Cannot manage members",
      ],
    },
    {
      title: "Viewer",
      icon: User,
      color: "gray",
      features: [
        "Read-only access",
        "View transactions",
        "View basic reports",
        "Cannot create or edit data",
        "Cannot approve transactions",
      ],
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions</CardTitle>
        <CardDescription>Understanding the different roles and their permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleDescriptions.map((role) => (
            <RoleDescriptionCard
              key={role.title}
              title={role.title}
              icon={role.icon}
              color={role.color}
              features={role.features}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
