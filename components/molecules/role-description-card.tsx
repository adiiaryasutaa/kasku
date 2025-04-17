import type { LucideIcon } from "lucide-react"

interface RoleDescriptionCardProps {
  title: string
  icon: LucideIcon
  color: string
  features: string[]
}

export function RoleDescriptionCard({ title, icon: Icon, color, features }: RoleDescriptionCardProps) {
  const colorClasses = {
    purple:
      "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 text-purple-800 dark:text-purple-400",
    blue: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-blue-800 dark:text-blue-400",
    green:
      "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 text-green-800 dark:text-green-400",
    gray: "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400 text-gray-800 dark:text-gray-400",
  }

  const classes = colorClasses[color as keyof typeof colorClasses]

  return (
    <div className={`p-4 border rounded-lg ${classes}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5`} />
        <h3 className="font-medium">{title}</h3>
      </div>
      <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
        {features.map((feature, index) => (
          <li key={index}>• {feature}</li>
        ))}
      </ul>
    </div>
  )
}
