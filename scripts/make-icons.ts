// Uso: node --experimental-strip-types scripts/make-icons.ts <imagem-quadrada>
// Gera app/icon.png, app/apple-icon.png e app/favicon.ico a partir de uma imagem.
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const src = process.argv[2];
if (!src) throw new Error("Informe a imagem de origem");
const png = (size: number) => sharp(src).resize(size, size, { fit: "cover" }).png().toBuffer();

await writeFile("app/icon.png", await png(192));
await writeFile("app/apple-icon.png", await png(180));

// ICO com PNGs embutidos (16, 32 e 48 px)
const sizes = [16, 32, 48];
const imgs = await Promise.all(sizes.map(png));
const head = Buffer.alloc(6 + 16 * sizes.length);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(sizes.length, 4);
let offset = head.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  head[e] = s; head[e + 1] = s;
  head.writeUInt16LE(1, e + 4);
  head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(imgs[i].length, e + 8);
  head.writeUInt32LE(offset, e + 12);
  offset += imgs[i].length;
});
await writeFile("app/favicon.ico", Buffer.concat([head, ...imgs]));
console.log("ícones gerados em app/");
