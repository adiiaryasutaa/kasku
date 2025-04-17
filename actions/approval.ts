"use server"

import { PrismaClient, type Approval, type Transaction, type User, type Category, type Prisma } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import type { SupabaseClient, User as SupabaseUser, UserResponse } from "@supabase/supabase-js"
import { findUniqueUser } from "@/actions/user"

const prisma = new PrismaClient()

export type ApprovalWithDetails = Approval & {
	transaction: Transaction & {
		category: Category
	}
	user: User
}

export async function findPendingApprovals(organizationId: string | number): Promise<ApprovalWithDetails[]> {
	return await prisma.approval.findMany({
		where: {
			status: 1, // Pending
			deletedAt: null,
			transaction: {
				organizationId: typeof organizationId === "string" ? BigInt(organizationId) : organizationId,
				deletedAt: null,
			},
		},
		include: {
			transaction: {
				include: {
					category: true,
				},
			},
			user: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	})
}

export async function findApprovalsByStatus(
	organizationId: string | number,
	status?: number,
): Promise<ApprovalWithDetails[]> {
	const where: Prisma.ApprovalWhereInput = {
		deletedAt: null,
		transaction: {
			organizationId: typeof organizationId === "string" ? BigInt(organizationId) : organizationId,
			deletedAt: null,
		},
	}

	if (status !== undefined) {
		where.status = status
	}

	return await prisma.approval.findMany({
		where,
		include: {
			transaction: {
				include: {
					category: true,
				},
			},
			user: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	})
}

export async function findApprovalById(id: string | number): Promise<ApprovalWithDetails | null> {
	return await prisma.approval.findUnique({
		where: {
			id: typeof id === "string" ? BigInt(id) : id,
		},
		include: {
			transaction: {
				include: {
					category: true,
				},
			},
			user: true,
		},
	})
}

export async function approveTransaction(approvalId: string | number, userId: string): Promise<ApprovalWithDetails> {
	return await prisma.approval.update({
		where: {
			id: typeof approvalId === "string" ? BigInt(approvalId) : approvalId,
		},
		data: {
			status: 2, // Approved
			userId,
			updatedAt: new Date(),
		},
		include: {
			transaction: {
				include: {
					category: true,
				},
			},
			user: true,
		},
	})
}

export async function rejectTransaction(
	approvalId: string | number,
	userId: string,
	reason: string,
): Promise<ApprovalWithDetails> {
	return await prisma.approval.update({
		where: {
			id: typeof approvalId === "string" ? BigInt(approvalId) : approvalId,
		},
		data: {
			status: 3, // Rejected
			userId,
			reason,
			updatedAt: new Date(),
		},
		include: {
			transaction: {
				include: {
					category: true,
				},
			},
			user: true,
		},
	})
}

export async function getCurrentUserApprovals(): Promise<ApprovalWithDetails[]> {
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

	return await findApprovalsByStatus(userOrg.organizationId)
}
