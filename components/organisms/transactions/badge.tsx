import { Badge } from "@/components/ui/badge";

const CompleteBadge = () => {
	return (
		<Badge
			variant="outline"
			className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
		>
			Completed
		</Badge>
	);
};

const PendingBadge = () => {
	return (
		<Badge
			variant="outline"
			className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
		>
			Pending
		</Badge>
	);
};

const RejectedBadge = () => {
	return (
		<Badge
			variant="outline"
			className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
		>
			Rejected
		</Badge>
	);
};

export { CompleteBadge, PendingBadge, RejectedBadge };