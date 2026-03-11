import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db/index';
import { hotelUsers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, url }) => {
	// Allow the login page without auth
	if (url.pathname === '/admin/login') {
		return {};
	}

	const { user } = await safeGetSession();
	if (!user) {
		redirect(303, '/admin/login');
	}

	// Find the user's hotel
	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});

	if (!hotelUser) {
		redirect(303, '/admin/login');
	}

	return {
		hotelId: hotelUser.hotelId,
		role: hotelUser.role
	};
};
