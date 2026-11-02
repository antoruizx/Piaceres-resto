// Convierte fotos a WebP en 3 anchos (480, 960, 1600) dentro de public/img.
// Uso:
//   npm run img -- "<carpeta con las fotos originales>"        → convierte todas las del MAPA
//   npm run img -- --foto "<archivo.jpg>" <nombre-final>        → convierte una sola foto
import sharp from 'sharp';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

// nombre final -> archivo original (dentro de la carpeta indicada)
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

async function convertir(archivo, nombre) {
  if (!/^[a-z0-9-]+$/.test(nombre)) throw new Error(`Nombre inválido "${nombre}": usá minúsculas y guiones.`);
  if (!existsSync(archivo)) { console.warn('Falta:', archivo); return; }
  for (const w of ANCHOS) {
    await sharp(archivo).rotate().resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78 }).toFile(join(out, `${nombre}-${w}.webp`));
  }
  console.log('OK', nombre);
}

const args = process.argv.slice(2);
if (args[0] === '--foto') {
  if (!args[1] || !args[2]) { console.error('Uso: npm run img -- --foto "<archivo>" <nombre-final>'); process.exit(1); }
  await convertir(args[1], args[2]);
} else if (args[0]) {
  for (const [nombre, archivo] of Object.entries(MAPA)) await convertir(join(args[0], archivo), nombre);
} else {
  console.error('Indicá una carpeta o usá --foto.');
  process.exit(1);
}
