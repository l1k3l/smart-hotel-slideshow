import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema.js';

/**
 * Assign a Supabase auth user to a hotel.
 *
 * Usage:
 *   npx tsx scripts/assign-user.ts <user-email-or-uuid> <hotel-slug> [role]
 *
 * Examples:
 *   npx tsx scripts/assign-user.ts john@example.com spindleruv-mlyn
 *   npx tsx scripts/assign-user.ts john@example.com spindleruv-mlyn admin
 *   npx tsx scripts/assign-user.ts 550e8400-... spindleruv-mlyn
 *
 * If an email is given, the script looks up the user UUID via Supabase admin API.
 * Requires SUPABASE_SECRET_KEY for email lookup.
 */

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL is required');
	process.exit(1);
}

const [userArg, hotelSlug, role = 'admin'] = process.argv.slice(2);

if (!userArg || !hotelSlug) {
	console.log('Usage: npx tsx scripts/assign-user.ts <email-or-uuid> <hotel-slug> [role]');
	console.log('');
	listHotels().then(() => process.exit(0));
} else {
	main().catch((err) => {
		console.error('Failed:', err);
		process.exit(1);
	});
}

async function listHotels() {
	const client = postgres(DATABASE_URL!);
	const db = drizzle(client, { schema });

	const hotels = await db.query.hotels.findMany();
	if (hotels.length === 0) {
		console.log('No hotels found. Run npm run db:seed first.');
	} else {
		console.log('Available hotels:');
		for (const h of hotels) {
			const users = await db.query.hotelUsers.findMany({
				where: eq(schema.hotelUsers.hotelId, h.id)
			});
			console.log(`  ${h.slug}  "${h.name}"  (${users.length} user${users.length !== 1 ? 's' : ''})`);
		}
	}

	await client.end();
	process.exit(0);
}

async function resolveUserId(input: string): Promise<string> {
	// If it looks like a UUID, return as-is
	if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)) {
		return input;
	}

	// Otherwise treat as email — look up via Supabase Admin API
	const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
	const secretKey = process.env.SUPABASE_SECRET_KEY;
	if (!supabaseUrl || !secretKey) {
		console.error('PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required for email lookup.');
		console.error('Alternatively, pass the user UUID directly.');
		process.exit(1);
	}

	// List users and find by email
	const resp = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
		headers: {
			Authorization: `Bearer ${secretKey}`,
			apikey: secretKey
		}
	});

	if (!resp.ok) {
		console.error(`Supabase admin API error: ${resp.status} ${await resp.text()}`);
		process.exit(1);
	}

	const data = await resp.json();
	const users: Array<{ id: string; email: string }> = data.users ?? data;
	const match = users.find((u) => u.email?.toLowerCase() === input.toLowerCase());

	if (!match) {
		console.error(`No Supabase user found with email: ${input}`);
		process.exit(1);
	}

	console.log(`Resolved ${input} → ${match.id}`);
	return match.id;
}

async function main() {
	const userId = await resolveUserId(userArg);

	const client = postgres(DATABASE_URL!);
	const db = drizzle(client, { schema });

	// Find hotel
	const hotel = await db.query.hotels.findFirst({
		where: eq(schema.hotels.slug, hotelSlug)
	});

	if (!hotel) {
		console.error(`Hotel not found: "${hotelSlug}"`);
		const all = await db.query.hotels.findMany();
		if (all.length > 0) {
			console.log('Available hotels:', all.map((h) => h.slug).join(', '));
		}
		await client.end();
		process.exit(1);
	}

	// Assign user
	const [result] = await db
		.insert(schema.hotelUsers)
		.values({ hotelId: hotel.id, userId, role })
		.onConflictDoNothing()
		.returning();

	if (result) {
		console.log(`Assigned user ${userId} to "${hotel.name}" as ${role}`);
	} else {
		console.log(`User ${userId} is already assigned to "${hotel.name}"`);
	}

	await client.end();
}

