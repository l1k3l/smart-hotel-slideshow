import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { devices, hotelUsers } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params, locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const [updated] = await db
		.update(devices)
		.set({ deviceUuid: null, boundAt: null })
		.where(and(eq(devices.id, params.id), eq(devices.hotelId, hotelUser.hotelId)))
		.returning();

	if (!updated) return error(404, 'Device not found');
	return json({ status: 'unlinked' });
};
