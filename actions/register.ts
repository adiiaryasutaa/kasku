'use server'

import { Organization, Prisma, Role, User, UserOrganization } from '@prisma/client';
import { z } from 'zod';
import { RegisterSchema } from "@/lib/zod";
import { createUser } from "@/actions/user";
import { OrganizationCreateInput } from "@/types/organization";
import { addUserToOrganization, createOrganization } from "@/actions/organization";
import { RoleWithPermissionCreateInput } from "@/types/role";
import { createRolesWithPermissions } from "@/actions/role";
import { getDefaultOrganizationCreateInput, getDefaultRoleWithPermissionCreateInputs } from "@/lib/new-user";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { AuthResponse, SupabaseClient } from "@supabase/supabase-js";

export async function register(schema: RegisterSchema) {
	try {
		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: schema.email },
		});

		if (existingUser) {
			return { success: false, message: "Email already in use" };
		}

		const supabase: SupabaseClient = await createClient();
		const response: AuthResponse = await supabase.auth.signUp({ email: schema.email, password: schema.password });

		if (response.error) {
			throw new Error(response.error.message);
		}

		const userCreateInput: Prisma.UserCreateInput = {
			name: schema.name,
			email: schema.email,
			avatar: null,
		};

		const user: User = await prisma.$transaction<User>(async (tx) => {
			const user: User = await createUser(userCreateInput);

			if (!user) {
				throw new Error("Failed to create user");
			}

			const organizationCreateInput: OrganizationCreateInput = getDefaultOrganizationCreateInput(user);
			const organization: Organization = await createOrganization(organizationCreateInput);

			if (!organization) {
				throw new Error("Failed to create organization");
			}

			const roleCreateInput: RoleWithPermissionCreateInput[] = getDefaultRoleWithPermissionCreateInputs(organization);
			const roles: Role[] = await createRolesWithPermissions(roleCreateInput);

			if (!roles.length) {
				throw new Error("Failed to create role");
			}

			const userOrganization: UserOrganization = await addUserToOrganization({
				user, organization, role: roles[0]
			});

			if (!userOrganization) {
				throw new Error("Failed to create role");
			}

			return user;
		});


		return { success: true, user: user };
	} catch (error) {
		console.error("Registration error:", error);
		if (error instanceof z.ZodError) {
			return { success: false, message: error.errors[0].message };
		}

		return { success: false, message: "An unexpected error occurred" };
	}
}