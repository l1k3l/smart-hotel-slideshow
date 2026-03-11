import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index';
import { hotelSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { hotelId } = await parent();
	if (!hotelId) return { settings: null };

	const settings = await db.query.hotelSettings.findFirst({
		where: eq(hotelSettings.hotelId, hotelId)
	});

	return { settings };
};
