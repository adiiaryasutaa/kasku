import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// JWT secret should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface JwtPayload {
	id: number;
	email: string;
	name: string;
}

export function signJwtToken(payload: JwtPayload): string {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN,
	});
}

export function verifyJwtToken(token: string): JwtPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as JwtPayload;
	} catch (error) {
		return null;
	}
}

export async function setAuthCookie(token: string): Promise<void> {
	(await cookies()).set({
		name: 'auth-token',
		value: token,
		httpOnly: true,
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 7, // 7 days
		sameSite: 'strict',
	});
}

export async function getAuthCookie(): Promise<string | undefined> {
	return (await cookies()).get('auth-token')?.value;
}

export async function removeAuthCookie(): Promise<void> {
	(await cookies()).delete('auth-token');
}

export async function getCurrentUser(): Promise<JwtPayload | null> {
	const token = await getAuthCookie();
	if (!token) return null;

	return verifyJwtToken(token);
}