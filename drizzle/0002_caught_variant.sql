ALTER TABLE "caught" ADD COLUMN "variant" text DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "caught" DROP CONSTRAINT "caught_user_id_aniimo_id_pk";--> statement-breakpoint
ALTER TABLE "caught" ADD CONSTRAINT "caught_user_id_variant_aniimo_id_pk" PRIMARY KEY("user_id","variant","aniimo_id");
