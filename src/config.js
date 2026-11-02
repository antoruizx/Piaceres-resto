export const WHATSAPP = import.meta.env.VITE_WHATSAPP || '5493814988682';
export const wa = (msg) =>
  `https://wa.me/${WHATSAPP}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;

export const TELEFONO = '381 498-8682';
export const TEL_HREF = 'tel:+5493814988682';
export const DIRECCION = 'Blvd. Kukulcán km 9.5, Zona Hotelera';
export const CIUDAD = 'Cancún, Quintana Roo';
export const INSTAGRAM = null; // completar con la URL real, ej. 'https://www.instagram.com/piaceriargentini'
export const EMAIL = null; // completar

// Foto del hero: cambiar a 'salon' cuando esté la foto del salón (npm run img).
export const HERO_IMG = 'medallon-lomo';

export const PH = { precio: '[PRECIO]', monto: '[MONTO]', direccion: '[DIRECCIÓN]', minutos: '[X]' };

export const precioTxt = (p) =>
  p === null || p === undefined ? PH.precio : p === 0 ? 'Sin cargo' : `$ ${p.toLocaleString('es-MX')}`;
