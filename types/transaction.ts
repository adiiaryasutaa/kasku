import { Prisma } from "@prisma/client";

export enum TransactionType {
	INCOME = 0,
	EXPENSE = 1,
}

export type TransactionData = Prisma.TransactionGetPayload<{
	include: {
		user: true,
		category: true,
	},
}>;