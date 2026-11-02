// Lógica del pedido compartida entre la app (navegador) y el servidor (/api).
// No importa JSON directamente: recibe los datos para funcionar igual en los dos lados.

export const MODOS = {
  delivery: 'Delivery',
  retiro: 'Retiro en el local',
  salon: 'En el salón',
};
export const PROPINAS = [0, 5, 10, 15];
export const MAX_CANTIDAD = 20;
export const MAX_LINEAS = 40;

/** Une la carta y el almacén en un solo catálogo con búsqueda por id. */
export function armarCatalogo(menu, almacen) {
  const secciones = [
    ...menu.secciones.map((s) => ({ ...s, grupo: 'carta' })),
    ...almacen.grupos.map((g) => ({
      id: `almacen-${g.id}`,
      titulo: g.titulo,
      nota: g.nota,
      comida: true,
      grupo: 'almacen',
      items: g.items.map((i) => ({ ...i, desc: `${i.desc} · ${i.presentacion}` })),
    })),
  ];
  const porId = new Map();
  for (const s of secciones) for (const i of s.items) porId.set(i.id, { ...i, seccion: s.id });
  return { secciones, porId };
}

/** Un plato se puede pedir si tiene precio mayor a cero (la focaccia de cortesía no). */
export const sePuedePedir = (item) => typeof item?.precio === 'number' && item.precio > 0;

/** Día de la semana en Argentina (0 = domingo), sin importar la zona horaria del equipo. */
export function diaArgentina(fecha = new Date()) {
  const d = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short' }).format(fecha);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(d);
}

export const promosDelDia = (promos, fecha = new Date()) => {
  const dia = diaArgentina(fecha);
  return promos.filter((p) => p.dias.includes(dia));
};

/** Mayor descuento (%) que aplica a un plato hoy. Las promos no se acumulan. */
export function descuentoPara(item, promosHoy) {
  return promosHoy.reduce((max, p) => (p.secciones.includes(item.seccion) ? Math.max(max, p.pct) : max), 0);
}

export const precioConDescuento = (precio, pct) => Math.round(precio * (1 - pct / 100));

/**
 * Calcula el pedido completo. Lanza un Error con un mensaje claro si algo no es válido.
 * lineas: [{ id, cantidad, nota }]
 */
export function calcularPedido({ catalogo, promos, sucursales }, lineas, opciones = {}) {
  const { modo = 'delivery', sucursalId, propinaPct = 0, fecha = new Date() } = opciones;
  if (!Array.isArray(lineas) || lineas.length === 0) throw new Error('El pedido está vacío.');
  if (lineas.length > MAX_LINEAS) throw new Error('El pedido tiene demasiados productos.');
  if (!MODOS[modo]) throw new Error('Modo de pedido inválido.');
  if (!PROPINAS.includes(Number(propinaPct))) throw new Error('Propina inválida.');
  const sucursal = sucursales.find((s) => s.id === sucursalId);
  if (!sucursal) throw new Error('Elegí una sucursal.');

  const hoy = promosDelDia(promos, fecha);
  const detalle = lineas.map((l) => {
    const item = catalogo.porId.get(l.id);
    if (!item || !sePuedePedir(item)) throw new Error(`Producto no disponible: ${l.id}`);
    const cantidad = Number(l.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_CANTIDAD) throw new Error('Cantidad inválida.');
    const pct = descuentoPara(item, hoy);
    const unitario = precioConDescuento(item.precio, pct);
    return {
      id: item.id,
      nombre: item.nombre,
      nota: String(l.nota || '').slice(0, 140),
      cantidad,
      precioLista: item.precio,
      pct,
      unitario,
      total: unitario * cantidad,
    };
  });

  const subtotalLista = detalle.reduce((s, d) => s + d.precioLista * d.cantidad, 0);
  const subtotal = detalle.reduce((s, d) => s + d.total, 0);
  const descuento = subtotalLista - subtotal;
  const envioGratis = modo === 'delivery' && subtotal >= sucursal.envioGratisDesde;
  const envio = modo === 'delivery' && !envioGratis ? sucursal.costoEnvio : 0;
  const propina = Math.round((subtotal * Number(propinaPct)) / 100);
  const faltaEnvioGratis = modo === 'delivery' ? Math.max(0, sucursal.envioGratisDesde - subtotal) : 0;

  return {
    detalle,
    cantidadItems: detalle.reduce((s, d) => s + d.cantidad, 0),
    subtotalLista,
    descuento,
    subtotal,
    envio,
    envioGratis,
    faltaEnvioGratis,
    propina,
    total: subtotal + envio + propina,
    sucursal,
    modo,
    promosAplicadas: hoy.filter((p) => detalle.some((d) => d.pct > 0 && catalogo.porId.get(d.id).seccion && p.secciones.includes(catalogo.porId.get(d.id).seccion))),
    minutos: modo === 'delivery' ? sucursal.deliveryMin : 20,
  };
}

export const pesos = (n) => `$ ${Math.round(n).toLocaleString('es-AR')}`;
