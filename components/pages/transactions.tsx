"use client";

import React, { useState } from "react";
import { TransactionTemplate } from "@/components/templates/transaction-template";
import { TransactionCategoryType } from "@/types/category";
import { Transaction } from "@prisma/client";
import AppLayout from "@/components/layouts/app-layout";
import { TransactionData } from "@/types/transaction";
import { TransactionSchema } from "@/lib/zod";

export default function Transactions(): React.ReactNode {
	const [transactions, setTransactions] = useState<TransactionData[]>([]);
	const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [activeTab, setActiveTab] = useState<TransactionCategoryType>(TransactionCategoryType.BOTH);
	const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState(1);

	const itemsPerPage = 10;

	const onSearchChange: (value: string) => void = (value: string): void => {
	};

	const onTabChange: (value: string) => void = (value: string): void => {
	};

	const onDrawerOpenChangeAction: (open: boolean) => void = (open: boolean): void => {
		setIsDrawerOpen(open);
	};

	const onEditDrawerOpenChange: (open: boolean) => void = (open: boolean): void => {
	};

	const onDeleteModalOpenChange: (open: boolean) => void = (open: boolean): void => {
	};

	const onEditTableAction: (transaction: Transaction) => void = (transaction: Transaction): void => {
	};

	const onDeleteModalAction: (transaction: Transaction) => void = (transaction: Transaction): void => {
	};

	const onDrawerCloseAction: () => void = (): void => {
	};

	const onCreateAction: (data: TransactionSchema) => Promise<void> = (data: TransactionSchema): Promise<void> => {

	};

	const onUpdateAction: (transaction: TransactionData, data: TransactionSchema) => Promise<void> = (transaction: TransactionData, data: TransactionSchema): Promise<void> => {

	};

	const onDeleteAction: (transaction: TransactionData) => Promise<void> = (transaction: TransactionData): Promise<void> => {

	};

	return (
		<AppLayout>
			<TransactionTemplate
				transaction={ transactions }
				filteredTransactions={ transactions }
				paginatedTransactions={ transactions }
				isLoading={ isLoading }
				searchQuery={ searchQuery }
				activeTab={ activeTab }
				isDrawerOpen={ isDrawerOpen }
				onSearchChangeAction={ onSearchChange }
				onTabChangeAction={ onTabChange }
				onDrawerOpenChangeAction={ onDrawerOpenChangeAction }
				onEditDrawerOpenChange={ onEditDrawerOpenChange }
				onDeleteModalOpenChange={ onDeleteModalOpenChange }
				onEditTableAction={ onEditTableAction }
				onDeleteModalAction={ onDeleteModalAction }
				onCreateAction={ onCreateAction }
				onUpdateAction={ onUpdateAction }
				onDeleteAction={ onDeleteAction }
			/>
		</AppLayout>
	);
}