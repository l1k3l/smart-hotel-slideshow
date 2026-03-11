import type { ResortData } from '$lib/types';

export type ModuleName = 'weather' | 'lifts' | 'slopes' | 'webcams';

export interface DisplayConfig {
	hotelName: string;
	theme: string;
	slideshowSpeedSeconds: number;
	enabledModules: ModuleName[];
	customBranding: Record<string, unknown>;
	resortData: ResortData;
	configVersion: number;
}
