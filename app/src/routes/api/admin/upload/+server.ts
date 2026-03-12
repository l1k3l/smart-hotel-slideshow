import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { hotelUsers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getSupabaseAdmin } from '$lib/server/supabase-admin';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const BUCKET = 'hotel-images';

export const POST: RequestHandler = async ({ request, locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	if (!file) return error(400, 'No file uploaded');

	if (!ALLOWED_TYPES.includes(file.type)) {
		return error(400, `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF`);
	}

	if (file.size > MAX_SIZE) {
		return error(400, 'File too large. Maximum size is 5 MB');
	}

	const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
	const timestamp = Date.now();
	const random = Math.random().toString(36).slice(2, 8);
	const path = `${hotelUser.hotelId}/${timestamp}-${random}.${ext}`;

	const supabase = getSupabaseAdmin();
	const arrayBuffer = await file.arrayBuffer();
	const { error: uploadError } = await supabase.storage
		.from(BUCKET)
		.upload(path, arrayBuffer, {
			contentType: file.type,
			upsert: false
		});

	if (uploadError) {
		console.error('[upload] Supabase Storage error:', uploadError);
		return error(500, `Upload failed: ${uploadError.message}`);
	}

	const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

	return json({ url: urlData.publicUrl, path });
};
