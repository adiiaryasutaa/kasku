"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, X } from 'lucide-react';
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { createTransaction, getCategories, getOrganizations } from "@/lib/database/transaction";
import { toast } from "@/components/ui/use-toast";
import { transactionSchema, TransactionSchema } from "@/lib/zod";

type TransactionDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
	userId: number;
};

export function TransactionDrawer({ open, onOpenChange, onSuccess, userId }: TransactionDrawerProps) {
	const [categories, setCategories] = useState<{ id: number; name: string; type: number }[]>([]);
	const [organizations, setOrganizations] = useState<{ id: number; name: string }[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<TransactionSchema>({
		resolver: zodResolver(transactionSchema),
		defaultValues: {
			title: "",
			description: "",
			amount: 0,
			date: new Date(),
		},
	});

	useEffect(() => {
		async function loadFormData() {
			const [categoriesData, orgsData] = await Promise.all([
				getCategories(),
				getOrganizations(),
			]);
			setCategories(categoriesData);
			setOrganizations(orgsData);
		}

		if (open) {
			loadFormData();
			form.reset();
		}
	}, [open, form]);

	async function onSubmit(values: TransactionSchema) {
		try {
			setIsSubmitting(true);

			const result = await createTransaction({
				...values,
				user_id: userId,
				attachments: [],
			});

			if (result.success) {
				toast({
					title: "Transaction created",
					description: "Your transaction has been created successfully.",
				});
				onOpenChange(false);
				if (onSuccess) onSuccess();
			} else {
				toast({
					title: "Error",
					description: "Failed to create transaction. Please try again.",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error creating transaction:", error);
			toast({
				title: "Error",
				description: "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent side="right" className="h-full">
				<div className="mx-auto w-full max-w-md">
					<DrawerHeader className="text-left">
						<div className="flex items-center justify-between">
							<DrawerTitle>Create New Transaction</DrawerTitle>
							<DrawerClose asChild>
								<Button variant="ghost" size="icon">
									<X className="h-4 w-4" />
								</Button>
							</DrawerClose>
						</div>
						<DrawerDescription>
							Add a new financial transaction to your records.
						</DrawerDescription>
					</DrawerHeader>
					<div className="px-4">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input placeholder="Transaction title" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Add details about this transaction"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="amount"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Amount</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														placeholder="0.00"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="date"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Date</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={"outline"}
																className="w-full pl-3 text-left font-normal"
															>
																{field.value ? (
																	format(field.value, "PPP")
																) : (
																	<span>Pick a date</span>
																)}
																<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="single"
															selected={field.value}
															onSelect={field.onChange}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="category_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value?.toString()}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a category" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{categories.map((category) => (
														<SelectItem
															key={category.id}
															value={category.id.toString()}
														>
															{category.name} ({category.type === 1 ? "Income" : "Expense"})
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="organization_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Organization</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value?.toString()}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select an organization" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{organizations.map((org) => (
														<SelectItem
															key={org.id}
															value={org.id.toString()}
														>
															{org.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<DrawerFooter className="px-0">
									<Button type="submit" disabled={isSubmitting}>
										{isSubmitting ? "Creating..." : "Create Transaction"}
									</Button>
									<DrawerClose asChild>
										<Button variant="outline">Cancel</Button>
									</DrawerClose>
								</DrawerFooter>
							</form>
						</Form>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}