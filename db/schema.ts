import { foreignKey, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const KINDS = ["base", "regional", "prismana"] as const;
export type Kind = (typeof KINDS)[number];

// Uma linha por (número da dex, forma). Formas regionais/prismanas repetem o número do original.
// form = "basic" | "highland" | "prismana" | ...; position define a ordem de exibição.
export const aniimo = pgTable(
  "aniimo",
  {
    id: integer("id").notNull(),
    form: text("form").notNull().default("basic"),
    formLabel: text("form_label"),
    kind: text("kind").$type<Kind>().notNull().default("base"),
    position: integer("position").notNull().default(0),
    name: text("name").notNull(),
    element: text("element").notNull(),
    hue: integer("hue").notNull().default(0),
    image: text("image"),
    stage: integer("stage").notNull().default(1),
    description: text("description"),
  },
  (t) => [primaryKey({ columns: [t.id, t.form] })],
);

export const VARIANTS = ["normal", "umbral", "shiny", "prismana"] as const;
export type Variant = (typeof VARIANTS)[number];

// user_id = "<provider>:<id da conta no provider>" (ex.: "github:1234")
export const caught = pgTable(
  "caught",
  {
    userId: text("user_id").notNull(),
    variant: text("variant").$type<Variant>().notNull().default("normal"),
    aniimoId: integer("aniimo_id").notNull(),
    form: text("form").notNull().default("basic"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.variant, t.aniimoId, t.form] }),
    foreignKey({ columns: [t.aniimoId, t.form], foreignColumns: [aniimo.id, aniimo.form] }).onDelete("cascade"),
  ],
);
