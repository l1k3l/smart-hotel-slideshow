import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { devices, hotelSettings, hotels } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getResortData } from '$lib/server/resort-cache';
import type { ModuleName } from '$lib/display/types';

export const GET: RequestHandler = async ({ params }) => {
	const { token } = params;

	const device = await db.query.devices.findFirst({
		where: eq(devices.token, token)
	});

	if (!device || !device.isActive) {
		return error(404, 'Device not found or inactive');
	}

	const settings = await db.query.hotelSettings.findFirst({
		where: eq(hotelSettings.hotelId, device.hotelId)
	});

	if (!settings) {
		return error(404, 'Hotel settings not found');
	}

	const hotel = await db.query.hotels.findFirst({
		where: eq(hotels.id, device.hotelId)
	});

	const aliases =
		settings.resortAliases && settings.resortAliases.length > 0
			? settings.resortAliases
			: ['medvedin', 'svpetr'];

	const resortData = await getResortData(
		settings.dataProvider,
		aliases,
		settings.language
	);

	return json({
		hotelName: hotel?.name ?? 'Hotel',
		theme: settings.theme,
		slideshowSpeedSeconds: settings.slideshowSpeedSeconds,
		enabledModules: settings.enabledModules as ModuleName[],
		customBranding: settings.customBranding,
		resortData,
		configVersion: Math.floor(settings.updatedAt.getTime() / 1000)
	});
};
