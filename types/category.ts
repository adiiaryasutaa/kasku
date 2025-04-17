import { Prisma } from "@prisma/client";

export enum TransactionCategoryType {
	INCOME = 1,
	EXPENSE,
	BOTH,
}

export type CategoryData = Prisma.CategoryGetPayload<{}>;