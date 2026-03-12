import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

let adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
	if (adminClient) return adminClient;

	const secretKey = env.SUPABASE_SECRET_KEY;
	if (!secretKey) {
		throw new Error('SUPABASE_SECRET_KEY is not set — required for storage uploads');
	}

	adminClient = createClient(PUBLIC_SUPABASE_URL, secretKey);
	return adminClient;
}
