CREATE TYPE "public"."damage_category" AS ENUM('berat', 'sedang', 'ringan');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('draft', 'diperiksa', 'dikonfirmasi', 'dalam_penanganan', 'selesai', 'ditolak');--> statement-breakpoint
CREATE TABLE "report" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"title" text NOT NULL,
	"location_name" text NOT NULL,
	"location_geo" jsonb NOT NULL,
	"damage_category" "damage_category" NOT NULL,
	"impact_of_damage" text,
	"description" text,
	"photo_urls" jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"status" "report_status" DEFAULT 'draft' NOT NULL,
	"status_history" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;