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
	if (!apiKey) return [];

	const results = await Promise.allSettled(
		destinations.map(async (dest) => {
			const url = `https://api.openweathermap.org/data/2.5/weather?lat=${dest.lat}&lon=${dest.lon}&units=metric&appid=${apiKey}`;
			const resp = await fetch(url);
			if (!resp.ok) return null;
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
