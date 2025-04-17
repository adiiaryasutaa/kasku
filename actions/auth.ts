"use server"

import { createClient } from "@/lib/supabase/server";
import { SupabaseClient, User, UserResponse } from "@supabase/supabase-js";

export async function getCurrentUser(): Promise<User | null> {
	const supabase: SupabaseClient = await createClient();
	const response: UserResponse = await supabase.auth.getUser();

	return response.data.user;
}