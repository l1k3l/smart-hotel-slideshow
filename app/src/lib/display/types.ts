import type { ResortData } from '$lib/types';

export type ModuleName = 'weather' | 'lifts' | 'slopes' | 'webcams' | 'services' | 'announcements' | 'generalWeather' | 'qrCodes';

export interface ServiceItem {
	name: string;
	category: string;
	description: string;
	hours: string;
	imageUrl: string | null;
}

export interface AnnouncementItem {
	title: string;
	body: string;
	imageUrl: string | null;
	priority: number;
}

export interface WeatherDestination {
	name: string;
	temp: number;
	feelsLike: number;
	description: string;
	icon: string;
	humidity: number;
	windSpeed: number;
}

export interface QRItem {
	label: string;
	url: string;
}

export interface DisplayConfig {
	hotelName: string;
	theme: string;
	slideshowSpeedSeconds: number;
	enabledModules: ModuleName[];
	customBranding: Record<string, unknown>;
	resortData: ResortData;
	services: ServiceItem[];
	announcements: AnnouncementItem[];
	weatherDestinations: WeatherDestination[];
	qrCodes: QRItem[];
	configVersion: number;
}
