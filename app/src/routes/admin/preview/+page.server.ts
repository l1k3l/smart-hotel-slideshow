import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index';
import { hotels, hotelSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getResortData } from '$lib/server/resort-cache';

export const load: PageServerLoad = async ({ parent }) => {
	const { hotelId } = await parent();
	if (!hotelId) return { config: null };

	const hotel = await db.query.hotels.findFirst({
		where: eq(hotels.id, hotelId)
	});

	const settings = await db.query.hotelSettings.findFirst({
		where: eq(hotelSettings.hotelId, hotelId)
	});

	if (!hotel || !settings) return { config: null };

	const aliases =
		settings.resortAliases && settings.resortAliases.length > 0
			? settings.resortAliases
			: ['medvedin', 'svpetr'];

	const resortData = await getResortData(settings.dataProvider, aliases, settings.language);

	return {
		config: {
			hotelName: hotel.name,
			theme: settings.theme,
			slideshowSpeedSeconds: settings.slideshowSpeedSeconds,
			enabledModules: settings.enabledModules,
			customBranding: settings.customBranding as Record<string, unknown>,
			resortData
		}
	};
};
