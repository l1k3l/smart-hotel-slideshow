import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getResortData } from '$lib/server/resort-cache';

const DEFAULT_ALIASES = ['medvedin', 'svpetr'];

export const GET: RequestHandler = async ({ url }) => {
	try {
		const aliasParam = url.searchParams.get('aliases');
		const aliases = aliasParam ? aliasParam.split(',').map((a) => a.trim()).filter(Boolean) : DEFAULT_ALIASES;
		const provider = url.searchParams.get('provider') ?? 'holidayinfo';
		const language = url.searchParams.get('lang') ?? 'en';

		const data = await getResortData(provider, aliases, language);
		return json(data);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		return error(500, message);
	}
};
