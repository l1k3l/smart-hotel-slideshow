import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { devices, hotels, hotelUsers } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';
import { generateToken } from '$lib/server/token';

export const POST: RequestHandler = async ({ locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	// Check device limit
	const hotel = await db.query.hotels.findFirst({
		where: eq(hotels.id, hotelUser.hotelId)
	});
	if (!hotel) return error(404, 'Hotel not found');

	const [{ deviceCount }] = await db
		.select({ deviceCount: count() })
		.from(devices)
		.where(eq(devices.hotelId, hotelUser.hotelId));

	if (deviceCount >= hotel.maxDevices) {
		return error(403, `Device limit reached (${hotel.maxDevices}). Contact support to increase.`);
	}

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
