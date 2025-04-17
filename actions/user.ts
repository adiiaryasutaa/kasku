import { Prisma, User } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function findUniqueUser(input: Prisma.UserWhereUniqueInput): Promise<User | null> {
	return await prisma.user.findUnique({
		where: input
	});
}

export async function findManyUsers(where?: Prisma.UserWhereInput): Promise<User[]> {
	return await prisma.user.findMany({
		where: {
			...where,
			deletedAt: null,
		},
	})
}

export async function createUser(data: Prisma.UserCreateInput): Promise<User> {
	return await prisma.user.create({
		data,
	})
}

export async function updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
	return await prisma.user.update({
		where: { id },
		data,
	})
}

export async function deleteUser(id: string): Promise<User> {
	// Soft delete
	return await prisma.user.update({
		where: { id },
		data: {
			deletedAt: new Date(),
			updatedAt: new Date(),
		},
	})
}
