import { Organization, User } from "@prisma/client";
import { OrganizationCreateInput } from "@/types/organization";
import { RoleWithPermissionCreateInput } from "@/types/role";
import { Permission, PermissionCreateInput } from "@/types/permission";

export const getDefaultOrganizationCreateInput = (user: User): OrganizationCreateInput => {
	return {
		name: `${user.name}'s organization`,
		description: null,
		avatar: null,
		balance: 0,
		currency: 'USD',
		permanent: true,
		user: user,
		yearStart: new Date(),
	} as OrganizationCreateInput;
};

export const getDefaultRoleWithPermissionCreateInputs = (organization: Organization): RoleWithPermissionCreateInput[] => {
	return [
		{
			organization: organization,
			name: 'Admin',
			description: 'Full access to all organization features',
			isDefault: false,
			permanent: true,
			permissions: [
				{ permission: Permission.ALL },
			] as PermissionCreateInput[],
		},
		{
			organization: organization,
			name: 'Treasurer',
			description: 'Can manage finances and approve transactions',
			isDefault: false,
			permanent: true,
			permissions: [
				{ permission: Permission.VIEW_DASHBOARD },
				{ permission: Permission.VIEW_REPORT },
				{ permission: Permission.CREATE_TRANSACTIONS },
				{ permission: Permission.EDIT_TRANSACTIONS },
				{ permission: Permission.DELETE_TRANSACTION },
				{ permission: Permission.APPROVE_TRANSACTIONS },
				{ permission: Permission.VIEW_MEMBERS },
				{ permission: Permission.MANAGE_CATEGORY },
				{ permission: Permission.MANAGE_BUDGET },
			] as PermissionCreateInput[],
		},
		{
			organization: organization,
			name: 'Member',
			description: 'Can create transactions and view basic reports',
			isDefault: false,
			permanent: true,
			permissions: [
				{ permission: Permission.VIEW_DASHBOARD },
				{ permission: Permission.VIEW_REPORT },
				{ permission: Permission.CREATE_TRANSACTIONS },
				{ permission: Permission.VIEW_MEMBERS },
			] as PermissionCreateInput[],
		},
		{
			organization: organization,
			name: 'Viewer',
			description: 'Read-only access to organization data',
			isDefault: true,
			permanent: true,
			permissions: [
				{ permission: Permission.VIEW_DASHBOARD },
				{ permission: Permission.VIEW_REPORT },
				{ permission: Permission.VIEW_MEMBERS },
			] as PermissionCreateInput[],
		},
	] as RoleWithPermissionCreateInput[];
};