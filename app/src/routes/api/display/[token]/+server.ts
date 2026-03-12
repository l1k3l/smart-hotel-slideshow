import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { devices, hotelSettings, hotels, hotelServices, announcements } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getResortData } from '$lib/server/resort-cache';
import { fetchWeatherDestinations } from '$lib/server/weather';
import type { DisplayConfig } from '$lib/display/types';

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

	// Fetch hotel services
	const services = await db.query.hotelServices.findMany({
		where: and(eq(hotelServices.hotelId, device.hotelId), eq(hotelServices.isActive, true)),
		orderBy: (hotelServices, { asc }) => [asc(hotelServices.sortOrder)]
	});

	// Fetch active announcements (within date range)
	const now = new Date();
	const allAnnouncements = await db.query.announcements.findMany({
		where: and(eq(announcements.hotelId, device.hotelId), eq(announcements.isActive, true))
	});
	const activeAnnouncements = allAnnouncements.filter((a) => {
		if (a.showFrom && a.showFrom > now) return false;
		if (a.showUntil && a.showUntil < now) return false;
		return true;
	});

	// Fetch general weather destinations
	const destinations = (settings.weatherDestinations as Array<{ name: string; lat: number; lon: number }>) ?? [];
	const weatherDestinations = destinations.length > 0 ? await fetchWeatherDestinations(destinations) : [];

	const qrCodes = (settings.qrCodes as Array<{ label: string; url: string }>) ?? [];

	const config: DisplayConfig = {
		hotelName: hotel?.name ?? 'Hotel',
		theme: settings.theme,
		slideshowSpeedSeconds: settings.slideshowSpeedSeconds,
		enabledModules: settings.enabledModules as DisplayConfig['enabledModules'],
		customBranding: settings.customBranding as Record<string, unknown>,
		resortData,
		services: services.map((s) => ({
			name: s.name,
			category: s.category,
			description: s.description,
			hours: s.hours,
			imageUrl: s.imageUrl
		})),
		announcements: activeAnnouncements.map((a) => ({
			title: a.title,
			body: a.body,
			imageUrl: a.imageUrl,
			priority: a.priority
		})),
		weatherDestinations,
		qrCodes,
		configVersion: Math.floor(settings.updatedAt.getTime() / 1000)
	};

	return json(config);
};
