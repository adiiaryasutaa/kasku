import { createClient } from "@/lib/supabase/component";
import { AuthTokenResponsePassword } from "@supabase/auth-js";
import { SupabaseClient } from "@supabase/supabase-js";

export type LoginInput = {
	email: string;
	password: string;
	remember: boolean | null;
};

export async function authenticate(credentials: LoginInput): Promise<AuthTokenResponsePassword> {
	const supabase: SupabaseClient = createClient();

	return await supabase.auth.signInWithPassword(credentials);
}