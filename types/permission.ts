import { Role } from "@prisma/client";

export enum Permission {
	ALL = 0,
	VIEW_DASHBOARD = 1,
	VIEW_REPORT = 2,
	CREATE_TRANSACTIONS = 3,
	EDIT_TRANSACTIONS = 4,
	DELETE_TRANSACTION = 5,
	APPROVE_TRANSACTIONS = 6,
	VIEW_MEMBERS = 7,
	INVITE_MEMBERS = 8,
	REMOVE_MEMBERS = 9,
	MANAGE_ROLES = 10,
	EDIT_ORGANIZATION = 11,
	MANAGE_CATEGORY = 12,
	MANAGE_BUDGET = 13,
}

export interface PermissionCategory {
	id: string
	name: string
	permissions: Omit<Permission, "isGranted">[]
}

export type PermissionCreateInput = {
	role: Role;
	permission: number;
};