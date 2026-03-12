import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { hotelSettings, hotelUsers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const settings = await db.query.hotelSettings.findFirst({
		where: eq(hotelSettings.hotelId, hotelUser.hotelId)
	});

	if (!settings) return error(404, 'Settings not found');
	return json(settings);
};

export const PUT: RequestHandler = async ({ request, locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const body = await request.json();
	const updates: Record<string, unknown> = {};

	if (typeof body.theme === 'string') updates.theme = body.theme;
	if (typeof body.slideshowSpeedSeconds === 'number') updates.slideshowSpeedSeconds = body.slideshowSpeedSeconds;
	if (typeof body.language === 'string') updates.language = body.language;
	if (Array.isArray(body.resortAliases)) updates.resortAliases = body.resortAliases;
	if (Array.isArray(body.enabledModules)) updates.enabledModules = body.enabledModules;
	if (Array.isArray(body.weatherDestinations)) updates.weatherDestinations = body.weatherDestinations;
	if (Array.isArray(body.qrCodes)) updates.qrCodes = body.qrCodes;

	if (Object.keys(updates).length === 0) {
		return error(400, 'No valid fields to update');
	}

	updates.updatedAt = new Date();

	const [updated] = await db
		.update(hotelSettings)
		.set(updates)
		.where(eq(hotelSettings.hotelId, hotelUser.hotelId))
		.returning();

	if (!updated) return error(404, 'Settings not found');
	return json(updated);
};
