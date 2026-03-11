CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"hotel_id" uuid NOT NULL,
	"device_uuid" text,
	"device_name" text DEFAULT 'Unnamed Device' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"bound_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "devices_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "hotel_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hotel_id" uuid NOT NULL,
	"theme" text DEFAULT 'dark' NOT NULL,
	"slideshow_speed_seconds" integer DEFAULT 15 NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"resort_aliases" text[] DEFAULT '{}' NOT NULL,
	"enabled_modules" text[] DEFAULT '{"weather","lifts","slopes","webcams"}' NOT NULL,
	"data_provider" text DEFAULT 'holidayinfo' NOT NULL,
	"provider_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"custom_branding" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hotel_settings_hotel_id_unique" UNIQUE("hotel_id")
);
--> statement-breakpoint
CREATE TABLE "hotel_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hotel_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hotel_users_hotel_id_user_id_unique" UNIQUE("hotel_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "hotels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hotels_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_settings" ADD CONSTRAINT "hotel_settings_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_users" ADD CONSTRAINT "hotel_users_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;