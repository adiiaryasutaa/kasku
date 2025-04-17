"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, CalendarIcon, Upload, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { OrganizationFormData } from "@/app/[organization]/action";
import { currencies } from "@/lib/database/currency";

interface CreateOrganizationDrawerProps {
	isOpen: boolean
	onClose: () => void
	onCreateOrganization: (data: OrganizationFormData) => void
}

export default function CreateOrganizationDrawer({
	isOpen,
	onClose,
	onCreateOrganization,
}: CreateOrganizationDrawerProps) {
	const [formData, setFormData] = useState<OrganizationFormData>({
		name: "",
		description: "",
		avatar: "",
		currency: currencies.USD.value,
		yearStart: new Date(),
		balance: BigInt(0)
	});
	const [logoPreview, setLogoPreview] = useState<string | null>(null)
	const [errors, setErrors] = useState<Partial<Record<keyof OrganizationFormData, string>>>({})

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target

		setFormData((prev) => ({ ...prev, [name]: value }))

		// Clear error when user database
		if (errors[name as keyof OrganizationFormData]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }))
		}
	}

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }))

		// Clear error when user selects
		if (errors[name as keyof OrganizationFormData]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }))
		}
	}

	const handleDateChange = (date: Date | undefined) => {
		setFormData((prev) => ({ ...prev, fiscalYearStart: date }))

		// Clear error when user selects date
		if (errors.yearStart) {
			setErrors((prev) => ({ ...prev, fiscalYearStart: undefined }))
		}
	}

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) {
			setLogoPreview(null)
			setFormData((prev) => ({ ...prev, logoUrl: null }))
			return
		}

		const file = e.target.files[0]

		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => {
				const result = reader.result as string
				setLogoPreview(result)
				setFormData((prev) => ({ ...prev, logoUrl: result }))
			}
			reader.readAsDataURL(file)
		}
	}

	const removeLogo = () => {
		setFormData((prev) => ({ ...prev, logoUrl: null }))
		setLogoPreview(null)
	}

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof OrganizationFormData, string>> = {}

		if (!formData.name.trim()) {
			newErrors.name = "Organization name is required"
		}

		if (formData.balance && isNaN(Number(formData.balance))) {
			newErrors.balance = "Initial balance must be a number"
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (validateForm()) {
			onCreateOrganization(formData)
			onClose()
		}
	}

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
				<SheetHeader>
					<SheetTitle className="text-xl flex items-center gap-2">
						<Building2 className="w-5 h-5"/>
						Create New Organization
					</SheetTitle>
					<SheetDescription>Set up a new organization to track finances and manage budgets.</SheetDescription>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="space-y-6 py-4">
					<div className="space-y-4">
						{/* Organization Logo */}
						<div className="flex flex-col items-center justify-center gap-2">
							<div
								className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
								{logoPreview ? (
									<div className="relative w-full h-full">
										<img
											src={logoPreview || "/placeholder.svg"}
											alt="Organization logo"
											className="w-full h-full object-cover"
										/>
										<button
											type="button"
											onClick={removeLogo}
											className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
										>
											<X className="w-3 h-3"/>
										</button>
									</div>
								) : (
									<Building2 className="w-10 h-10 text-zinc-400 dark:text-zinc-500"/>
								)}
							</div>

							<div className="flex items-center gap-2">
								<Label
									htmlFor="logo-upload"
									className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1"
								>
									<Upload className="w-3.5 h-3.5"/>
									Upload Logo
								</Label>
								<Input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange}/>
							</div>
						</div>

						{/* Organization Name */}
						<div className="space-y-2">
							<Label htmlFor="name">
								Organization Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								placeholder="e.g., Student Council, Debate Club"
								className={errors.name ? "border-red-500" : ""}
							/>
							{errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								value={formData.description ?? ""}
								onChange={handleInputChange}
								placeholder="Brief description of your organization"
								className="resize-none"
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Currency */}
							<div className="space-y-2">
								<Label htmlFor="currency">Default Currency</Label>
								<Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
									<SelectTrigger id="currency">
										<SelectValue placeholder="Select currency"/>
									</SelectTrigger>
									<SelectContent>
										{Object.values(currencies).map((currency) => (
											<SelectItem key={currency.value} value={currency.value}>
												{currency.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Fiscal Year Start */}
							<div className="space-y-2">
								<Label htmlFor="fiscalYearStart">Fiscal Year Start</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!formData.yearStart && "text-muted-foreground",
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4"/>
											{formData.yearStart ? format(formData.yearStart, "PPP") : <span>Pick a date</span>}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={formData.yearStart}
											onSelect={handleDateChange}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>

						{/* Initial Balance */}
						<div className="space-y-2">
							<Label htmlFor="initialBalance">Initial Balance</Label>
							<div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  {currencies[formData.currency]["symbol"]}
                </span>
								<Input
									id="initialBalance"
									name="initialBalance"
									value={Number(formData.balance)}
									onChange={handleInputChange}
									placeholder="0.00"
									className={cn("pl-8", errors.balance ? "border-red-500" : "")}
								/>
							</div>
							{errors.balance && <p className="text-xs text-red-500">{errors.balance}</p>}
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								Optional: Set an initial balance for this organization
							</p>
						</div>
					</div>

					<SheetFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Create Organization</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	)
}

