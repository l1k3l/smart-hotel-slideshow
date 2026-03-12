import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index';
import { announcements } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { hotelId } = await parent();
	if (!hotelId) return { announcements: [] };

	const items = await db.query.announcements.findMany({
		where: eq(announcements.hotelId, hotelId),
		orderBy: (announcements, { desc }) => [desc(announcements.priority), desc(announcements.createdAt)]
	});

	return { announcements: items };
};
