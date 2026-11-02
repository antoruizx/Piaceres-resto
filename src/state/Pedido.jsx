// Estado global del pedido: carrito, modo (delivery / retiro / salón), sucursal y mesa.
// Se guarda en localStorage para que no se pierda al recargar (con try/catch por si el navegador lo bloquea).
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import menu from '../data/menu.json';
import almacen from '../data/almacen.json';
import promos from '../data/promos.json';
import sucursales from '../data/sucursales.json';
import { armarCatalogo, calcularPedido, promosDelDia } from '../lib/pedido.js';

export const catalogo = armarCatalogo(menu, almacen);
export const DATOS = { catalogo, promos, sucursales };
export { sucursales };

const CLAVE = 'piaceres-pedido-v1';
const INICIAL = { lineas: [], modo: 'delivery', sucursal: 'centro', mesa: '', propinaPct: 0 };

function cargar() {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE));
    if (!g || !Array.isArray(g.lineas)) return INICIAL;
    // Descarta productos que ya no existan en la carta.
    return { ...INICIAL, ...g, lineas: g.lineas.filter((l) => catalogo.porId.has(l.id)) };
  } catch {
    return INICIAL;
  }
}

const claveLinea = (id, nota) => `${id}::${(nota || '').trim().toLowerCase()}`;

function reducir(estado, a) {
  switch (a.tipo) {
    case 'agregar': {
      const nota = (a.nota || '').trim();
      const k = claveLinea(a.id, nota);
      const existe = estado.lineas.find((l) => claveLinea(l.id, l.nota) === k);
      const lineas = existe
        ? estado.lineas.map((l) => (l === existe ? { ...l, cantidad: Math.min(20, l.cantidad + a.cantidad) } : l))
        : [...estado.lineas, { id: a.id, cantidad: a.cantidad, nota }];
      return { ...estado, lineas };
    }
    case 'cantidad':
      return {
        ...estado,
        lineas: estado.lineas
          .map((l, i) => (i === a.indice ? { ...l, cantidad: Math.min(20, a.cantidad) } : l))
          .filter((l) => l.cantidad > 0),
      };
    case 'nota':
      return { ...estado, lineas: estado.lineas.map((l, i) => (i === a.indice ? { ...l, nota: a.nota.slice(0, 140) } : l)) };
    case 'vaciar':
      return { ...estado, lineas: [] };
    case 'opciones':
      return { ...estado, ...a.valores };
    default:
      return estado;
  }
}

const Ctx = createContext(null);

export function PedidoProvider({ children }) {
  const [estado, despachar] = useReducer(reducir, undefined, cargar);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* sin almacenamiento: el carrito vive solo en memoria */ }
  }, [estado]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(''), 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  const resumen = useMemo(() => {
    if (!estado.lineas.length) return null;
    try {
      return calcularPedido(DATOS, estado.lineas, { modo: estado.modo, sucursalId: estado.sucursal, propinaPct: estado.propinaPct });
    } catch {
      return null;
    }
  }, [estado]);

  const agregar = useCallback((id, cantidad = 1, nota = '') => {
    despachar({ tipo: 'agregar', id, cantidad, nota });
    setAviso(`${catalogo.porId.get(id)?.nombre ?? 'Producto'} agregado al pedido`);
  }, []);

  const valor = useMemo(
    () => ({
      ...estado,
      resumen,
      cantidad: estado.lineas.reduce((s, l) => s + l.cantidad, 0),
      promosHoy: promosDelDia(promos),
      agregar,
      setCantidad: (indice, cantidad) => despachar({ tipo: 'cantidad', indice, cantidad }),
      setNota: (indice, nota) => despachar({ tipo: 'nota', indice, nota }),
      vaciar: () => despachar({ tipo: 'vaciar' }),
      setOpciones: (valores) => despachar({ tipo: 'opciones', valores }),
      carritoAbierto,
      abrirCarrito: () => setCarritoAbierto(true),
      cerrarCarrito: () => setCarritoAbierto(false),
      aviso,
    }),
    [estado, resumen, agregar, carritoAbierto, aviso]
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export const usePedido = () => useContext(Ctx);
