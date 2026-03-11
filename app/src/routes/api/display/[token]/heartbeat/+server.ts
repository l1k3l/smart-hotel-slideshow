import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { devices, hotelSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params }) => {
	const { token } = params;

	const device = await db.query.devices.findFirst({
		where: eq(devices.token, token)
	});

	if (!device || !device.isActive) {
		return error(404, 'Device not found or inactive');
	}

	// Update last seen
	await db
		.update(devices)
		.set({ lastSeenAt: new Date() })
		.where(eq(devices.id, device.id));

	// Get config version
	const settings = await db.query.hotelSettings.findFirst({
		where: eq(hotelSettings.hotelId, device.hotelId)
	});

	const configVersion = settings
		? Math.floor(settings.updatedAt.getTime() / 1000)
		: 0;

	return json({ status: 'ok', configVersion });
};
