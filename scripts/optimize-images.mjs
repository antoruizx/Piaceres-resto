// Convierte las fotos originales a WebP en 3 anchos (480, 960, 1600) dentro de public/img.
// Uso: npm run img -- "<carpeta con las fotos originales>"
import sharp from 'sharp';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const src = process.argv[2];
if (!src) { console.error('Indicá la carpeta de origen.'); process.exit(1); }

// nombre final -> archivo original
const MAPA = {
  'medallon-lomo': 'Ии еда, ии салат, фудфото, стейк ии, генерация.jpg',
  'pizza-burrata': '97d9651e5171df45af9d15f5bfbd9baf.jpg',
  'pizza-crudo': 'descarga (73).jpg',
  'tostadas-crudo': '@hungry_anja en Instagram.jpg',
  'bruschettas': 'descarga (78).jpg',
  'hongos': 'descarga (79).jpg',
  'salmon': 'descarga (80).jpg',
  'coles': 'descarga (81).jpg',
  'zanahorias': 'descarga (83).jpg',
  'rosas-papa': 'descarga (84).jpg',
  'burger': 'descarga (77).jpg',
  'tortelli': 'Red Wine Tortelli with Pork and Radicchio in Garlic Oil - Pasta et Al.jpg',
  'peras': 'Stanley tucci _ Elegant Blue Cheese Stuffed Pears 🍐🧀✨ _ Facebook.jpg',
  'tartaletas': 'Quick & Tasty_ Mini Mushroom Pot Pie Guide.jpg',
  'volcan': 'ИИ-изображение для сайта ресторана.jpg',
  'salon': 'salon.jpg', // foto del hero (opcional, todavía no existe)
};
const ANCHOS = [480, 960, 1600];
const out = 'public/img';
mkdirSync(out, { recursive: true });

for (const [nombre, archivo] of Object.entries(MAPA)) {
  const p = join(src, archivo);
  if (!existsSync(p)) { console.warn('Falta:', archivo); continue; }
  for (const w of ANCHOS) {
    await sharp(p).rotate().resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78 }).toFile(join(out, `${nombre}-${w}.webp`));
  }
  console.log('OK', nombre);
}
