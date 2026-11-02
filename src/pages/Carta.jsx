// La carta virtual: el único lugar (junto al detalle) donde se ven los precios.
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Info, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { DIETAS, Foto, IconosDieta, Panel } from '../components/ui.jsx';
import { CATEGORIAS } from './Inicio.jsx';
import { catalogo, usePedido } from '../state/Pedido.jsx';
import { descuentoPara, pesos, precioConDescuento, sePuedePedir } from '../lib/pedido.js';
import { MARCA } from '../config.js';

const CHIPS = [['para-vos', 'Para vos'], ...CATEGORIAS.map(([id, t]) => [id, t])];
const TIPOS = [['promo', 'Con promo'], ['popular', 'Populares'], ['nuevo', 'Nuevos']];
const PARAM_DIETA = { veg: 'veg', vegano: 'vegano', sinTacc: 'sintacc' };
const AVISO = 'piaceres-aviso-filtros';

const normal = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function PlatoCard({ item }) {
  const { agregar, promosHoy } = usePedido();
  const pct = descuentoPara(item, promosHoy);
  const pedible = sePuedePedir(item);
  return (
    <li className="plato-card">
      <Link to={`/carta/${item.id}`} className="plato-link">
        <span className="plato-foto"><Foto nombre={item.img} alt={item.nombre} sizes="(max-width: 760px) 45vw, 240px" /></span>
        <span className="plato-badges">
          {pct > 0 && <span className="badge badge-promo">-{pct}%</span>}
          {item.nuevo && <span className="badge badge-nuevo">Nuevo</span>}
          {item.cortesia && <span className="badge badge-nuevo">Cortesía</span>}
        </span>
        <span className="plato-dietas"><IconosDieta item={item} /></span>
        <strong className="plato-nombre">{item.nombre}</strong>
        <span className="plato-meta">{item.desc}</span>
      </Link>
      <div className="plato-pie">
        <span className="plato-precio">
          {pedible ? (
            <>
              {pct > 0 && <s>{pesos(item.precio)}</s>}
              {pesos(precioConDescuento(item.precio, pct))}
            </>
          ) : 'De la casa'}
        </span>
        {pedible && (
          <button type="button" className="mas-btn" onClick={() => agregar(item.id)} aria-label={`Agregar ${item.nombre} al pedido`}>
            <Plus size={22} />
          </button>
        )}
      </div>
    </li>
  );
}

export default function Carta() {
  const [params, setParams] = useSearchParams();
  const { promosHoy } = usePedido();
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [verAviso, setVerAviso] = useState(() => { try { return !localStorage.getItem(AVISO); } catch { return true; } });
  useEffect(() => { document.title = `La carta · ${MARCA}`; }, []);

  const cat = params.get('cat') || 'para-vos';
  const q = params.get('q') || '';
  const dietas = Object.fromEntries(DIETAS.map(([k]) => [k, params.get(PARAM_DIETA[k]) === '1']));
  const tipos = Object.fromEntries(TIPOS.map(([k]) => [k, params.get(k) === '1']));
  const nFiltros = [...Object.values(dietas), ...Object.values(tipos)].filter(Boolean).length;

  const set = (k, v) => setParams((prev) => {
    const sig = new URLSearchParams(prev);
    if (v) sig.set(k, v); else sig.delete(k);
    return sig;
  }, { replace: true });

  const grupos = useMemo(() => {
    const busqueda = normal(q.trim());
    const pasa = (i, s) =>
      (!busqueda || normal(`${i.nombre} ${i.desc}`).includes(busqueda)) &&
      DIETAS.every(([k]) => !dietas[k] || !s.comida || i[k]) &&
      (!tipos.promo || descuentoPara(i, promosHoy) > 0) &&
      (!tipos.popular || i.popular) &&
      (!tipos.nuevo || i.nuevo);
    // Los productos "ocultos" (ej. el de prueba de $1) solo se abren con su link directo.
    const conSeccion = (s) => s.items.filter((i) => !i.oculto).map((i) => ({ ...i, seccion: s.id }));

    if (cat === 'para-vos' && !busqueda) {
      const todos = catalogo.secciones.flatMap((s) => conSeccion(s).filter((i) => pasa(i, s)));
      const enPromo = todos.filter((i) => descuentoPara(i, promosHoy) > 0);
      const populares = todos.filter((i) => i.popular && !enPromo.includes(i));
      return [
        { id: 'promo', titulo: 'En promo hoy', items: enPromo },
        { id: 'pop', titulo: 'Los favoritos de la casa', items: populares },
      ].filter((g) => g.items.length);
    }
    return catalogo.secciones
      .filter((s) => busqueda || cat === 'para-vos' || (cat === 'almacen' ? s.grupo === 'almacen' : s.id === cat))
      .map((s) => ({ id: s.id, titulo: s.titulo, nota: s.nota, items: conSeccion(s).filter((i) => pasa(i, s)) }))
      .filter((g) => g.items.length);
  }, [cat, q, params, promosHoy]); // eslint-disable-line react-hooks/exhaustive-deps

  const cerrarAviso = () => { setVerAviso(false); try { localStorage.setItem(AVISO, '1'); } catch { /* ok */ } };
  const limpiar = () => setParams(cat === 'para-vos' ? {} : { cat }, { replace: true });

  return (
    <div className="pagina carta">
      <h1 className="titulo-pagina">La carta</h1>

      <div className="busqueda-fila">
        <label className="busqueda">
          <Search size={20} className="naranja" aria-hidden="true" />
          <span className="sr-only">Buscar un plato</span>
          <input type="search" value={q} placeholder="Buscar un plato" onChange={(e) => set('q', e.target.value)} />
        </label>
        <button type="button" className="icono-btn redondo" onClick={() => setFiltrosAbiertos(true)} aria-label={`Filtros${nFiltros ? `, ${nFiltros} activos` : ''}`}>
          <SlidersHorizontal size={20} />
          {nFiltros > 0 && <b className="punto-naranja">{nFiltros}</b>}
        </button>
      </div>

      <nav className="chips-scroll" aria-label="Categorías">
        {CHIPS.map(([id, t]) => (
          <button key={id} type="button" className="chip" aria-pressed={cat === id} onClick={() => set('cat', id === 'para-vos' ? '' : id)}>{t}</button>
        ))}
      </nav>

      {verAviso && (
        <p className="aviso-info">
          <Info size={18} aria-hidden="true" />
          <span>Nuevo: filtrá por vegano y sin TACC desde los filtros.</span>
          <button type="button" className="icono-btn" onClick={cerrarAviso} aria-label="Cerrar aviso"><X size={18} /></button>
        </p>
      )}

      {grupos.length === 0 && (
        <div className="vacio">
          <p>No encontramos platos con esa búsqueda o esos filtros.</p>
          <button type="button" className="btn btn-sec" onClick={limpiar}>Limpiar filtros</button>
        </div>
      )}

      {grupos.map((g) => (
        <section key={g.id} className="bloque" aria-labelledby={`g-${g.id}`}>
          <div className="bloque-cab">
            <h2 id={`g-${g.id}`}>{g.titulo}</h2>
            {g.nota && <span className="nota">{g.nota}</span>}
          </div>
          <ul className="grilla-platos">
            {g.items.map((i) => <PlatoCard key={i.id} item={i} />)}
          </ul>
        </section>
      ))}

      <Panel
        abierto={filtrosAbiertos}
        onCerrar={() => setFiltrosAbiertos(false)}
        titulo="Filtros"
        accion={nFiltros > 0 && <button type="button" className="icono-btn naranja" onClick={limpiar} aria-label="Limpiar filtros"><Trash2 size={20} /></button>}
        pie={<button type="button" className="btn btn-primario btn-ancho" onClick={() => setFiltrosAbiertos(false)}>Ver resultados</button>}
      >
        <h3 className="sub">Tipo de plato</h3>
        <div className="chips">
          {TIPOS.map(([k, t]) => (
            <button key={k} type="button" className="chip" aria-pressed={tipos[k]} onClick={() => set(k, tipos[k] ? '' : '1')}>{t}</button>
          ))}
        </div>
        <h3 className="sub">Preferencias</h3>
        <ul className="interruptores">
          {DIETAS.map(([k, t, Icono]) => (
            <li key={k}>
              <label>
                <span className="dieta-icono"><Icono size={18} aria-hidden="true" /></span>
                <span>{t}</span>
                <input type="checkbox" role="switch" checked={dietas[k]} onChange={() => set(PARAM_DIETA[k], dietas[k] ? '' : '1')} />
              </label>
            </li>
          ))}
        </ul>
        <p className="ayuda">Los filtros de dieta aplican a la comida; vinos y tragos se muestran siempre.</p>
      </Panel>
    </div>
  );
}
