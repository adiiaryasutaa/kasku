"use server"

import { PrismaClient, type User, type UserOrganization } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import type { SupabaseClient, User as SupabaseUser, UserResponse } from "@supabase/supabase-js"
import { findUniqueUser } from "@/actions/user"

const prisma = new PrismaClient()

export type MemberWithUser = UserOrganization & {
	user: User
}

export async function findOrganizationMembers(organizationId: string | number): Promise<MemberWithUser[]> {
	return await prisma.userOrganization.findMany({
		where: {
			organizationId: typeof organizationId === "string" ? BigInt(organizationId) : organizationId,
			deletedAt: null,
		},
		include: {
			user: true,
			role: true,
		},
	})
}

export async function getCurrentOrganizationMembers(): Promise<MemberWithUser[]> {
	const supabase: SupabaseClient = await createClient()
	const userResponse: UserResponse = await supabase.auth.getUser()
	const user: SupabaseUser | null = userResponse.data.user

	if (!user) {
		return []
	}

	const userDb = await findUniqueUser({
		email: user.email,
	})

	if (!userDb) {
		return []
	}

	// Get the current organization (this could be stored in a cookie or session)
	// For now, we'll just get the first organization the user is a member of
	const userOrg = await prisma.userOrganization.findFirst({
		where: {
			userId: userDb.id,
			deletedAt: null,
		},
		include: {
			organization: true,
		},
	})

	if (!userOrg) {
		return []
	}

	return await findOrganizationMembers(userOrg.organizationId)
}

export async function addMemberToOrganization(
	email: string,
	roleId: string | number,
	organizationId: string | number,
): Promise<MemberWithUser | null> {
	// Check if user exists
	const user = await prisma.user.findUnique({
		where: { email },
	})

	if (!user) {
		// In a real app, you might want to create the user or send an invitation
		// For now, we'll just return null
		return null
	}

	// Check if user is already a member of the organization
	const existingMember = await prisma.userOrganization.findFirst({
		where: {
			userId: user.id,
			organizationId: typeof organizationId === "string" ? BigInt(organizationId) : organizationId,
			deletedAt: null,
		},
	})

	if (existingMember) {
		// User is already a member, update their role
		return await prisma.userOrganization.update({
			where: { id: existingMember.id },
			data: {
				roleId: typeof roleId === "string" ? BigInt(roleId) : roleId,
				updatedAt: new Date(),
			},
			include: {
				user: true,
			},
		})
	}

	// Add user to organization
	return await prisma.userOrganization.create({
		data: {
			userId: user.id,
			organizationId: typeof organizationId === "string" ? BigInt(organizationId) : organizationId,
			roleId: typeof roleId === "string" ? BigInt(roleId) : roleId,
		},
		include: {
			user: true,
		},
	})
}

export async function updateMemberRole(memberId: string | number, roleId: string | number): Promise<MemberWithUser> {
	return await prisma.userOrganization.update({
		where: {
			id: typeof memberId === "string" ? BigInt(memberId) : memberId,
		},
		data: {
			roleId: typeof roleId === "string" ? BigInt(roleId) : roleId,
			updatedAt: new Date(),
		},
		include: {
			user: true,
		},
	})
}

export async function removeMember(memberId: string | number): Promise<void> {
	// Soft delete the member
	await prisma.userOrganization.update({
		where: {
			id: typeof memberId === "string" ? BigInt(memberId) : memberId,
		},
		data: {
			deletedAt: new Date(),
			updatedAt: new Date(),
		},
	})
}
