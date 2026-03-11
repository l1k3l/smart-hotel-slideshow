import type { WeatherData, Lift, Slope, Webcam } from '$lib/types';

export interface ProviderConfig {
	aliases: string[];
	language: string;
	credentials: Record<string, string>;
}

export interface DataProvider {
	fetchWeather(config: ProviderConfig): Promise<WeatherData[]>;
	fetchLifts(config: ProviderConfig): Promise<Lift[]>;
	fetchSlopes(config: ProviderConfig): Promise<Slope[]>;
	fetchWebcams(config: ProviderConfig): Promise<Webcam[]>;
}
