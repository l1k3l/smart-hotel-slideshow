import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { devices, hotelUsers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const hotelDevices = await db.query.devices.findMany({
		where: eq(devices.hotelId, hotelUser.hotelId),
		orderBy: (devices, { desc }) => [desc(devices.createdAt)]
	});

	return json(hotelDevices);
};
