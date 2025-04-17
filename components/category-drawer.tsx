"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Plus, Save } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import db from "@/lib/data";
import { Category } from "@prisma/client";
import { TransactionCategoryType } from "@/types/category";
import { useOrganization } from "@/contexts/organization-context";
import { createCategory, findManyCategories, updateCategory } from "@/actions/category";

interface CategoryDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	type?: "income" | "expense" | "all";
	mode: "create" | "edit" | "browse";
	category?: Category;
	onCategoryCreated?: (category: Category) => void;
	onCategoryUpdated?: (category: Category) => void;
}

export default function CategoryDrawer({
																				 isOpen,
																				 onClose,
																				 type = "all",
																				 mode = "browse",
																				 category,
																				 onCategoryCreated,
																				 onCategoryUpdated,
																			 }: CategoryDrawerProps) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<string>("all");

	const [formData, setFormData] = useState<Partial<Category>>({
		name: "",
		description: "",
	});

	const { currentOrganization } = useOrganization();

	useEffect(() => {
		if (isOpen && mode === "browse") {
			loadCategories();
		}
	}, [isOpen, mode]);

	useEffect(() => {
		if (type !== "all") {
			setActiveTab(type);
		}
	}, [type]);

	useEffect(() => {
		if (mode === "edit" && category) {
			setFormData({
				id: category.id,
				name: category.name,
				description: category.description || "",
				type: category.type,
				organizationId: category.organizationId,
			});
		} else if (mode === "create") {
			// Set default type based on the active tab
			setFormData({
				name: "",
				description: "",
				type:
					type === "income"
						? TransactionCategoryType.INCOME
						: type === "expense"
							? TransactionCategoryType.EXPENSE
							: TransactionCategoryType.BOTH,
			});
		}
	}, [mode, category, type, currentOrganization]);

	async function loadCategories() {
		try {
			setIsLoading(true);
			const data = await findManyCategories({ organizationId: currentOrganization?.id });
			setCategories(data);
		} catch (error) {
			console.error("Error loading categories:", error);
		} finally {
			setIsLoading(false);
		}
	}

	const filteredCategories = categories.filter((category) => {
		if (activeTab === "all") return true;
		if (activeTab === "income")
			return category.type === TransactionCategoryType.INCOME || category.type === TransactionCategoryType.BOTH;
		if (activeTab === "expense")
			return category.type === TransactionCategoryType.EXPENSE || category.type === TransactionCategoryType.BOTH;
		return true;
	});

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				name === "budgetAllocation" ? Number.parseFloat(value) || 0 : value,
		}));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCreateCategory = async () => {
		try {
			if (!formData.name) return;

			const createdCategory: Category | null = await createCategory({
				name: formData.name,
				description: formData.description || "",
				type: Number(formData.type) ?? TransactionCategoryType.BOTH,
				organizationId: currentOrganization?.id,
			});

			if (createdCategory && onCategoryCreated) {
				onCategoryCreated(createdCategory);
			}

			// Reset form
			setFormData({
				name: "",
				description: "",
				type:
					type === "income"
						? TransactionCategoryType.INCOME
						: type === "expense"
							? TransactionCategoryType.EXPENSE
							: TransactionCategoryType.BOTH,
			});
		} catch (error) {
			console.error("Error creating category:", error);
		}
	};

	const handleUpdateCategory = async () => {
		try {
			if (!formData.id || !formData.name) return;

			formData.type = Number(formData.type);

			const updatedCategory: Category | null = await updateCategory({
				where: { id: formData.id },
				input: {
					...formData,
					updatedAt: new Date(),
				}
			});

			if (updatedCategory && onCategoryUpdated) {
				onCategoryUpdated(updatedCategory);
			}
		} catch (error) {
			console.error("Error updating category:", error);
		}
	};

	const renderContent = () => {
		if (mode === "browse") {
			return (
				<div className="py-6">
					<Tabs
						defaultValue={activeTab}
						value={activeTab}
						onValueChange={setActiveTab}
					>
						<TabsList className="grid grid-cols-3 mb-4">
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="income">Income</TabsTrigger>
							<TabsTrigger value="expense">Expense</TabsTrigger>
						</TabsList>

						<TabsContent value={activeTab} className="space-y-4">
							{isLoading ? (
								<div className="flex justify-center py-8">
									<div
										className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
								</div>
							) : (
								<ScrollArea className="h-[500px]">
									<div className="space-y-2">
										{filteredCategories.length === 0 ? (
											<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
												No categories found
											</p>
										) : (
											filteredCategories.map((category) => (
												<div
													key={category.id}
													className="flex items-center justify-between p-3 rounded-md border border-gray-200 dark:border-gray-800"
												>
													<Badge
														variant="outline"
														className={
															category.type === TransactionCategoryType.INCOME
																? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
																: category.type === TransactionCategoryType.EXPENSE
																	? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
																	: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
														}
													>
														{category.type === TransactionCategoryType.BOTH
															? "Both"
															: category.type === TransactionCategoryType.INCOME
																? "Income"
																: "Expense"}
													</Badge>
												</div>
											))
										)}
									</div>
								</ScrollArea>
							)}
						</TabsContent>
					</Tabs>
				</div>
			);
		}

		// Create or Edit form
		return (
			<div className="py-6 space-y-6">
				<div className="space-y-4">
					<div className="grid gap-3">
						<div className="grid gap-1.5">
							<Label htmlFor="name">Name *</Label>
							<Input
								id="name"
								name="name"
								placeholder="Category name"
								value={formData.name}
								onChange={handleInputChange}
							/>
						</div>

						<div className="grid gap-1.5">
							<Label htmlFor="description">Description (Optional)</Label>
							<Textarea
								id="description"
								name="description"
								placeholder="Brief description"
								value={formData.description || ""}
								onChange={handleInputChange}
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="grid gap-1.5">
								<Label htmlFor="type">Type *</Label>
								<Select
									value={String(formData.type || TransactionCategoryType.BOTH)}
									onValueChange={(value) => handleSelectChange("type", value)}
								>
									<SelectTrigger id="type">
										<SelectValue placeholder="Select type"/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={String(TransactionCategoryType.BOTH)}>Both</SelectItem>
										<SelectItem value={String(TransactionCategoryType.INCOME)}>Income</SelectItem>
										<SelectItem value={String(TransactionCategoryType.EXPENSE)}>Expense</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const getTitle = () => {
		if (mode === "create") return "Create Category";
		if (mode === "edit") return "Edit Category";
		return "Manage Categories";
	};

	const getDescription = () => {
		if (mode === "create") return "Create a new transactions category";
		if (mode === "edit") return "Edit an existing transactions category";
		return "Browse and manage transactions categories";
	};

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="sm:max-w-md">
				<SheetHeader>
					<SheetTitle>{getTitle()}</SheetTitle>
					<SheetDescription>{getDescription()}</SheetDescription>
				</SheetHeader>

				{renderContent()}

				<SheetFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
					{mode === "create" && (
						<Button
							onClick={handleCreateCategory}
							disabled={!formData.name}
							className="w-full sm:w-auto"
						>
							<Plus className="h-4 w-4 mr-2"/>
							Create Category
						</Button>
					)}

					{mode === "edit" && (
						<Button
							onClick={handleUpdateCategory}
							disabled={!formData.name}
							className="w-full sm:w-auto"
						>
							<Save className="h-4 w-4 mr-2"/>
							Save Changes
						</Button>
					)}

					<SheetClose asChild>
						<Button variant="outline" className="w-full sm:w-auto">
							Cancel
						</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
