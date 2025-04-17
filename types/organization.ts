import { Organization, Role, User } from "@prisma/client";

export type OrganizationCreateInput = {
	user: User,
	name: string,
	description?: string | null,
	avatar?: string | null,
	currency?: string | null,
	yearStart?: Date | null,
	balance?: number | null,
	permanent?: boolean | null,
};

export type UserOrganizationCreateInput = {
	user: User,
	organization: Organization,
	role: Role,
}