import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Home, LocateFixed, MapPin, ShoppingBag, Trash2, UtensilsCrossed } from 'lucide-react';
import { Cantidad, Foto, Logo, Panel } from './ui.jsx';
import { catalogo, sucursales, usePedido } from '../state/Pedido.jsx';
import { MODOS, pesos } from '../lib/pedido.js';
import { INSTAGRAM, MARCA, TELEFONO, wa } from '../config.js';

const NAV = [
  ['/', 'Inicio', Home],
  ['/carta', 'Carta', UtensilsCrossed],
  ['/historia', 'Historia', BookOpen],
  ['/sucursales', 'Sucursales', MapPin],
];

/* ---------- Sucursal más cercana (haversine) ---------- */
function distanciaKm(a, b) {
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function useUbicacion(onElegir) {
  const [msg, setMsg] = useState('');
  const [buscando, setBuscando] = useState(false);
  const buscar = () => {
    if (!('geolocation' in navigator)) return setMsg('Tu navegador no permite usar la ubicación. Elegí la sucursal a mano.');
    setBuscando(true);
    setMsg('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBuscando(false);
        const yo = { lat: coords.latitude, lng: coords.longitude };
        const [mejor] = sucursales
          .filter((s) => s.lat != null)
          .map((s) => ({ ...s, km: distanciaKm(yo, s) }))
          .sort((a, b) => a.km - b.km);
        if (!mejor) return setMsg('Todavía no tenemos las ubicaciones cargadas. Elegí la sucursal a mano.');
        onElegir(mejor.id);
        setMsg(`La más cercana es ${mejor.nombre}, a ${mejor.km.toFixed(1).replace('.', ',')} km.`);
      },
      () => {
        setBuscando(false);
        setMsg('No pudimos usar tu ubicación. No pasa nada: elegí la sucursal a mano.');
      },
      { timeout: 10000, maximumAge: 600000 }
    );
  };
  return { buscar, msg, buscando };
}

export function ListaSucursales({ elegida, onElegir }) {
  const { buscar, msg, buscando } = useUbicacion(onElegir);
  return (
    <div className="lista-suc">
      <button type="button" className="btn btn-sec btn-ancho" onClick={buscar} disabled={buscando}>
        <LocateFixed size={18} aria-hidden="true" /> Usar mi ubicación
      </button>
      <p className="ayuda" role="status">{msg}</p>
      <ul>
        {sucursales.map((s) => (
          <li key={s.id}>
            <button type="button" className="suc-opcion" aria-pressed={s.id === elegida} onClick={() => onElegir(s.id)}>
              <MapPin size={18} aria-hidden="true" />
              <span>
                <strong>{s.nombre}</strong>
                <small>{s.direccion || '[DIRECCIÓN]'} · delivery {s.deliveryMin} min</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Barra superior ---------- */
function BarraSuperior() {
  const p = usePedido();
  const [eligiendo, setEligiendo] = useState(false);
  const suc = sucursales.find((s) => s.id === p.sucursal);
  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link to="/" aria-label={`${MARCA}, ir al inicio`} className="topbar-logo"><Logo /></Link>
        <nav className="nav-escritorio" aria-label="Principal">
          {NAV.map(([to, t]) => <NavLink key={to} to={to} end={to === '/'}>{t}</NavLink>)}
        </nav>
        <button type="button" className="ubicacion" onClick={() => setEligiendo(true)}>
          <MapPin size={18} className="naranja" aria-hidden="true" />
          <span>
            {p.modo === 'salon' && p.mesa ? `Mesa ${p.mesa} · ` : ''}
            {suc?.nombre}
          </span>
          <ChevronRight size={16} aria-hidden="true" />
          <span className="sr-only">Cambiar sucursal</span>
        </button>
        <button type="button" className="carrito-btn" onClick={p.abrirCarrito} aria-label={`Ver pedido, ${p.cantidad} productos`}>
          <span>{p.cantidad}</span>
          <ShoppingBag size={18} aria-hidden="true" />
        </button>
      </div>
      <Panel abierto={eligiendo} onCerrar={() => setEligiendo(false)} titulo="Elegí tu sucursal">
        <ListaSucursales elegida={p.sucursal} onElegir={(id) => { p.setOpciones({ sucursal: id }); setEligiendo(false); }} />
      </Panel>
    </header>
  );
}

/* ---------- Navegación inferior (celular) ---------- */
function BarraInferior() {
  const p = usePedido();
  return (
    <nav className="tabbar" aria-label="Navegación">
      {NAV.slice(0, 2).map(([to, t, Icono]) => (
        <NavLink key={to} to={to} end={to === '/'}><Icono size={22} aria-hidden="true" /><span>{t}</span></NavLink>
      ))}
      <button type="button" className="tab-pedido" onClick={p.abrirCarrito}>
        <span className="tab-pedido-icono">
          <ShoppingBag size={22} aria-hidden="true" />
          {p.cantidad > 0 && <b>{p.cantidad}</b>}
        </span>
        <span>Pedido</span>
      </button>
      {NAV.slice(2).map(([to, t, Icono]) => (
        <NavLink key={to} to={to}><Icono size={22} aria-hidden="true" /><span>{t}</span></NavLink>
      ))}
    </nav>
  );
}

/* ---------- Carrito ---------- */
export function Carrito() {
  const p = usePedido();
  const navegar = useNavigate();
  const [editando, setEditando] = useState(null);
  const r = p.resumen;
  const continuar = () => { p.cerrarCarrito(); navegar('/pedido'); };

  return (
    <Panel
      abierto={p.carritoAbierto}
      onCerrar={p.cerrarCarrito}
      titulo="Tu pedido"
      accion={p.lineas.length > 0 && (
        <button type="button" className="icono-btn naranja" onClick={p.vaciar} aria-label="Vaciar el pedido"><Trash2 size={20} /></button>
      )}
      pie={r && (
        <>
          <dl className="totales">
            <div><dt>Tiempo estimado</dt><dd>{r.minutos} min</dd></div>
            {r.descuento > 0 && <div><dt>Descuento del día</dt><dd className="verde">- {pesos(r.descuento)}</dd></div>}
            {p.modo === 'delivery' && <div><dt>Envío</dt><dd>{r.envio ? pesos(r.envio) : 'Sin cargo'}</dd></div>}
            <div className="fuerte"><dt>Subtotal</dt><dd>{pesos(r.subtotal + r.envio)}</dd></div>
          </dl>
          {r.faltaEnvioGratis > 0 && (
            <p className="barra-envio">
              Te faltan <strong>{pesos(r.faltaEnvioGratis)}</strong> para el envío sin cargo
              <span style={{ '--avance': `${Math.min(100, (r.subtotal / r.sucursal.envioGratisDesde) * 100)}%` }} />
            </p>
          )}
          <button type="button" className="btn btn-primario btn-ancho" onClick={continuar}>Continuar · {pesos(r.subtotal + r.envio)}</button>
        </>
      )}
    >
      {!p.lineas.length ? (
        <div className="vacio">
          <ShoppingBag size={40} aria-hidden="true" />
          <p>Tu pedido está vacío.</p>
          <Link className="btn btn-primario" to="/carta" onClick={p.cerrarCarrito}>Ver la carta</Link>
        </div>
      ) : (
        <ul className="lineas">
          {p.lineas.map((l, i) => {
            const item = catalogo.porId.get(l.id);
            const d = r?.detalle[i];
            return (
              <li key={`${l.id}-${i}`}>
                <div className="linea-foto"><Foto nombre={item.img} alt="" sizes="88px" /></div>
                <div className="linea-info">
                  <h3>{item.nombre}</h3>
                  {editando === i ? (
                    <input
                      className="campo campo-chico"
                      autoFocus
                      defaultValue={l.nota}
                      maxLength={140}
                      placeholder="Ej: sin cebolla"
                      aria-label={`Nota para ${item.nombre}`}
                      onBlur={(e) => { p.setNota(i, e.target.value); setEditando(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    />
                  ) : (
                    <p className="linea-nota">{l.nota || 'Sin cambios'}</p>
                  )}
                  <button type="button" className="link-naranja" onClick={() => setEditando(i)}>{l.nota ? 'Cambiar nota' : 'Agregar nota'}</button>
                  <div className="linea-fila">
                    <Cantidad valor={l.cantidad} onCambio={(c) => p.setCantidad(i, c)} etiqueta={`Cantidad de ${item.nombre}`} />
                    <span className="linea-precio">
                      {d?.pct > 0 && <s>{pesos(d.precioLista * d.cantidad)}</s>}
                      {d ? pesos(d.total) : ''}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/* ---------- Pie ---------- */
function Pie() {
  return (
    <footer className="pie">
      <div className="pie-in">
        <Logo />
        <p>Parrilla a la leña, pastas de autor y cocina vegetariana. Seis casas en Tucumán.</p>
        <ul>
          <li><a href={wa()} target="_blank" rel="noopener noreferrer">WhatsApp {TELEFONO}</a></li>
          <li>{INSTAGRAM ? <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Instagram</a> : 'Instagram [INSTAGRAM]'}</li>
          <li>Todos los días · 12 a 16 h y 20 a 00 h</li>
        </ul>
        <small>© 2026 {MARCA} · San Miguel de Tucumán</small>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  const p = usePedido();
  return (
    <div className="app">
      <a className="salto" href="#main">Saltar al contenido</a>
      <BarraSuperior />
      <main id="main" className="contenido">{children}</main>
      <Pie />
      <BarraInferior />
      <Carrito />
      <div className={`aviso${p.aviso ? ' visible' : ''}`} role="status" aria-live="polite">{p.aviso}</div>
    </div>
  );
}

export function SelectorModo() {
  const p = usePedido();
  return (
    <div className="segmentado" role="radiogroup" aria-label="Cómo querés tu pedido">
      {Object.entries(MODOS).map(([k, t]) => (
        <button key={k} type="button" role="radio" aria-checked={p.modo === k} onClick={() => p.setOpciones({ modo: k })}>
          {k === 'retiro' ? 'Retiro' : t}
        </button>
      ))}
    </div>
  );
}
