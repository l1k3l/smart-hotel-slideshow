import { env } from '$env/dynamic/private';
import type { WeatherDestination } from '$lib/display/types';

interface OpenWeatherResponse {
	name: string;
	main: { temp: number; feels_like: number; humidity: number };
	weather: Array<{ description: string; icon: string }>;
	wind: { speed: number };
}

export async function fetchWeatherDestinations(
	destinations: Array<{ name: string; lat: number; lon: number }>
): Promise<WeatherDestination[]> {
	const apiKey = env.OPENWEATHER_API_KEY;
	if (!apiKey) {
		console.warn('[weather] OPENWEATHER_API_KEY not set, skipping weather fetch');
		return [];
	}

	const results = await Promise.allSettled(
		destinations.map(async (dest) => {
			const url = `https://api.openweathermap.org/data/2.5/weather?lat=${dest.lat}&lon=${dest.lon}&units=metric&appid=${apiKey}`;
			const resp = await fetch(url);
			if (!resp.ok) {
				const text = await resp.text().catch(() => '');
				console.warn(`[weather] OpenWeather API error for ${dest.name}: ${resp.status} ${text}`);
				return null;
			}
			const data: OpenWeatherResponse = await resp.json();
			return {
				name: dest.name,
				temp: data.main.temp,
				feelsLike: data.main.feels_like,
				description: data.weather[0]?.description ?? '',
				icon: data.weather[0]?.icon ?? '',
				humidity: data.main.humidity,
				windSpeed: data.wind.speed
			};
		})
	);

	return results
		.filter((r): r is PromiseFulfilledResult<WeatherDestination | null> => r.status === 'fulfilled')
		.map((r) => r.value)
		.filter((v): v is WeatherDestination => v !== null);
}

/** Search for cities by name using OpenWeather Geocoding API */
export async function searchCities(
	query: string
): Promise<Array<{ name: string; country: string; state?: string; lat: number; lon: number }>> {
	const apiKey = env.OPENWEATHER_API_KEY;
	if (!apiKey) return [];

	const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
	const resp = await fetch(url);
	if (!resp.ok) return [];

	const data: Array<{ name: string; country: string; state?: string; lat: number; lon: number }> = await resp.json();
	return data.map((d) => ({
		name: d.name,
		country: d.country,
		state: d.state,
		lat: Math.round(d.lat * 10000) / 10000,
		lon: Math.round(d.lon * 10000) / 10000
	}));
}
