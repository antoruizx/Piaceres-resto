// Datos de la carta para las funciones del servidor. Los archivos se incluyen en vercel.json (includeFiles).
import fs from 'node:fs';
import path from 'node:path';
import { armarCatalogo } from '../src/lib/pedido.js';

const leer = (f) => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'data', f), 'utf8'));

let cache;
export function datos() {
  if (!cache) {
    cache = {
      catalogo: armarCatalogo(leer('menu.json'), leer('almacen.json')),
      promos: leer('promos.json'),
      sucursales: leer('sucursales.json'),
    };
  }
  return cache;
}

/** URL pública del sitio (para back_urls y notification_url). */
export function urlBase(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
}
