import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index';
import { devices } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { hotelId } = await parent();
	if (!hotelId) return { devices: [], origin: url.origin };

	const hotelDevices = await db.query.devices.findMany({
		where: eq(devices.hotelId, hotelId),
		orderBy: (devices, { desc }) => [desc(devices.createdAt)]
	});

	return { devices: hotelDevices, origin: url.origin };
};
