import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { announcements, hotelUsers } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ params, request, locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const body = await request.json();
	const updates: Record<string, unknown> = {};

	if (typeof body.title === 'string') updates.title = body.title;
	if (typeof body.body === 'string') updates.body = body.body;
	if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl ?? null;
	if (body.showFrom !== undefined) updates.showFrom = body.showFrom ? new Date(body.showFrom) : null;
	if (body.showUntil !== undefined) updates.showUntil = body.showUntil ? new Date(body.showUntil) : null;
	if (typeof body.priority === 'number') updates.priority = body.priority;
	if (typeof body.isActive === 'boolean') updates.isActive = body.isActive;

	if (Object.keys(updates).length === 0) {
		return error(400, 'No valid fields to update');
	}

	const [updated] = await db
		.update(announcements)
		.set(updates)
		.where(and(eq(announcements.id, params.id), eq(announcements.hotelId, hotelUser.hotelId)))
		.returning();

	if (!updated) return error(404, 'Announcement not found');
	return json(updated);
};

export const DELETE: RequestHandler = async ({ params, locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return error(401, 'Unauthorized');

	const hotelUser = await db.query.hotelUsers.findFirst({
		where: eq(hotelUsers.userId, user.id)
	});
	if (!hotelUser) return error(403, 'No hotel assigned');

	const [deleted] = await db
		.delete(announcements)
		.where(and(eq(announcements.id, params.id), eq(announcements.hotelId, hotelUser.hotelId)))
		.returning();

	if (!deleted) return error(404, 'Announcement not found');
	return json({ success: true });
};
