import type { ResortData } from '$lib/types';
import type { ProviderConfig } from './types';
import { fetchHolidayinfoResortData } from './holidayinfo';
import { getProvider } from './registry';

export async function fetchResortData(
	providerName: string,
	config: ProviderConfig
): Promise<ResortData> {
	// For holidayinfo, use the optimized single-call fetch
	if (providerName === 'holidayinfo') {
		const data = await fetchHolidayinfoResortData(config.aliases, config.language);
		return { ...data, fetchedAt: new Date().toISOString() };
	}

	// Generic path: call each method on the provider
	const provider = getProvider(providerName);
	const [weather, lifts, slopes, webcams] = await Promise.all([
		provider.fetchWeather(config),
		provider.fetchLifts(config),
		provider.fetchSlopes(config),
		provider.fetchWebcams(config)
	]);

	return { weather, lifts, slopes, webcams, fetchedAt: new Date().toISOString() };
}
