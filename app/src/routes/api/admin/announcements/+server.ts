import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { announcements, hotelUsers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const items = await db.query.announcements.findMany({
		where: eq(announcements.hotelId, hotelUser.hotelId),
		orderBy: (announcements, { desc }) => [desc(announcements.priority), desc(announcements.createdAt)]
	});

	return json(items);
};

export const POST: RequestHandler = async ({ request, locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const body = await request.json();
	if (!body.title || typeof body.title !== 'string') {
		return error(400, 'Title is required');
	}

	const [item] = await db
		.insert(announcements)
		.values({
			hotelId: hotelUser.hotelId,
			title: body.title,
			body: body.body ?? '',
			imageUrl: body.imageUrl ?? null,
			showFrom: body.showFrom ? new Date(body.showFrom) : null,
			showUntil: body.showUntil ? new Date(body.showUntil) : null,
			priority: body.priority ?? 0
		})
		.returning();

	return json(item, { status: 201 });
};
