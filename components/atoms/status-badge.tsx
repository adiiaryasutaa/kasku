import { Badge } from "@/components/ui/badge"

type StatusVariant =
	| "pending"
	| "approved"
	| "rejected"
	| "default"
	| "system"
	| "custom"
	| "admin"
	| "treasurer"
	| "member"
	| "viewer"
	| "income"
	| "expense"
	| "both"
	| "budget"
	| "category"

interface StatusBadgeProps {
	variant: StatusVariant
	label: string
}

export function StatusBadge({ variant, label }: StatusBadgeProps) {
	const variantStyles = {
		// Role badges
		default:
			"bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
		system: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
		custom:
			"bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",

		// Member role badges
		admin:
			"bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
		treasurer: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
		member:
			"bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
		viewer: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",

		// Approval status badges
		pending:
			"bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
		approved:
			"bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
		rejected: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",

		// Transaction type badges
		income:
			"bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
		expense: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
		both: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
		budget: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
		category:
			"bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
	}

	return (
		<Badge variant="outline" className={ variantStyles[variant] }>
			{ label }
		</Badge>
	)
}
