import type { ResortData } from '$lib/types';
import { fetchResortData } from './providers/index';

interface CacheEntry {
	data: ResortData;
	timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

function cacheKey(provider: string, aliases: string[]): string {
	return `${provider}:${[...aliases].sort().join(',')}`;
}

export async function getResortData(
	provider: string,
	aliases: string[],
	language = 'en'
): Promise<ResortData> {
	const key = cacheKey(provider, aliases);
	const entry = cache.get(key);

	if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
		return entry.data;
	}

	const data = await fetchResortData(provider, {
		aliases,
		language,
		credentials: {}
	});

	cache.set(key, { data, timestamp: Date.now() });
	return data;
}
