import { Badge } from "@/components/ui/badge"

type RoleBadgeVariant = "default" | "system" | "custom"

interface RoleBadgeProps {
  variant: RoleBadgeVariant
  label: string
}

export function RoleBadge({ variant, label }: RoleBadgeProps) {
  const variantStyles = {
    default:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    system: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    custom:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  }

  return (
    <Badge variant="outline" className={variantStyles[variant]}>
      {label}
    </Badge>
  )
}
