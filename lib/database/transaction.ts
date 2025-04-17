'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export type TransactionWithRelations = {
	id: number
	organization_id: number
	amount: number
	description: string | null
	user_id: number
	attachments: string[]
	category_id: number
	date: Date
	created_at: Date
	updated_at: Date
	deleted_at: Date | null
	categoryName?: string
	creatorName?: string
	type?: 'income' | 'expense'
	title?: string
	status?: string
}

export type TransactionFormData = {
	title: string
	description: string
	amount: number
	category_id: number
	date: Date
	attachments?: string[]
	organization_id: number
	user_id: number
}

export async function getTransactions(status?: string) {
	try {
		const transactions = await prisma.transaction.findMany({
			where: {
				deleted_at: null,
				// We'll add a filter for approvals later
			},
			orderBy: {
				created_at: 'desc'
			},
			include: {
				category: true,
				user: true,
				Approval: true
			}
		})

		// Transform the data to match the expected format in the component
		const transformedTransactions = transactions.map(transaction => {
			// Determine status based on approvals
			let transactionStatus = 'pending';
			if (transaction.Approval && transaction.Approval.length > 0) {
				// If any approval is rejected, the transaction is rejected
				if (transaction.Approval.some(a => a.status === 3)) {
					transactionStatus = 'rejected';
				}
				// If all approvals are approved, the transaction is completed
				else if (transaction.Approval.every(a => a.status === 2)) {
					transactionStatus = 'completed';
				}
			}

			return {
				id: Number(transaction.id),
				organization_id: Number(transaction.organization_id),
				amount: Number(transaction.amount),
				description: transaction.description,
				user_id: Number(transaction.user_id),
				attachments: transaction.attachments || [],
				category_id: Number(transaction.category_id),
				date: transaction.date,
				created_at: transaction.created_at,
				updated_at: transaction.updated_at,
				deleted_at: transaction.deleted_at,
				categoryName: transaction.category?.name || 'Uncategorized',
				creatorName: transaction.user?.name || 'Unknown User',
				// Determine if income or expense based on category type
				type: transaction.category?.type === 1 ? 'income' : 'expense',
				title: transaction.description?.split('\n')[0] || `Transaction #${transaction.id}`,
				status: transactionStatus
			};
		}) as TransactionWithRelations[];

		// Filter by status if provided
		if (status) {
			return transformedTransactions.filter(tx => tx.status === status);
		}

		return transformedTransactions;
	} catch (error) {
		console.error('Error fetching transactions:', error)
		return []
	}
}

export async function createTransaction(data: TransactionFormData) {
	try {
		const transaction = await prisma.transaction.create({
			data: {
				organization_id: data.organization_id,
				amount: BigInt(Math.round(data.amount * 100)), // Convert to cents and then to BigInt
				description: data.description,
				user_id: data.user_id,
				attachments: data.attachments || [],
				category_id: data.category_id,
				date: data.date,
				created_at: new Date(),
				updated_at: new Date(),
			}
		});

		// Create a default approval for the transaction
		await prisma.approval.create({
			data: {
				transaction_id: transaction.id,
				user_id: data.user_id, // Self-approval for demo
				status: 2, // Approved
				created_at: new Date(),
				updated_at: new Date(),
			}
		});

		revalidatePath('/transactions');
		return { success: true, transaction };
	} catch (error) {
		console.error('Error creating transaction:', error);
		return { success: false, error: 'Failed to create transaction' };
	}
}

export async function getCategories() {
	try {
		const categories = await prisma.category.findMany({
			where: {
				deleted_at: null
			}
		})

		return categories.map(category => ({
			id: Number(category.id),
			name: category.name,
			type: category.type
		}))
	} catch (error) {
		console.error('Error fetching categories:', error)
		return []
	}
}

export async function getUsers() {
	try {
		const users = await prisma.user.findMany({
			where: {
				deleted_at: null
			}
		})

		return users.map(user => ({
			id: Number(user.id),
			name: user.name
		}))
	} catch (error) {
		console.error('Error fetching users:', error)
		return []
	}
}

export async function getOrganizations() {
	try {
		const organizations = await prisma.organization.findMany({
			where: {
				deleted_at: null
			}
		})

		return organizations.map(org => ({
			id: Number(org.id),
			name: org.name
		}))
	} catch (error) {
		console.error('Error fetching organizations:', error)
		return []
	}
}