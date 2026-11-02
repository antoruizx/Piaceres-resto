import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CakeSlice, ChefHat, Flame, GlassWater, Leaf, PartyPopper, Salad, Sandwich, ShoppingBasket, Soup, Wine } from 'lucide-react';
import { Foto, IconosDieta, Logo } from '../components/ui.jsx';
import { SelectorModo } from '../components/Layout.jsx';
import { catalogo, usePedido } from '../state/Pedido.jsx';
import { HERO_IMG, MARCA, wa } from '../config.js';

export const CATEGORIAS = [
  ['antipasti', 'Antipasti', Soup],
  ['livianos', 'Livianos', Sandwich],
  ['pastas', 'Pastas', ChefHat],
  ['parrilla', 'Parrilla', Flame],
  ['huerta', 'Huerta', Salad],
  ['dolci', 'Postres', CakeSlice],
  ['vinos', 'Vinos', Wine],
  ['tragos', 'Tragos', GlassWater],
  ['almacen', 'Almacén', ShoppingBasket],
];

const DESTACADOS = ['lomo', 'zanahorias', 'tortelli', 'tostadas-crudo', 'coles', 'hongos'];

/** Carrusel de promos del día con puntitos, como el "Special offer" de la referencia. */
function Promos() {
  const { promosHoy } = usePedido();
  const ref = useRef(null);
  const [actual, setActual] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setActual(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  if (!promosHoy.length) return null;
  return (
    <section aria-labelledby="promos-tit" className="bloque">
      <div className="bloque-cab">
        <h2 id="promos-tit">Promos de hoy</h2>
      </div>
      <div className="promos" ref={ref}>
        {promosHoy.map((p) => (
          <Link key={p.id} to={`/carta?cat=${p.secciones[0].startsWith('almacen') ? 'almacen' : p.secciones[0]}`} className="promo">
            <Foto nombre={p.img} alt="" sizes="(max-width: 760px) 92vw, 600px" />
            <span className="promo-badge">Promo del día</span>
            <span className="promo-pct">{p.pct}% off</span>
            <span className="promo-txt">
              <strong>{p.titulo}</strong>
              <small>{p.bajada}</small>
            </span>
          </Link>
        ))}
      </div>
      {promosHoy.length > 1 && (
        <div className="puntos" aria-hidden="true">
          {promosHoy.map((p, i) => <span key={p.id} className={i === actual ? 'activo' : ''} />)}
        </div>
      )}
    </section>
  );
}

export default function Inicio() {
  useEffect(() => { document.title = `${MARCA} · Parrilla, pastas y cocina vegetariana en Tucumán`; }, []);
  return (
    <div className="pagina inicio">
      <section className="hero-app">
        <div className="hero-foto"><Foto nombre={HERO_IMG} alt="" sizes="(max-width: 900px) 100vw, 60vw" eager /></div>
        <div className="hero-txt">
          <p className="sobretitulo">Tucumán · desde la primera mesa</p>
          <h1>Sabores argentinos, <span className="naranja">para todos los gustos</span></h1>
          <p>Parrilla a la leña, pastas de autor y una cocina vegetariana al mismo nivel que cualquier otro plato.</p>
          <div className="hero-acciones">
            <Link to="/carta" className="btn btn-primario btn-grande">Hacé tu pedido <ArrowRight size={20} aria-hidden="true" /></Link>
            <a href={wa('Hola, quiero reservar una mesa.')} target="_blank" rel="noopener noreferrer" className="btn btn-sec btn-grande">Reservar mesa</a>
          </div>
        </div>
      </section>

      <SelectorModo />
      <Promos />

      <section className="bloque" aria-labelledby="cat-tit">
        <div className="bloque-cab"><h2 id="cat-tit">¿Qué tenés ganas de comer?</h2></div>
        <ul className="categorias">
          {CATEGORIAS.map(([id, t, Icono]) => (
            <li key={id}>
              <Link to={`/carta?cat=${id}`}><span><Icono size={24} aria-hidden="true" /></span>{t}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bloque" aria-labelledby="pop-tit">
        <div className="bloque-cab">
          <h2 id="pop-tit">Lo más pedido</h2>
          <Link to="/carta" className="link-naranja">Ver carta <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <ul className="fila-scroll">
          {DESTACADOS.map((id) => {
            const p = catalogo.porId.get(id);
            return (
              <li key={id}>
                <Link to={`/carta/${id}`} className="mini-plato">
                  <span className="mini-foto"><Foto nombre={p.img} alt={p.nombre} sizes="200px" /></span>
                  <IconosDieta item={p} />
                  <strong>{p.nombre}</strong>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="tarjeta-evento" aria-labelledby="ev-tit">
        <PartyPopper size={28} className="naranja" aria-hidden="true" />
        <div>
          <h2 id="ev-tit">Festejá con nosotros</h2>
          <p>10% de descuento en la cuenta, entradas y una torta mediana de regalo para tus invitados.</p>
        </div>
        <a href={wa('Hola, quiero consultar por un evento.')} target="_blank" rel="noopener noreferrer" className="btn btn-primario">Consultar</a>
      </section>

      <div className="dos-columnas">
        <Link to="/historia" className="tarjeta-foto-txt">
          <Foto nombre="pizza-crudo" alt="" sizes="(max-width: 760px) 100vw, 50vw" />
          <span>
            <small>Nuestra historia</small>
            <strong>La cocina de Sofía</strong>
            <em>Una mesa familiar en Tucumán que hoy tiene seis casas <ArrowRight size={16} aria-hidden="true" /></em>
          </span>
        </Link>
        <Link to="/carta?cat=almacen" className="tarjeta-foto-txt">
          <Foto nombre="tortelli" alt="" sizes="(max-width: 760px) 100vw, 50vw" />
          <span>
            <small>Almacén</small>
            <strong>Pastas frescas para llevar</strong>
            <em>Salsas listas y quesos para cocinar en casa <ArrowRight size={16} aria-hidden="true" /></em>
          </span>
        </Link>
      </div>

      <section className="bloque marca-bloque">
        <Logo />
        <p><Leaf size={16} aria-hidden="true" className="naranja" /> Opciones vegetarianas, veganas y sin TACC en toda la carta.</p>
      </section>
    </div>
  );
}
