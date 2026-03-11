import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { devices } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params, request }) => {
	const { token } = params;
	const body = await request.json();
	const deviceId = body.deviceId;

	if (!deviceId || typeof deviceId !== 'string') {
		return error(400, 'deviceId is required');
	}

	const device = await db.query.devices.findFirst({
		where: eq(devices.token, token)
	});

	if (!device || !device.isActive) {
		return error(404, 'Device not found or inactive');
	}

	// Already bound to this device
	if (device.deviceUuid === deviceId) {
		return json({ status: 'already_bound' });
	}

	// Bound to a different device
	if (device.deviceUuid && device.deviceUuid !== deviceId) {
		return error(409, 'Token is already bound to a different device');
	}

	// Bind the device
	await db
		.update(devices)
		.set({
			deviceUuid: deviceId,
			boundAt: new Date()
		})
		.where(eq(devices.id, device.id));

	return json({ status: 'bound' });
};
