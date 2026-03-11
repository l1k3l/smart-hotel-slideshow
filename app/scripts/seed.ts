import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../src/lib/server/db/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL is required');
	process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

async function seed() {
	console.log('Seeding database...');

	// Insert test hotel
	const [hotel] = await db
		.insert(schema.hotels)
		.values({
			name: 'Hotel Špindlerův Mlýn',
			slug: 'spindleruv-mlyn'
		})
		.onConflictDoNothing({ target: schema.hotels.slug })
		.returning();

	if (!hotel) {
		console.log('Hotel already exists, skipping seed.');
		await client.end();
		return;
	}

	console.log(`Created hotel: ${hotel.name} (${hotel.id})`);

	// Insert hotel settings
	await db.insert(schema.hotelSettings).values({
		hotelId: hotel.id,
		theme: 'dark',
		slideshowSpeedSeconds: 15,
		language: 'en',
		resortAliases: ['medvedin', 'svpetr'],
		enabledModules: ['weather', 'lifts', 'slopes', 'webcams'],
		dataProvider: 'holidayinfo',
		providerConfig: {},
		customBranding: {}
	});

	console.log('Created hotel settings');

	// Insert test device with a known token
	const testToken = 'TEST-ABCD';
	await db.insert(schema.devices).values({
		token: testToken,
		hotelId: hotel.id,
		deviceName: 'Lobby TV'
	});

	console.log(`Created test device with token: ${testToken}`);
	console.log('Seed complete!');

	await client.end();
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
