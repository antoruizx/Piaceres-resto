// /api/pedidos
//   POST → registra un pedido que se paga en efectivo / en la mesa (sin Mercado Pago).
//   GET ?id=<uuid> → estado público del pedido (sin datos personales), para la pantalla de resultado.
import { randomUUID } from 'node:crypto';
import { crearPedido, estadoPublico, hayBase } from './_db.js';
import { leerCuerpo, UUID, validarPedido } from './_pedido.js';

export default async function handler(req, res) {
  if (!hayBase()) return res.status(503).json({ error: 'La base de pedidos todavía no está configurada.' });

  if (req.method === 'GET') {
    const id = String(req.query?.id || '');
    if (!UUID.test(id)) return res.status(400).json({ error: 'Número de pedido inválido.' });
    try {
      const p = await estadoPublico(id);
      if (!p) return res.status(404).json({ error: 'No encontramos ese pedido.' });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(p);
    } catch (e) {
      console.error('estadoPublico:', e?.message || e);
      return res.status(500).json({ error: 'No pudimos consultar el pedido.' });
    }
  }

  if (req.method === 'POST') {
    let pedido, cliente, mesa;
    try {
      ({ pedido, cliente, mesa } = validarPedido(leerCuerpo(req)));
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
    const id = randomUUID();
    try {
      await crearPedido({ id, pedido, cliente, mesa, metodoPago: 'efectivo', estadoPago: 'a_cobrar' });
      return res.status(201).json({ pedidoId: id, total: pedido.total });
    } catch (e) {
      console.error('crearPedido:', e?.message || e);
      return res.status(500).json({ error: 'No pudimos registrar el pedido.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Método no permitido.' });
}
