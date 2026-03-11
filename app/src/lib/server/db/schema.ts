import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, unique } from 'drizzle-orm/pg-core';

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const hotels = pgTable('hotels', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	slug: text('slug').unique().notNull(),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow()
});

export const hotelSettings = pgTable('hotel_settings', {
	id: uuid('id').primaryKey().defaultRandom(),
	hotelId: uuid('hotel_id')
		.notNull()
		.unique()
		.references(() => hotels.id, { onDelete: 'cascade' }),
	theme: text('theme').notNull().default('dark'),
	slideshowSpeedSeconds: integer('slideshow_speed_seconds').notNull().default(15),
	language: text('language').notNull().default('en'),
	resortAliases: text('resort_aliases').array().notNull().default([]),
	enabledModules: text('enabled_modules')
		.array()
		.notNull()
		.default(['weather', 'lifts', 'slopes', 'webcams']),
	dataProvider: text('data_provider').notNull().default('holidayinfo'),
	providerConfig: jsonb('provider_config').notNull().default({}),
	customBranding: jsonb('custom_branding').notNull().default({}),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow()
});

export const devices = pgTable('devices', {
	id: uuid('id').primaryKey().defaultRandom(),
	token: text('token').unique().notNull(),
	hotelId: uuid('hotel_id')
		.notNull()
		.references(() => hotels.id, { onDelete: 'cascade' }),
	deviceUuid: text('device_uuid'),
	deviceName: text('device_name').notNull().default('Unnamed Device'),
	isActive: boolean('is_active').notNull().default(true),
	boundAt: timestamptz('bound_at'),
	lastSeenAt: timestamptz('last_seen_at'),
	createdAt: timestamptz('created_at').notNull().defaultNow()
});

export const hotelUsers = pgTable(
	'hotel_users',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		hotelId: uuid('hotel_id')
			.notNull()
			.references(() => hotels.id, { onDelete: 'cascade' }),
		userId: uuid('user_id').notNull(),
		role: text('role').notNull().default('admin'),
		createdAt: timestamptz('created_at').notNull().defaultNow()
	},
	(table) => [unique().on(table.hotelId, table.userId)]
);
