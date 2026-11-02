// Validación compartida del cuerpo de un pedido (para Mercado Pago y para efectivo).
import { calcularPedido } from '../src/lib/pedido.js';
import { datos } from './_datos.js';

const texto = (v, max) => String(v ?? '').trim().slice(0, max);

export function leerCuerpo(req) {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch { return {}; }
  }
  return req.body || {};
}

/** Devuelve { pedido, cliente, mesa } o lanza un Error con mensaje para el usuario. */
export function validarPedido(body) {
  const cliente = {
    nombre: texto(body.cliente?.nombre, 80),
    telefono: texto(body.cliente?.telefono, 30),
    direccion: texto(body.cliente?.direccion, 160),
  };
  const mesa = texto(body.mesa, 10);
  if (!cliente.nombre || !cliente.telefono) throw new Error('Completá nombre y teléfono.');
  if (body.modo === 'delivery' && !cliente.direccion) throw new Error('Completá la dirección de entrega.');
  if (body.modo === 'salon' && !mesa) throw new Error('Indicá el número de mesa.');
  const pedido = calcularPedido(datos(), body.items, {
    modo: body.modo,
    sucursalId: body.sucursal,
    propinaPct: body.propinaPct,
  });
  return { pedido, cliente, mesa };
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
