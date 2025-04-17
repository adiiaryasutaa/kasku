'use server'

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { comparePassword } from '@/lib/password';
import { setAuthCookie, signJwtToken } from '@/lib/jwt';
import { SignInSchema } from "@/lib/zod";

const prisma = new PrismaClient();

export async function login(schema: SignInSchema) {
	try {
		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email: schema.email },
		});

		if (!user) {
			return { success: false, message: "Invalid email or password" };
		}

		const isPasswordValid = await comparePassword(schema.password, user.password);
		if (!isPasswordValid) {
			return { success: false, message: "Invalid email or password" };
		}

		// Generate JWT token
		const token = signJwtToken({
			id: Number(user.id),
			email: user.email,
			name: user.name,
		});

		// Set auth cookie
		await setAuthCookie(token);

		return { success: true, user: { id: user.id, name: user.name, email: user.email } };
	} catch (error) {
		console.error("Login error:", error);
		if (error instanceof z.ZodError) {
			return { success: false, message: error.errors[0].message };
		}
		return { success: false, message: "An unexpected error occurred - " + error };
	}
}