'use server'

import { Organization, UserOrganization, Prisma, PrismaClient } from "@prisma/client";
import { convertToSlug } from "@/lib/utils";
import { OrganizationCreateInput, UserOrganizationCreateInput } from "@/types/organization";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient, User, UserResponse } from "@supabase/supabase-js";
import { findUniqueUser } from "@/actions/user";

const prisma = new PrismaClient();

export async function createOrganization(input: OrganizationCreateInput): Promise<Organization> {
	return await prisma.organization.create({
		data: {
			userId: input.user.id,
			name: input.name,
			description: input.description,
			avatar: input.avatar,
			currency: input.currency,
			yearStart: input.yearStart,
			balance: input.balance,
			slug: convertToSlug(input.name),
		},
	});
}

export async function findManyOrganizations(input: Prisma.OrganizationWhereInput): Promise<Organization[]> {
	return await prisma.organization.findMany({
		where: input,
	});
}

export async function getAuthenticatedUserOrganizations(): Promise<Organization[]> {
	const supabase: SupabaseClient = await createClient();
	const userResponse: UserResponse = await supabase.auth.getUser();
	const user: User | null = userResponse.data.user

	const userDb = await findUniqueUser({
		email: user?.email,
	});

	if (!user || !userDb) {
		return [];
	}

	return await prisma.organization.findMany({
		where: {
			userOrganizations: {
				some: {
					userId: userDb.id,
				},
			},
		},
		include: {
			userOrganizations: {
				include: {
					role: true,
				},
			},
		},
	});
}

export async function addUserToOrganization(input: UserOrganizationCreateInput): Promise<UserOrganization> {
	return await prisma.userOrganization.create({
		data: {
			user: {
				connect: { id: input.user.id },
			},
			organization: {
				connect: { id: input.organization.id },
			},
			role: {
				connect: { id: input.role.id },
			},
		},
	});
}