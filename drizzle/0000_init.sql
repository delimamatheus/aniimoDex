CREATE TABLE IF NOT EXISTS "aniimo" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"element" text NOT NULL,
	"hue" integer DEFAULT 0 NOT NULL,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "caught" (
	"user_id" text NOT NULL,
	"aniimo_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "caught_user_id_aniimo_id_pk" PRIMARY KEY("user_id","aniimo_id")
);
--> statement-breakpoint
ALTER TABLE "caught" ADD CONSTRAINT "caught_aniimo_id_aniimo_id_fk" FOREIGN KEY ("aniimo_id") REFERENCES "public"."aniimo"("id") ON DELETE cascade ON UPDATE no action;