import type { Component } from 'svelte';
import type { ModuleName, DisplayConfig } from '../types';
import WeatherModule from './WeatherModule.svelte';
import LiftsModule from './LiftsModule.svelte';
import SlopesModule from './SlopesModule.svelte';
import WebcamsModule from './WebcamsModule.svelte';
import ServicesModule from './ServicesModule.svelte';
import AnnouncementsModule from './AnnouncementsModule.svelte';
import GeneralWeatherModule from './GeneralWeatherModule.svelte';
import QRCodeModule from './QRCodeModule.svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moduleComponents: Record<ModuleName, Component<any>> = {
	weather: WeatherModule,
	lifts: LiftsModule,
	slopes: SlopesModule,
	webcams: WebcamsModule,
	services: ServicesModule,
	announcements: AnnouncementsModule,
	generalWeather: GeneralWeatherModule,
	qrCodes: QRCodeModule
};

export function getModuleProps(name: ModuleName, config: DisplayConfig): Record<string, unknown> {
	switch (name) {
		case 'weather':
			return { weather: config.resortData.weather };
		case 'lifts':
			return { lifts: config.resortData.lifts };
		case 'slopes':
			return { slopes: config.resortData.slopes };
		case 'webcams':
			return { webcams: config.resortData.webcams };
		case 'services':
			return { services: config.services };
		case 'announcements':
			return { announcements: config.announcements };
		case 'generalWeather':
			return { destinations: config.weatherDestinations };
		case 'qrCodes':
			return { qrCodes: config.qrCodes };
	}
}

export { WeatherModule, LiftsModule, SlopesModule, WebcamsModule, ServicesModule, AnnouncementsModule, GeneralWeatherModule, QRCodeModule };
