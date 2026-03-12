import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { hotelUsers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { searchCities } from '$lib/server/weather';

export const GET: RequestHandler = async ({ url, locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const query = url.searchParams.get('q');
	if (!query || query.length < 2) return json([]);

	const results = await searchCities(query);
	return json(results);
};
