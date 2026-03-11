import { XMLParser } from 'fast-xml-parser';
import type { WeatherData, Lift, Slope, Webcam, ResortData } from './types';

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	textNodeName: '#text'
});

function asArray<T>(val: T | T[] | undefined): T[] {
	if (val === undefined || val === null) return [];
	return Array.isArray(val) ? val : [val];
}

function num(val: unknown): number | null {
	if (val === undefined || val === null || val === '') return null;
	const n = parseFloat(String(val));
	return isNaN(n) ? null : n;
}

function str(val: unknown): string {
	if (val === undefined || val === null) return '';
	return String(val).trim();
}

export function parseResortXml(xmlText: string): ResortData {
	const parsed = parser.parse(xmlText);
	const exp = parsed.export;
	if (!exp) return { weather: [], lifts: [], slopes: [], webcams: [], fetchedAt: new Date().toISOString() };

	const weather: WeatherData[] = [];
	const lifts: Lift[] = [];
	const slopes: Slope[] = [];
	const webcams: Webcam[] = [];

	// Navigate: export > country > region > location
	const countries = asArray(exp.country);
	for (const country of countries) {
		const regions = asArray(country.region);
		for (const region of regions) {
			const locations = asArray(region.location);
			for (const loc of locations) {
				const locName = str(loc['@_name']);
				const locAlias = str(loc['@_alias']);

				// Weather
				const w = loc.loc_info_winter;
				if (w) {
					weather.push({
						location: locName,
						alias: locAlias,
						operationStatus: str(w.operation_text),
						operatingHours: str(w.opertime),
						temp0700: num(w.temp_0700),
						weatherCode: num(w.weather_0700_code),
						weatherText: str(w.weather_0700_text),
						snowHeightSlopes: num(w.snowheight_slopes),
						snowHeightMin: num(w.snowheight_slopes_min),
						snowHeightMax: num(w.snowheight_slopes_max),
						snowHeightOutside: num(w.snowheight_outside_slopes),
						snowNew: num(w.snowheight_new),
						snowType: str(w.snowtype_text),
						lastChange: str(w['@_lastchange'])
					});
				}

				// Lifts
				if (loc.loc_lifts) {
					for (const lift of asArray(loc.loc_lifts.lift)) {
						lifts.push({
							id: str(lift['@_id']),
							name: str(lift.name),
							type: str(lift.type_text),
							status: str(lift.status_text),
							statusCode: num(lift.status_code) ?? 0,
							capacity: num(lift.capacity)
						});
					}
				}

				// Slopes
				if (loc.loc_slopes) {
					for (const slope of asArray(loc.loc_slopes.slope)) {
						slopes.push({
							id: str(slope['@_id']),
							name: str(slope.name),
							difficulty: str(slope.diff_text),
							difficultyCode: num(slope.diff_code) ?? 0,
							status: str(slope.status_text),
							statusCode: num(slope.status_code) ?? 0,
							length: num(slope.length),
							elevation: num(slope.exceed),
							snowmaking: str(slope.snowmaking_text) !== 'no',
							nightSkiing: str(slope.nightskiing_text) !== 'no'
						});
					}
				}

				// Webcams (deduplicate by cam id since resorts share cameras)
				if (loc.loc_cams) {
					const seenCamIds = new Set(webcams.map((w) => w.id));
					for (const cam of asArray(loc.loc_cams.cam)) {
						if (seenCamIds.has(str(cam['@_id']))) continue;
						const media = cam.media;
						const lastImg = media?.last_image;
						const lastVid = media?.last_video;

						const videoFiles: Webcam['videoFiles'] = [];
						if (lastVid) {
							for (const vf of asArray(lastVid.videofile)) {
								videoFiles.push({
									size: str(vf['@_id']),
									url: str(vf['#text']),
									width: num(vf['@_width']) ?? 0,
									height: num(vf['@_height']) ?? 0
								});
							}
						}

						webcams.push({
							id: str(cam['@_id']),
							name: str(cam.name),
							altitude: num(cam.sealevel),
							temperature: lastImg ? num(lastImg.temp) : null,
							imageUrl: lastImg ? str(lastImg.link) : '',
							imageWidth: num(lastImg?.width) ?? 0,
							imageHeight: num(lastImg?.height) ?? 0,
							videoUrl: lastVid ? str(lastVid.link) : null,
							videoFiles,
							panoramicUrl: lastImg?.panozoom_link ? str(lastImg.panozoom_link) : null,
							lastUpdate: lastImg ? str(lastImg['@_datetime']) : ''
						});
					}
				}
			}
		}
	}

	return {
		weather,
		lifts,
		slopes,
		webcams,
		fetchedAt: new Date().toISOString()
	};
}
