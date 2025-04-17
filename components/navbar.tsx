"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Bell } from "lucide-react";
import Profile01 from "./profile-01";
import { Breadcrumb } from "@/components/breadcrumb";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import SelectOrganizationDropdown from "@/components/organisms/organization/select-organization-dropdown";
import NotificationModal from "./notification-modal";
import { Badge } from "@/components/ui/badge";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

export default function TopNav() {
	const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
	const [unreadNotifications, setUnreadNotifications] = useState(0);

	const breadcrumbs: BreadcrumbItem[] = [
		{ label: "Kasku", href: "#" },
		{ label: "Financial Dashboard", href: "#" },
	];

	return (
		<>
			<nav
				className="px-3 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full">
				<div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]">
					<Breadcrumb/>
				</div>

				<div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
					<SelectOrganizationDropdown/>

					<div className="relative">
						<button
							type="button"
							className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors"
							onClick={() => setIsNotificationModalOpen(true)}
						>
							<Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300"/>
							{unreadNotifications > 0 && (
								<Badge
									variant="destructive"
									className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] text-[10px] flex items-center justify-center"
								>
									{unreadNotifications}
								</Badge>
							)}
						</button>
					</div>

					<ThemeToggle/>

					<DropdownMenu>
						<DropdownMenuTrigger className="focus:outline-none">
							<Image
								src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
								alt="User avatar"
								width={28}
								height={28}
								className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] sm:w-8 sm:h-8 cursor-pointer"
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							sideOffset={8}
							className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
						>
							<Profile01
								avatar="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"/>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</nav>

			<NotificationModal
				isOpen={isNotificationModalOpen}
				onClose={() => setIsNotificationModalOpen(false)}
			/>
		</>
	);
}
