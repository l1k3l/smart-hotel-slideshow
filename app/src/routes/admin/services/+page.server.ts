import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index';
import { hotelServices } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { hotelId } = await parent();
	if (!hotelId) return { services: [] };

	const services = await db.query.hotelServices.findMany({
		where: eq(hotelServices.hotelId, hotelId),
		orderBy: (hotelServices, { asc }) => [asc(hotelServices.sortOrder)]
	});

	return { services };
};
