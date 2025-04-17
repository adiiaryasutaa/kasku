import { Organization } from "@prisma/client";
import { PermissionCreateInput } from "@/types/permission";

export type RoleCreateInput = {
	organization: Organization,
	name: string,
	description: string,
	isDefault?: boolean | null,
	permanent?: boolean | null,
};

export type RoleWithPermissionCreateInput = RoleCreateInput & { permissions: PermissionCreateInput[] };