import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { devices, hotelUsers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '$lib/server/token';

export const POST: RequestHandler = async ({ locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	// Generate unique token with retry
	let token: string;
	let attempts = 0;
	while (true) {
		token = generateToken();
		const existing = await db.query.devices.findFirst({
			where: eq(devices.token, token)
		});
		if (!existing) break;
		attempts++;
		if (attempts > 10) return error(500, 'Failed to generate unique token');
	}

	const [device] = await db
		.insert(devices)
		.values({
			token,
			hotelId: hotelUser.hotelId,
			deviceName: 'New Device'
		})
		.returning();

	return json({ token: device.token, id: device.id });
};
