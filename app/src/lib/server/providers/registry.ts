import type { DataProvider } from './types';
import { holidayinfoProvider } from './holidayinfo';

const providers: Record<string, DataProvider> = {
	holidayinfo: holidayinfoProvider
};

export function getProvider(name: string): DataProvider {
	const provider = providers[name];
	if (!provider) {
		throw new Error(`Unknown data provider: ${name}`);
	}
	return provider;
}
