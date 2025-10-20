CREATE TABLE "report_completion" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"handling_description" text NOT NULL,
	"notes" text,
	"completion_images" jsonb NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_completion" ADD CONSTRAINT "report_completion_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE cascade ON UPDATE no action;