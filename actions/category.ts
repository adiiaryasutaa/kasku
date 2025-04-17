"use server"

import { Category, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function createCategory(input: Prisma.CategoryCreateInput): Promise<Category | null> {
	return await prisma.category.create({
		data: input,
	});
}

export async function findManyCategories(where: Prisma.CategoryWhereInput): Promise<Category[]> {
	return await prisma.category.findMany({
		where: where,
	});
}

export async function updateCategory({ input, where }: {
	input: Prisma.CategoryUpdateInput,
	where: Prisma.CategoryWhereUniqueInput
}): Promise<Category | null> {
	return await prisma.category.update({
		data: input,
		where: where,
	});
}

export async function deleteCategory(where: Prisma.CategoryWhereUniqueInput): Promise<Category | null> {
	return await prisma.category.delete({
		where: where,
	});
}