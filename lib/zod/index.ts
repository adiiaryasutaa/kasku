import { z } from "zod"
import { TransactionCategoryType } from "@/types/category";
import { TransactionType } from "@/types/transaction";

export const loginSchema = z.object({
	email: z.string({ required_error: "Email is required" })
		.email("Invalid email"),
	password: z.string({ required_error: "Password is required" })
		.min(1, "Password is required"),
	remember: z.boolean().default(false),
});

export type SignInSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"],
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const transactionSchema = z.object({
	name: z.string().min(2, "Title must be at least 2 characters"),
	description: z.string().optional(),
	amount: z.coerce.number().positive("Amount must be positive"),
	category: z.coerce.number().positive("Please select a category"),
	type: z.enum([TransactionType.INCOME.toString(), TransactionType.EXPENSE.toString()]),
	date: z.date(),
});

export type TransactionSchema = z.infer<typeof transactionSchema>;