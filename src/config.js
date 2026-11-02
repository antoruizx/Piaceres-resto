export const MARCA = 'Piaceres Argentinos';
export const WHATSAPP = import.meta.env.VITE_WHATSAPP || '5493814988682';
export const wa = (msg) => `https://wa.me/${WHATSAPP}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
export const TELEFONO = '381 498-8682';
export const TEL_HREF = 'tel:+5493814988682';
export const INSTAGRAM = null; // completar
export const EMAIL = null; // completar
export const HERO_IMG = 'medallon-lomo'; // cambiar a 'salon' cuando esté la foto del salón
