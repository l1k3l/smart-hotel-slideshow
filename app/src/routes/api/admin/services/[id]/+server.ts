import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { hotelServices, hotelUsers } from '$lib/server/db/schema';
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

	if (typeof body.name === 'string') updates.name = body.name;
	if (typeof body.category === 'string') updates.category = body.category;
	if (typeof body.description === 'string') updates.description = body.description;
	if (typeof body.hours === 'string') updates.hours = body.hours;
	if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl ?? null;
	if (typeof body.sortOrder === 'number') updates.sortOrder = body.sortOrder;
	if (typeof body.isActive === 'boolean') updates.isActive = body.isActive;

	if (Object.keys(updates).length === 0) {
		return error(400, 'No valid fields to update');
	}

	const [updated] = await db
		.update(hotelServices)
		.set(updates)
		.where(and(eq(hotelServices.id, params.id), eq(hotelServices.hotelId, hotelUser.hotelId)))
		.returning();

	if (!updated) return error(404, 'Service not found');
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
		.delete(hotelServices)
		.where(and(eq(hotelServices.id, params.id), eq(hotelServices.hotelId, hotelUser.hotelId)))
		.returning();

	if (!deleted) return error(404, 'Service not found');
	return json({ success: true });
};
