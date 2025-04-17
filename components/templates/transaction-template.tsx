"use client"

import { CreateButton } from "@/components/molecules/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { Transaction } from "@prisma/client";
import { PageHeader } from "../molecules/page-header";
import { TransactionCategoryType } from "@/types/category";
import { FilterTabs } from "@/components/organisms/filter-tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionTable } from "@/components/organisms/transactions/transaction-table";
import TransactionDrawer from "@/components/transaction-drawer";
import { TransactionData } from "@/types/transaction";
import { TransactionSchema } from "@/lib/zod";

interface TransactionTemplateProps {
	transaction: TransactionData[];
	filteredTransactions: TransactionData[];
	paginatedTransactions: TransactionData[];
	isLoading: boolean;
	searchQuery: string;
	activeTab: TransactionCategoryType;
	isDrawerOpen: boolean;
	onCreateAction: (data: TransactionSchema) => Promise<void>;
	onUpdateAction: (transaction: TransactionData, data: TransactionSchema) => Promise<void>;
	onDeleteAction: (transaction: TransactionData) => Promise<void>;
	onSearchChangeAction: (value: string) => void;
	onTabChangeAction: (value: string) => void
	onDrawerOpenChangeAction: (open: boolean) => void;
	onEditDrawerOpenChange: (open: boolean) => void;
	onDeleteModalOpenChange: (open: boolean) => void;
	onEditTableAction: (transaction: Transaction) => void;
	onDeleteModalAction: (transaction: Transaction) => void;
}

export interface TransactionTab {
	label: string;
	value: string;
}

export function TransactionTemplate({
																			transaction,
																			filteredTransactions,
																			paginatedTransactions,
																			isLoading,
																			searchQuery,
																			activeTab,
																			isDrawerOpen,
																			onCreateAction,
																			onUpdateAction,
																			onSearchChangeAction,
																			onTabChangeAction,
																			onDrawerOpenChangeAction,
																			onEditTableAction,
																			onDeleteModalAction,
																		}: TransactionTemplateProps) {
	const tabs: TransactionTab[] = [
		{ value: TransactionCategoryType.BOTH.toString(), label: "All" },
		{ value: TransactionCategoryType.INCOME.toString(), label: "Income" },
		{ value: TransactionCategoryType.EXPENSE.toString(), label: "Expense" },
	];

	const additionalFilters = (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="h-9">
					<Filter className="mr-2 h-4 w-4"/>
					Filter
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[200px]">
				<div className="p-2 border-t border-gray-100 dark:border-gray-800">
					<p className="text-sm font-medium mb-2">Status</p>
					<Select value={ activeTab.toString() } onValueChange={ onTabChangeAction }>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by type"/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={ TransactionCategoryType.BOTH.toString() }>All</SelectItem>
							<SelectItem value={ TransactionCategoryType.INCOME.toString() }>Income</SelectItem>
							<SelectItem value={ TransactionCategoryType.EXPENSE.toString() }>Expense</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<PageHeader
					title="Transactions"
					description="View and manage all financial transactions"
				/>
				<div className="flex items-center gap-2">
					<CreateButton
						action={ () => onDrawerOpenChangeAction(true) }
						label="New Transaction"
					/>
				</div>
			</div>

			<Card className="overflow-hidden">
				<CardHeader>
					<Tabs
						defaultValue={ TransactionCategoryType.BOTH.toString() }
						value={ activeTab.toString() }
						onValueChange={ onTabChangeAction }
					>
						<FilterTabs
							activeTab={ activeTab.toString() }
							onTabChange={ onTabChangeAction }
							searchQuery={ searchQuery }
							onSearchChange={ onSearchChangeAction }
							tabs={ tabs }
							additionalFilters={ additionalFilters }
							searchPlaceholder="Search categories..."
						/>
					</Tabs>
				</CardHeader>
				<CardContent>
					<Tabs
						defaultValue={ TransactionCategoryType.BOTH.toString() }
						onValueChange={ onTabChangeAction }
					>
						<TabsContent value={ activeTab.toString() }>
							<TransactionTable
								transactions={ filteredTransactions }
								isLoading={ isLoading }
								onAddTransactionAction={ () => onDrawerOpenChangeAction(true) }
								onEditTransactionAction={ onEditTableAction }
								onDeleteTransactionAction={ onDeleteModalAction }
							/>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			<TransactionDrawer
				isOpen={ isDrawerOpen }
				onOpenChangeAction={ onDrawerOpenChangeAction }
				onCreateAction={ onCreateAction }
				onUpdateAction={ onUpdateAction }
			/>
		</div>
	);
}