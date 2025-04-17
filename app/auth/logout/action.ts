'use server'

import { removeAuthCookie } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
	removeAuthCookie();
	redirect('/auth/login');
}

export async function checkAuth() {
	const token = (await cookies()).get('auth-token')?.value;
	if (!token) {
		return { isAuthenticated: false };
	}

	// Verify token logic here
	// This is a simple check - in a real app, you'd verify the token
	return { isAuthenticated: true };
}