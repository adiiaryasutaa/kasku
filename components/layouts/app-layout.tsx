"use client";

import Sidebar from "../sidebar";
import TopNav from "../navbar";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { OrganizationProvider } from "@/contexts/organization-context";
import { Toaster } from "@/components/ui/toaster";

export default function AppLayout({ children }: { children: React.ReactNode }): React.ReactNode {
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<OrganizationProvider>
			<div className={`flex h-screen ${theme === "dark" ? "dark" : ""}`}>
				<Sidebar/>
				<div className="w-full flex flex-1 flex-col">
					<header className="h-16 border-b border-gray-200 dark:border-[#1F1F23]">
						<TopNav/>
					</header>
					<main className="flex-1 overflow-auto p-6 bg-white dark:bg-[#0F0F12]">
						{children}
					</main>
				</div>
			</div>
			<Toaster/>
		</OrganizationProvider>
	);
}
