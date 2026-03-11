import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index';
import { devices, hotels, hotelSettings } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { hotelId } = await parent();
	if (!hotelId) return { hotel: null, stats: null };

	const hotel = await db.query.hotels.findFirst({
		where: eq(hotels.id, hotelId)
	});

	const settings = await db.query.hotelSettings.findFirst({
		where: eq(hotelSettings.hotelId, hotelId)
	});

	const allDevices = await db.query.devices.findMany({
		where: eq(devices.hotelId, hotelId)
	});

	const now = Date.now();
	const onlineThreshold = 2 * 60 * 1000; // 2 minutes

	const totalDevices = allDevices.length;
	const activeDevices = allDevices.filter((d) => d.isActive).length;
	const onlineDevices = allDevices.filter(
		(d) => d.isActive && d.lastSeenAt && now - new Date(d.lastSeenAt).getTime() < onlineThreshold
	).length;
	const boundDevices = allDevices.filter((d) => d.deviceUuid).length;

	return {
		hotel: hotel ? { name: hotel.name, slug: hotel.slug } : null,
		settings: settings ? { theme: settings.theme, enabledModules: settings.enabledModules } : null,
		stats: {
			totalDevices,
			activeDevices,
			onlineDevices,
			boundDevices
		}
	};
};
