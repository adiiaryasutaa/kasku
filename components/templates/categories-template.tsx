"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Filter, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/molecules/page-header"
import { CategoriesTable } from "@/components/organisms/categories-table"
import { FilterTabs } from "@/components/organisms/filter-tabs"

interface Category {
	id: string
	name: string
	description?: string
	type: "income" | "expense" | "both"
	color: string
	budgetAllocation: number
	organizationId: string
	createdAt: string
	updatedAt: string
}

interface CategoriesTemplateProps {
	categories: Category[]
	filteredCategories: Category[]
	isLoading: boolean
	searchQuery: string
	activeTab: string
	isCreateDrawerOpen: boolean
	isEditDrawerOpen: boolean
	isDeleteModalOpen: boolean
	selectedCategory: Category | null
	categoryToDelete: Category | null
	onSearchChange: (value: string) => void
	onTabChange: (value: string) => void
	onCreateDrawerOpenChange: (open: boolean) => void
	onEditDrawerOpenChange: (open: boolean) => void
	onDeleteModalOpenChange: (open: boolean) => void
	onSelectedCategoryChange: (category: Category | null) => void
	onCategoryToDeleteChange: (category: Category | null) => void
	onDeleteCategory: () => void
	onEditCategory: (category: Category) => void
}

export function CategoriesTemplate({
																		 categories,
																		 filteredCategories,
																		 isLoading,
																		 searchQuery,
																		 activeTab,
																		 isCreateDrawerOpen,
																		 onSearchChange,
																		 onTabChange,
																		 onCreateDrawerOpenChange,
																		 onEditCategory,
																		 onCategoryToDeleteChange,
																		 onDeleteModalOpenChange,
																	 }: CategoriesTemplateProps) {
	const tabs = [
		{ value: "all", label: "All" },
		{ value: "income", label: "Income" },
		{ value: "expense", label: "Expense" },
	]

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
					<Select value={activeTab} onValueChange={onTabChange}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by type"/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							<SelectItem value="income">Income Categories</SelectItem>
							<SelectItem value="expense">Expense Categories</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)

	const handleDeleteCategory = (category: Category) => {
		onCategoryToDeleteChange(category)
		onDeleteModalOpenChange(true)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<PageHeader
					title="Transaction Categories"
					description="Manage categories for your transactions, budgets, and reports"
				/>
				<div className="flex items-center gap-2">
					<Button size="sm" onClick={() => onCreateDrawerOpenChange(true)}>
						<Plus className="mr-2 h-4 w-4"/>
						Add Category
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange}>
						<FilterTabs
							activeTab={activeTab}
							onTabChange={onTabChange}
							searchQuery={searchQuery}
							onSearchChange={onSearchChange}
							tabs={tabs}
							additionalFilters={additionalFilters}
							searchPlaceholder="Search categories..."
						/>
					</Tabs>
				</CardHeader>

				<CardContent>
					<Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange}>
						<TabsContent value={activeTab}>
							<CategoriesTable
								categories={filteredCategories}
								isLoading={isLoading}
								onAddCategory={() => onCreateDrawerOpenChange(true)}
								onEditCategory={onEditCategory}
								onDeleteCategory={handleDeleteCategory}
							/>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	)
}
