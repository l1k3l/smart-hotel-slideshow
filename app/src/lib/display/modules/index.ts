import type { Component } from 'svelte';
import type { ModuleName } from '../types';
import WeatherModule from './WeatherModule.svelte';
import LiftsModule from './LiftsModule.svelte';
import SlopesModule from './SlopesModule.svelte';
import WebcamsModule from './WebcamsModule.svelte';

export const moduleComponents: Record<ModuleName, Component<any>> = {
	weather: WeatherModule,
	lifts: LiftsModule,
	slopes: SlopesModule,
	webcams: WebcamsModule
};

export function getModuleProps(name: ModuleName, data: import('$lib/types').ResortData): Record<string, unknown> {
	switch (name) {
		case 'weather':
			return { weather: data.weather };
		case 'lifts':
			return { lifts: data.lifts };
		case 'slopes':
			return { slopes: data.slopes };
		case 'webcams':
			return { webcams: data.webcams };
	}
}

export { WeatherModule, LiftsModule, SlopesModule, WebcamsModule };
