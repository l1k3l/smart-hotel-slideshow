import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { hotelServices, hotelUsers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const services = await db.query.hotelServices.findMany({
		where: eq(hotelServices.hotelId, hotelUser.hotelId),
		orderBy: (hotelServices, { asc }) => [asc(hotelServices.sortOrder)]
	});

	return json(services);
};

export const POST: RequestHandler = async ({ request, locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const body = await request.json();
	if (!body.name || typeof body.name !== 'string') {
		return error(400, 'Name is required');
	}

	const [service] = await db
		.insert(hotelServices)
		.values({
			hotelId: hotelUser.hotelId,
			name: body.name,
			category: body.category ?? 'other',
			description: body.description ?? '',
			hours: body.hours ?? '',
			imageUrl: body.imageUrl ?? null,
			sortOrder: body.sortOrder ?? 0
		})
		.returning();

	return json(service, { status: 201 });
};
