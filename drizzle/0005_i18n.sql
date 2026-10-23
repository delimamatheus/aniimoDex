CREATE TABLE "aniimo_i18n" (
	"id" integer NOT NULL,
	"form" text NOT NULL,
	"lang" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"form_label" text,
	CONSTRAINT "aniimo_i18n_id_form_lang_pk" PRIMARY KEY("id","form","lang")
);
--> statement-breakpoint
ALTER TABLE "aniimo" ADD COLUMN "elements" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "aniimo_i18n" ADD CONSTRAINT "aniimo_i18n_id_form_aniimo_id_form_fk" FOREIGN KEY ("id","form") REFERENCES "public"."aniimo"("id","form") ON DELETE cascade ON UPDATE no action;