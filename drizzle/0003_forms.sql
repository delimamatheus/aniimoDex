ALTER TABLE "caught" DROP CONSTRAINT "caught_aniimo_id_aniimo_id_fk";--> statement-breakpoint
ALTER TABLE "caught" DROP CONSTRAINT "caught_user_id_variant_aniimo_id_pk";--> statement-breakpoint
ALTER TABLE "aniimo" DROP CONSTRAINT "aniimo_pkey";--> statement-breakpoint
ALTER TABLE "aniimo" ADD COLUMN "form" text DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE "aniimo" ADD COLUMN "form_label" text;--> statement-breakpoint
ALTER TABLE "aniimo" ADD COLUMN "kind" text DEFAULT 'base' NOT NULL;--> statement-breakpoint
ALTER TABLE "aniimo" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "caught" ADD COLUMN "form" text DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE "aniimo" ADD CONSTRAINT "aniimo_id_form_pk" PRIMARY KEY("id","form");--> statement-breakpoint
ALTER TABLE "caught" ADD CONSTRAINT "caught_user_id_variant_aniimo_id_form_pk" PRIMARY KEY("user_id","variant","aniimo_id","form");--> statement-breakpoint
ALTER TABLE "caught" ADD CONSTRAINT "caught_aniimo_id_form_aniimo_id_form_fk" FOREIGN KEY ("aniimo_id","form") REFERENCES "public"."aniimo"("id","form") ON DELETE cascade ON UPDATE no action;
