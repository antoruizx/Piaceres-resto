// Base de datos de pedidos (Postgres en Neon, conectado desde Vercel → Storage).
// Si DATABASE_URL no está configurada, hayBase() devuelve false y la app sigue funcionando sin guardar.
import { neon } from '@neondatabase/serverless';

const URL_DB = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let sql = null;
try {
  if (URL_DB) sql = neon(URL_DB);
} catch (e) {
  // Una URL mal escrita no debe tirar abajo el resto de la API (por ejemplo, el pago).
  console.error('DATABASE_URL inválida, los pedidos no se van a guardar:', e?.message || e);
}

export const hayBase = () => Boolean(sql);

/** Solo para pruebas: reemplaza la conexión por otra con la misma interfaz (tagged template). */
export function _usarConexion(fn) { sql = fn; lista = undefined; }

// Crea la tabla la primera vez (migración mínima, idempotente).
let lista;
async function preparar() {
  if (!lista) {
    lista = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS pedidos (
          id                uuid PRIMARY KEY,
          creado            timestamptz NOT NULL DEFAULT now(),
          actualizado       timestamptz NOT NULL DEFAULT now(),
          modo              text NOT NULL,
          sucursal          text NOT NULL,
          mesa              text,
          cliente_nombre    text NOT NULL,
          cliente_telefono  text NOT NULL,
          cliente_direccion text,
          items             jsonb NOT NULL,
          subtotal_lista    integer NOT NULL,
          descuento         integer NOT NULL,
          envio             integer NOT NULL,
          propina           integer NOT NULL,
          total             integer NOT NULL,
          metodo_pago       text NOT NULL,
          estado_pago       text NOT NULL,
          estado            text NOT NULL DEFAULT 'recibido',
          mp_preference_id  text,
          mp_payment_id     text,
          monto_pagado      integer
        )`;
      await sql`CREATE INDEX IF NOT EXISTS pedidos_creado_idx ON pedidos (creado DESC)`;
    })().catch((e) => { lista = undefined; throw e; });
  }
  return lista;
}

/** Guarda un pedido recién calculado por calcularPedido(). */
export async function crearPedido({ id, pedido, cliente, mesa, metodoPago, estadoPago }) {
  await preparar();
  const items = pedido.detalle.map(({ id: itemId, nombre, cantidad, unitario, pct, nota, total }) => ({ id: itemId, nombre, cantidad, unitario, pct, nota, total }));
  await sql`
    INSERT INTO pedidos (id, modo, sucursal, mesa, cliente_nombre, cliente_telefono, cliente_direccion, items,
                         subtotal_lista, descuento, envio, propina, total, metodo_pago, estado_pago)
    VALUES (${id}, ${pedido.modo}, ${pedido.sucursal.id}, ${mesa || null}, ${cliente.nombre}, ${cliente.telefono},
            ${cliente.direccion || null}, ${JSON.stringify(items)}::jsonb, ${pedido.subtotalLista}, ${pedido.descuento},
            ${pedido.envio}, ${pedido.propina}, ${pedido.total}, ${metodoPago}, ${estadoPago})`;
}

export async function guardarPreferencia(id, preferenceId) {
  await preparar();
  await sql`UPDATE pedidos SET mp_preference_id = ${preferenceId}, actualizado = now() WHERE id = ${id}`;
}

/** Actualiza el pago según lo que informa Mercado Pago. Devuelve el pedido o null si no existe. */
export async function registrarPago(id, { estadoPago, paymentId, montoPagado }) {
  await preparar();
  // Un pago "aprobado" por menos del total queda marcado para revisar a mano.
  const filas = await sql`
    UPDATE pedidos
       SET estado_pago = CASE WHEN ${estadoPago} = 'aprobado' AND ${montoPagado}::integer < total THEN 'revisar_monto' ELSE ${estadoPago} END,
           mp_payment_id = ${paymentId}, monto_pagado = ${montoPagado}, actualizado = now()
     WHERE id = ${id}
     RETURNING id, total, estado_pago`;
  return filas[0] || null;
}

/** Datos públicos de un pedido (sin datos personales) para la pantalla de resultado. */
export async function estadoPublico(id) {
  await preparar();
  const filas = await sql`
    SELECT id, creado, modo, sucursal, mesa, total, estado, estado_pago, metodo_pago,
           (SELECT jsonb_agg(jsonb_build_object('nombre', i->>'nombre', 'cantidad', i->'cantidad')) FROM jsonb_array_elements(items) i) AS items
      FROM pedidos WHERE id = ${id}`;
  return filas[0] || null;
}
