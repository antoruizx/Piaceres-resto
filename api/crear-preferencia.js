// POST /api/crear-preferencia
// Recibe los productos por ID, recalcula los precios en el servidor (nunca confía en el cliente),
// guarda el pedido como "pendiente" y crea una preferencia de Mercado Pago Checkout Pro.
import { randomUUID } from 'node:crypto';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { MODOS } from '../src/lib/pedido.js';
import { urlBase } from './_datos.js';
import { crearPedido, guardarPreferencia, hayBase } from './_db.js';
import { leerCuerpo, validarPedido } from './_pedido.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!process.env.MP_ACCESS_TOKEN) {
    return res.status(503).json({ error: 'El pago online todavía no está configurado.' });
  }

  let pedido, cliente, mesa;
  try {
    ({ pedido, cliente, mesa } = validarPedido(leerCuerpo(req)));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const pedidoId = randomUUID();
  if (hayBase()) {
    try {
      await crearPedido({ id: pedidoId, pedido, cliente, mesa, metodoPago: 'mercadopago', estadoPago: 'pendiente' });
    } catch (e) {
      console.error('No se pudo guardar el pedido:', e?.message || e);
      return res.status(500).json({ error: 'No pudimos registrar el pedido. Probá de nuevo en un momento.' });
    }
  }

  // Mercado Pago no acepta ítems negativos: el descuento ya va aplicado en el precio unitario.
  const items = pedido.detalle.map((d) => ({
    id: d.id,
    title: d.pct ? `${d.nombre} (-${d.pct}%)` : d.nombre,
    description: d.nota || undefined,
    quantity: d.cantidad,
    unit_price: d.unitario,
    currency_id: 'ARS',
  }));
  if (pedido.envio) items.push({ id: 'envio', title: 'Envío', quantity: 1, unit_price: pedido.envio, currency_id: 'ARS' });
  if (pedido.propina) items.push({ id: 'propina', title: 'Propina', quantity: 1, unit_price: pedido.propina, currency_id: 'ARS' });

  const base = urlBase(req);
  const publico = base.startsWith('https://');

  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const pref = await new Preference(client).create({
      body: {
        items,
        external_reference: pedidoId,
        statement_descriptor: 'PIACERES',
        back_urls: {
          success: `${base}/pedido/exito`,
          pending: `${base}/pedido/pendiente`,
          failure: `${base}/pedido/error`,
        },
        ...(publico && { auto_return: 'approved', notification_url: `${base}/api/webhook-mp` }),
        metadata: {
          pedido_id: pedidoId,
          modo: MODOS[pedido.modo],
          sucursal: pedido.sucursal.nombre,
          mesa: mesa || undefined,
          total: pedido.total,
        },
      },
    });
    if (hayBase()) await guardarPreferencia(pedidoId, pref.id).catch((e) => console.error('guardarPreferencia:', e?.message));
    return res.status(200).json({ id: pref.id, init_point: pref.init_point, pedidoId, total: pedido.total });
  } catch (e) {
    console.error('Error de Mercado Pago:', e?.message || e);
    return res.status(502).json({ error: 'No pudimos conectar con Mercado Pago. Probá de nuevo en un momento.' });
  }
}
