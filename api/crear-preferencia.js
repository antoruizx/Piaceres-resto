// POST /api/crear-preferencia
// Recibe los productos por ID, recalcula los precios en el servidor (nunca confía en el cliente)
// y crea una preferencia de Mercado Pago Checkout Pro.
import { randomUUID } from 'node:crypto';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { calcularPedido, MODOS } from '../src/lib/pedido.js';
import { datos, urlBase } from './_datos.js';

const texto = (v, max) => String(v ?? '').trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!process.env.MP_ACCESS_TOKEN) {
    return res.status(503).json({ error: 'El pago online todavía no está configurado.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const cliente = {
    nombre: texto(body.cliente?.nombre, 80),
    telefono: texto(body.cliente?.telefono, 30),
    direccion: texto(body.cliente?.direccion, 160),
  };
  const mesa = texto(body.mesa, 10);

  let pedido;
  try {
    if (!cliente.nombre || !cliente.telefono) throw new Error('Completá nombre y teléfono.');
    if (body.modo === 'delivery' && !cliente.direccion) throw new Error('Completá la dirección de entrega.');
    pedido = calcularPedido(datos(), body.items, {
      modo: body.modo,
      sucursalId: body.sucursal,
      propinaPct: body.propinaPct,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
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

  const pedidoId = randomUUID();
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
          cliente_nombre: cliente.nombre,
          cliente_telefono: cliente.telefono,
          cliente_direccion: cliente.direccion || undefined,
          total: pedido.total,
        },
      },
    });
    // Etapa 3: acá se guarda el pedido en la base de datos con estado "pendiente de pago".
    return res.status(200).json({ id: pref.id, init_point: pref.init_point, pedidoId, total: pedido.total });
  } catch (e) {
    console.error('Error de Mercado Pago:', e?.message || e);
    return res.status(502).json({ error: 'No pudimos conectar con Mercado Pago. Probá de nuevo en un momento.' });
  }
}
