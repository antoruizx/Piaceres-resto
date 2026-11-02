// POST /api/webhook-mp
// Mercado Pago avisa acá cuando cambia un pago. Se valida la firma (x-signature) con MP_WEBHOOK_SECRET
// y se consulta el pago a la API de MP: el estado final lo decide este webhook, no la redirección.
import crypto from 'node:crypto';
import { MercadoPagoConfig, Payment } from 'mercadopago';

function firmaValida(req, dataId) {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  const firma = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];
  if (!secreto || !firma) return false;
  const partes = Object.fromEntries(String(firma).split(',').map((p) => p.trim().split('=')));
  if (!partes.ts || !partes.v1) return false;
  // Formato oficial: id:[data.id];request-id:[x-request-id];ts:[ts];
  let manifiesto = `id:${String(dataId).toLowerCase()};`;
  if (requestId) manifiesto += `request-id:${requestId};`;
  manifiesto += `ts:${partes.ts};`;
  const esperado = crypto.createHmac('sha256', secreto).update(manifiesto).digest('hex');
  const a = Buffer.from(esperado), b = Buffer.from(String(partes.v1));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const tipo = req.query?.type || body.type;
  const dataId = req.query?.['data.id'] || body.data?.id;

  if (!dataId || !firmaValida(req, dataId)) return res.status(401).json({ error: 'Firma inválida.' });
  if (tipo !== 'payment') return res.status(200).json({ ok: true, ignorado: tipo });

  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const pago = await new Payment(client).get({ id: dataId });
    // Etapa 3: actualizar el pedido (pago.external_reference) en la base de datos con pago.status.
    console.log('Pago', pago.id, pago.status, 'pedido', pago.external_reference, 'total', pago.transaction_amount);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Webhook MP:', e?.message || e);
    // 500 hace que Mercado Pago reintente la notificación más tarde.
    return res.status(500).json({ error: 'No se pudo consultar el pago.' });
  }
}
