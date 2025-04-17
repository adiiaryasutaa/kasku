"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown, Plus } from "lucide-react";
import { useOrganization } from "@/contexts/organization-context";
import { useState } from "react";
import CreateOrganizationDrawer from "@/components/organisms/organization/create-organization-drawer";
import { type Organization } from "@prisma/client";
import { createOrganization } from "@/actions/organization";
import { type OrganizationFormData } from "@/types"; // Make sure this type is defined

export default function SelectOrganizationDropdown() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const {
		organizations,
		currentOrganization,
		isLoading,
		setCurrentOrganization,
		refresh
	} = useOrganization();

	const handleOrganizationDrawerClosing = () => {
		setIsCreateModalOpen(false);
	};

	const handleOrganizationCreation = async (data: OrganizationFormData) => {
		const result = await createOrganization(data);

		if (result?.success) {
			handleOrganizationDrawerClosing();
			await refresh();
			if (result.data) {
				setCurrentOrganization(result.data as Organization);
			}
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors"
				>
					<Building2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
					<span className="hidden sm:inline text-gray-700 dark:text-gray-300">
						{isLoading
							? "Loading..."
							: currentOrganization?.name || "Select Organization"}
					</span>
					<ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
						Your Organizations
					</div>
					{organizations.map((org) => (
						<DropdownMenuItem
							key={org.id}
							className="cursor-pointer"
							onClick={() => setCurrentOrganization(org)}
						>
							<Building2 className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
							<span>{org.name}</span>
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={() => setIsCreateModalOpen(true)}
					>
						<Plus className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
						<span className="text-blue-600 dark:text-blue-400">
							Create New Organization
						</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<CreateOrganizationDrawer
				isOpen={isCreateModalOpen}
				onClose={handleOrganizationDrawerClosing}
				onCreateOrganization={handleOrganizationCreation}
			/>
		</>
	);
}
