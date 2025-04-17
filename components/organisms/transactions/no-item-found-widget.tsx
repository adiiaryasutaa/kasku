import { Wallet } from "lucide-react";
import { CreateButton } from "@/components/molecules/button";

export default function NoItemFoundWidget({ filtered }: { filtered: boolean|false }) {
	return (
		<div className="text-center p-8">
			<Wallet className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
			<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
				No transactions found
			</h3>
			<p className="text-gray-500 dark:text-gray-400 mb-4">
				{ filtered
					? "Try adjusting your filters to see more results"
					: "Get started by creating your first transactions"}
			</p>

			<CreateButton action={() => {}} label={'New Transaction'} />
		</div>
	)
}