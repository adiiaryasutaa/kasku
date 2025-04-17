"use client"

import { Edit, Plus, Trash } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/atoms/status-badge"
import { EmptyState } from "@/components/molecules/empty-state"
import { LoadingSpinner } from "@/components/atoms/loading-spinner"
import { Transaction } from "@prisma/client";
import { Avatar } from "@/components/ui/avatar";
import { TransactionCategoryType } from "@/types/category";
import { TransactionData } from "@/types/transaction";

interface TransactionTableProps {
	transactions: TransactionData[];
	isLoading: boolean;
	onAddTransactionAction: () => void
	onEditTransactionAction: (transaction: Transaction) => void
	onDeleteTransactionAction: (transaction: Transaction) => void
}

export function TransactionTable({
																	 transactions,
																	 isLoading,
																	 onAddTransactionAction,
																	 onEditTransactionAction,
																	 onDeleteTransactionAction,
																 }: TransactionTableProps) {
	if (isLoading) {
		return <LoadingSpinner/>
	}

	if (transactions.length === 0) {
		return (
			<EmptyState
				icon={ Plus }
				title="No categories found"
				description="Get started by adding your first transaction"
				actionLabel="Add Transaction"
				onAction={ onAddTransactionAction }
			/>
		)
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Amount</TableHead>
						<TableHead>Date</TableHead>
						<TableHead>User</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{ transactions.map((transaction) => (
						<TableRow key={ transaction.id }>
							<TableCell>
								<div className="flex items-center gap-2">
									<div>
										<div className="font-medium">{ transaction.name }</div>
										{ transaction.description && (
											<div className="text-xs text-muted-foreground">{ transaction.description }</div>
										) }
									</div>
								</div>
							</TableCell>
							<TableCell>{ transaction.category.name }</TableCell>
							<TableCell>
								<StatusBadge
									variant={ transaction.category.type === TransactionCategoryType.INCOME ? "income" : "expense" }
									label={ transaction.category.type === TransactionCategoryType.INCOME ? "Income" : "Expense" }
								/>
							</TableCell>
							<TableCell>${ transaction.amount.toLocaleString() }</TableCell>
							<TableCell>{ new Date(transaction.date).toLocaleDateString() }</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<Avatar/>
									<div>
										<div className="font-medium">{ transaction.user.name }</div>
										<div className="text-xs text-muted-foreground">{ transaction.user.email }</div>
									</div>
								</div>
							</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-2">
									<Button variant="ghost" size="icon" onClick={ () => onEditTransactionAction(transaction) }>
										<Edit className="h-4 w-4"/>
										<span className="sr-only">Edit</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="text-red-600 dark:text-red-400"
										onClick={ () => onDeleteTransactionAction(transaction) }
									>
										<Trash className="h-4 w-4"/>
										<span className="sr-only">Delete</span>
									</Button>
								</div>
							</TableCell>
						</TableRow>
					)) }
				</TableBody>
			</Table>
		</div>
	)
}
