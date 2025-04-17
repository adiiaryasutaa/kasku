"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoryData } from "@/types/category";
import { Controller, useForm } from "react-hook-form";
import { transactionSchema, TransactionSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionData, TransactionType } from "@/types/transaction"
import { findManyCategories } from "@/actions/category";
import { useOrganization } from "@/contexts/organization-context";

export enum OpenMode {
	CREATE = "CREATE",
	VIEW = "VIEW",
	EDIT = "EDIT",
}

interface TransactionDrawerProps {
	isOpen: boolean;
	onOpenChangeAction: (open: boolean) => void;
	onCreateAction: (data: TransactionSchema) => Promise<void>;
	onUpdateAction: (transaction: TransactionData, data: TransactionSchema) => Promise<void>;
	transaction?: TransactionData; // For editing existing transactions
	mode?: OpenMode;
}

export default function TransactionDrawer({
																						isOpen,
																						onOpenChangeAction,
																						onCreateAction,
																						onUpdateAction,
																						transaction,
																						mode = OpenMode.CREATE,
																					}: TransactionDrawerProps) {
	const [categories, setCategories] = useState<CategoryData[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const { currentOrganization } = useOrganization();
	const isReadOnly = mode === OpenMode.VIEW;

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<TransactionSchema>({
		resolver: zodResolver(transactionSchema),
		defaultValues: {
			name: transaction?.name ?? "",
			description: transaction?.description ?? "",
			amount: Number(transaction?.amount) ?? 0,
			category: Number(transaction?.category.id) ?? 0,
			type: transaction?.type ? TransactionType[transaction.type].toString() : TransactionType.INCOME.toString(),
			date: transaction?.date ? new Date(transaction.date) : new Date(),
		},
	});

	useEffect(() => {
		setIsLoading(true);

		const loadCategories = async () => {
			const categories = await findManyCategories({
				deletedAt: null,
				organizationId: currentOrganization?.id,
			});

			setCategories(categories);
		}

		loadCategories().then(r => r);

		setIsLoading(false);
	}, []);

	const onSubmit = async (data: TransactionSchema): Promise<void> => {
		setIsLoading(true);

		switch (mode) {
			case OpenMode.CREATE:
				await onCreateAction(data);
				break;
			case OpenMode.EDIT:
				if (transaction) {
					await onUpdateAction(transaction, data);
				}
				break;
			default:
				onOpenChangeAction(false);
		}

		setIsLoading(false);
	}

	return (
		<>
			<Sheet open={ isOpen } onOpenChange={ onOpenChangeAction }>
				<SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
					<SheetHeader>
						<SheetTitle>
							{ mode === OpenMode.CREATE ? "Create New Transaction" : mode === OpenMode.EDIT ? "Edit Transaction" : `View ${ transaction?.name } Transaction` }
						</SheetTitle>
						<SheetDescription>
							{ mode === OpenMode.CREATE ? "Add a new transactions to your records" : mode === OpenMode.EDIT ? "Update transactions information" : transaction?.description ?? "View transactions details" }
						</SheetDescription>
					</SheetHeader>

					<form onSubmit={ handleSubmit(onSubmit) } className="space-y-6 py-4">
						{/* Title */ }
						<div className="space-y-2">
							<Label htmlFor="name">Title *</Label>
							<Controller
								name="name"
								control={ control }
								render={ ({ field }) => (
									<Input
										{ ...field }
										placeholder="e.g., Office Supplies"
										readOnly={ isReadOnly }
										className={ errors.name ? "border-red-500" : "" }
									/>
								) }
							/>
							{ errors.name && <p className="text-xs text-red-500">{ errors.name.message }</p> }
						</div>

						{/* Description */ }
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Controller
								name="description"
								control={ control }
								render={ ({ field }) => (
									<Textarea
										{ ...field }
										placeholder="Brief description of the transaction"
										readOnly={ isReadOnly }
										className="resize-none"
										rows={ 3 }
									/>
								) }
							/>
						</div>

						{/* Amount */ }
						<div className="space-y-2">
							<Label htmlFor="amount">Amount *</Label>
							<Controller
								name="amount"
								control={ control }
								render={ ({ field }) => (
									<div className="relative">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
										<Input
											{ ...field }
											type="number"
											placeholder="0.00"
											className={ `pl-8 ${ errors.amount ? "border-red-500" : "" }` }
											readOnly={ isReadOnly }
										/>
									</div>
								) }
							/>
							{ errors.amount && <p className="text-xs text-red-500">{ errors.amount.message }</p> }
						</div>

						{/* Category */ }
						<div className="space-y-2">
							<Label htmlFor="category">Category *</Label>
							<Controller
								name="category"
								control={ control }
								render={ ({ field }) => (
									<Select
										disabled={ isReadOnly }
										onValueChange={ field.onChange }
										value={ field.value?.toString() }
									>
										<SelectTrigger id="category" className={ errors.category ? "border-red-500" : "" }>
											<SelectValue placeholder="Select category"/>
										</SelectTrigger>
										<SelectContent>
											{ categories.map((cat) => (
												<SelectItem key={ cat.id } value={ cat.id.toString() }>
													{ cat.name }
												</SelectItem>
											)) }
										</SelectContent>
									</Select>
								) }
							/>
							{ errors.category && <p className="text-xs text-red-500">{ errors.category.message }</p> }
						</div>

						{/* Type */ }
						<div className="space-y-2">
							<Label htmlFor="type">Type *</Label>
							<Controller
								name="type"
								control={ control }
								render={ ({ field }) => (
									<Select
										disabled={ isReadOnly }
										onValueChange={ field.onChange }
										value={ field.value }
									>
										<SelectTrigger id="type">
											<SelectValue placeholder="Select type"/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="income">Income</SelectItem>
											<SelectItem value="expense">Expense</SelectItem>
										</SelectContent>
									</Select>
								) }
							/>
						</div>
					</form>

					{/* Footer */ }
					<SheetFooter>
						<Button type="button" variant="outline" onClick={ () => onOpenChangeAction(false) }>
							{ isReadOnly ? "Close" : "Cancel" }
						</Button>
						{ !isReadOnly && (
							<Button type="submit" disabled={ isLoading }>
								{ isLoading ? "Saving..." : mode === OpenMode.CREATE ? "Create" : "Save Changes" }
							</Button>
						) }
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	)
}

