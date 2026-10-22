import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const aniimo = pgTable("aniimo", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  element: text("element").notNull(),
  hue: integer("hue").notNull().default(0),
  image: text("image"),
});

// user_id = "<provider>:<id da conta no provider>" (ex.: "github:1234")
export const caught = pgTable(
  "caught",
  {
    userId: text("user_id").notNull(),
    aniimoId: integer("aniimo_id").notNull().references(() => aniimo.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.aniimoId] })],
);
