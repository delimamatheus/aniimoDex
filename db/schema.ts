import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const aniimo = pgTable("aniimo", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  element: text("element").notNull(),
  hue: integer("hue").notNull().default(0),
  image: text("image"),
  stage: integer("stage").notNull().default(1),
  description: text("description"),
});

// user_id = "<provider>:<id da conta no provider>" (ex.: "github:1234")
export const VARIANTS = ["normal", "umbral", "shiny"] as const;
export type Variant = (typeof VARIANTS)[number];

export const caught = pgTable(
  "caught",
  {
    userId: text("user_id").notNull(),
    variant: text("variant").$type<Variant>().notNull().default("normal"),
    aniimoId: integer("aniimo_id").notNull().references(() => aniimo.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.variant, t.aniimoId] })],
);
