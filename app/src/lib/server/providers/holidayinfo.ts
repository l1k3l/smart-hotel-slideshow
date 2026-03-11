import type { DataProvider, ProviderConfig } from './types';
import type { WeatherData, Lift, Slope, Webcam } from '$lib/types';
import { parseResortXml } from '$lib/parse-xml';
import { ACCOUNT, DC } from '$env/static/private';

const BASE_URL = 'http://exports.holidayinfo.cz/xml_export.php';
const SPECS = ['loc_info_winter', 'loc_lifts', 'loc_slopes', 'loc_cams'];

async function fetchXml(aliases: string[], language: string): Promise<string> {
	const auth = DC ? `dc=${encodeURIComponent(DC)}` : `account=${encodeURIComponent(ACCOUNT)}`;
	const specParam = aliases.flatMap((alias) => SPECS.map((s) => `${s}@${alias}`)).join(',');
	const url = `${BASE_URL}?${auth}&lang=${encodeURIComponent(language)}&spec=${encodeURIComponent(specParam)}`;

	const resp = await fetch(url);
	if (!resp.ok) {
		throw new Error(`Holidayinfo API returned ${resp.status}`);
	}
	return resp.text();
}

async function fetchAll(config: ProviderConfig) {
	const xml = await fetchXml(config.aliases, config.language);
	return parseResortXml(xml);
}

export const holidayinfoProvider: DataProvider = {
	async fetchWeather(config) {
		return (await fetchAll(config)).weather;
	},
	async fetchLifts(config) {
		return (await fetchAll(config)).lifts;
	},
	async fetchSlopes(config) {
		return (await fetchAll(config)).slopes;
	},
	async fetchWebcams(config) {
		return (await fetchAll(config)).webcams;
	}
};

// Convenience: fetch everything in one call (avoids 4 separate XML fetches)
export async function fetchHolidayinfoResortData(
	aliases: string[],
	language = 'en'
): Promise<{ weather: WeatherData[]; lifts: Lift[]; slopes: Slope[]; webcams: Webcam[] }> {
	const xml = await fetchXml(aliases, language);
	const data = parseResortXml(xml);
	return { weather: data.weather, lifts: data.lifts, slopes: data.slopes, webcams: data.webcams };
}
