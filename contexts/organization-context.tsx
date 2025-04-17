"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { type Organization } from "@prisma/client";
import { getAuthenticatedUserOrganizations } from "@/actions/organization";

interface OrganizationContextType {
	organizations: Organization[];
	currentOrganization: Organization | null;
	isLoading: boolean;
	setCurrentOrganization: (organization: Organization) => void;
	refresh: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType>({
	organizations: [],
	currentOrganization: null,
	isLoading: true,
	setCurrentOrganization: () => {},
	refresh: async () => {},
});

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const fetchOrganization = async (): Promise<void> => {
		setIsLoading(true);
		try {
			const organizations = await getAuthenticatedUserOrganizations();
			setOrganizations(organizations);

			console.log(organizations);

			if (organizations.length > 0) {
				setCurrentOrganization(organizations[0]);
			}
		} catch (error) {
			console.error("Failed to fetch organizations", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchOrganization();
	}, []); // ✅ Only run on mount

	return (
		<OrganizationContext.Provider
			value={{
				organizations,
				currentOrganization,
				isLoading,
				setCurrentOrganization,
				refresh: fetchOrganization,
			}}
		>
			{children}
		</OrganizationContext.Provider>
	);
};

export const useOrganization = () => useContext(OrganizationContext);
