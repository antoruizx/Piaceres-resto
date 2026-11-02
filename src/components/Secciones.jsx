import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import menu from '../data/menu.json';
import { Etiqueta, Flecha, FlechaIzq, Foto, ListaNum } from './Base.jsx';
import { wa } from '../config.js';

const plato = (id) => menu.secciones.flatMap((s) => s.items).find((i) => i.id === id);

/* 4.2 Sobre el restaurante */
export function Restaurante() {
  return (
    <section className="seccion" id="restaurante" aria-labelledby="rest-tit">
      <div className="contenedor restaurante">
        <div className="reveal">
          <Etiqueta>Sobre el restaurante</Etiqueta>
          <h2 className="titulo" id="rest-tit">Piaceres — una mesa para todos los gustos</h2>
          <p className="parrafo">
            Un lugar para comer sin apuro: cortes a la leña, pastas frescas hechas cada mañana y una carta vegetariana
            pensada con la misma técnica y el mismo producto.
          </p>
          <p className="parrafo">Para una cena de a dos, una mesa larga con amigos o una copa de vino al final del día.</p>
          <div className="chips">
            <span className="chip">Parrilla a la leña</span>
            <span className="chip">Cocina vegetariana de autor</span>
          </div>
        </div>
        <div className="zoom foto-centro reveal">
          <Foto nombre="pizza-burrata" alt="Pizza de masa madre con salsa de tomate, albahaca y burrata entera en el centro" sizes="(max-width: 760px) 100vw, 30vw" />
        </div>
        <div className="lista-wrap reveal">
          <ListaNum
            items={[
              'Parrilla, pastas y huerta',
              'Mediodía y noche, todos los días',
              'Entrada de cortesía de la casa',
              'Carta vegetariana completa',
              'Delivery propio en seis zonas',
              'Vinos argentinos por copa',
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/* 4.3 La carta (intro) */
export function CartaIntro() {
  const accesos = [
    ['Carta completa', '/carta'],
    ['Cocina vegetariana de Sofía', '/carta?veg=1'],
    ['Vinos y tragos', '/#vinos'],
    ['Menú de fiestas', '/#eventos'],
  ];
  return (
    <section className="seccion" id="carta" aria-labelledby="carta-tit">
      <div className="contenedor carta-intro">
        <div className="reveal">
          <Etiqueta>La carta</Etiqueta>
          <h2 className="titulo" id="carta-tit">Una cocina contemporánea, con carne o sin ella</h2>
          <p className="parrafo">
            Cortes nobles a la leña, pastas que se estiran cada mañana y una huerta trabajada con la misma técnica.
            Los platos vegetarianos comparten carta, lugar y cuidado con todos los demás: elegís por lo que te tienta.
          </p>
          <ul className="accesos">
            {accesos.map(([t, h]) => (
              <li key={t}><Link to={h}>{t}<Flecha /></Link></li>
            ))}
          </ul>
        </div>
        <div className="zoom foto-grande reveal">
          <Foto nombre="zanahorias" alt="Zanahorias glaseadas enteras sobre labneh, con hierbas frescas y aceite de oliva" sizes="(max-width: 860px) 100vw, 50vw" />
        </div>
      </div>
    </section>
  );
}

/* 4.5 Recomendaciones de Sofía */
const RECOMENDADOS = ['zanahorias', 'lomo', 'tortelli', 'tostadas-crudo', 'coles', 'salmon', 'hongos'];
const ALT = {
  zanahorias: 'Zanahorias glaseadas sobre labneh',
  lomo: 'Medallón de lomo grillado sobre puré de papas con tomates asados',
  tortelli: 'Tortelli al vino tinto en un plato hondo',
  'tostadas-crudo': 'Tostadas de masa madre con jamón crudo, pera y queso crema',
  coles: 'Coles de Bruselas caramelizadas con nueces',
  salmon: 'Tostadas de salmón ahumado con queso crema y hojas verdes',
  hongos: 'Champiñones rellenos gratinados con hierbas',
  bruschettas: 'Bruschettas con tomates cherry confitados, ricota y albahaca',
  'rosas-papa': 'Rosas de papa crocantes con alioli',
};

export function Recomendaciones() {
  const ref = useRef(null);
  const [lim, setLim] = useState({ ini: true, fin: false });
  const actualizar = () => {
    const el = ref.current;
    if (!el) return;
    setLim({ ini: el.scrollLeft < 8, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(() => {
    actualizar();
    window.addEventListener('resize', actualizar);
    return () => window.removeEventListener('resize', actualizar);
  }, []);
  const mover = (dir) => {
    const el = ref.current;
    const card = el.querySelector('.tarjeta');
    const paso = card ? card.getBoundingClientRect().width + 28 : el.clientWidth;
    el.scrollBy({ left: dir * paso, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  return (
    <section className="seccion" aria-labelledby="reco-tit">
      <div className="contenedor">
        <div className="carrusel-cab reveal">
          <div>
            <Etiqueta>Elegidos de la chef</Etiqueta>
            <h2 className="titulo" id="reco-tit">Recomendaciones de Sofía</h2>
          </div>
          <div className="flechas">
            <button type="button" className="flecha-btn" onClick={() => mover(-1)} disabled={lim.ini} aria-label="Ver platos anteriores"><FlechaIzq /></button>
            <button type="button" className="flecha-btn" onClick={() => mover(1)} disabled={lim.fin} aria-label="Ver más platos"><Flecha w={28} /></button>
          </div>
        </div>
        <ul className="carrusel reveal" ref={ref} onScroll={actualizar}>
          {RECOMENDADOS.map((id) => {
            const p = plato(id);
            return (
              <li className="tarjeta" key={id}>
                <div className="tarjeta-foto zoom">
                  <Foto nombre={p.img} alt={ALT[id]} sizes="(max-width: 760px) 84vw, (max-width: 1080px) 46vw, 380px" />
                  {p.veg && <span className="tag">Vegetariano</span>}
                </div>
                <h3>{p.nombre}</h3>
                <p>{p.desc}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* 4.6 Antipasti */
export function Antipasti() {
  const ids = ['tostadas-crudo', 'bruschettas', 'hongos', 'rosas-papa'];
  return (
    <section className="seccion" aria-labelledby="anti-tit">
      <div className="contenedor antipasti">
        <div className="reveal">
          <Etiqueta>Para empezar</Etiqueta>
          <h2 className="titulo" id="anti-tit">Antipasti</h2>
          <div className="cortesia">
            <p className="cortesia-tit">Cortesía de la casa</p>
            <p>Focaccia tibia, manteca de hierbas y aceite de oliva</p>
          </div>
        </div>
        <ul className="entradas reveal">
          {ids.map((id) => {
            const p = plato(id);
            return (
              <li key={id}>
                <div className="mini zoom"><Foto nombre={p.img} alt={ALT[id]} sizes="96px" /></div>
                <div>
                  <h3>{p.nombre.replace(' confitado', '')}</h3>
                  <p>{p.desc}</p>
                  {p.veg && <span className="tag" style={{ marginTop: 8 }}>Vegetariano</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* 4.7 Ocasiones especiales */
export function Ocasiones() {
  const caja = useRef(null);
  const img = useRef(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (!caja.current || !img.current) return;
      const r = caja.current.getBoundingClientRect();
      const max = r.height * 0.14; // la foto mide 130%: no moverla más del margen que sobra
      const d = Math.max(-max, Math.min(max, (r.top + r.height / 2 - innerHeight / 2) * -0.12));
      const foto = img.current.querySelector('img');
      if (foto) foto.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    addEventListener('scroll', onScroll, { passive: true });
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section className="ocasiones-sec" id="eventos" aria-labelledby="oca-tit">
      <div className="contenedor">
        <div className="depth reveal" ref={caja}>
          <div className="depth-in">
            <div className="depth-foto" ref={img}>
              <Foto nombre="tostadas-crudo" alt="Tostadas con jamón crudo y pera para compartir" sizes="(max-width: 860px) 100vw, 540px" />
            </div>
            <div className="depth-txt">
              <Etiqueta clara>Eventos</Etiqueta>
              <h2 className="titulo" id="oca-tit">Para tus ocasiones especiales</h2>
              <p className="parrafo">
                Aniversarios, cumpleaños o la cena de fin de año: armamos un menú de pasos en versión clásica y
                vegetariana, con maridaje y brindis de la casa.
              </p>
              <p className="parrafo">En diciembre, menú de fiestas con cupos limitados por sucursal.</p>
              <a className="btn btn-primario" href={wa('Hola, quiero consultar fechas para un evento.')} target="_blank" rel="noopener noreferrer">
                Consultar fechas <Flecha w={28} />
              </a>
            </div>
          </div>
          <div className="shine" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

/* 4.8 Vinos y tragos */
const BEBIDAS = [
  ['Tintos', [['Malbec de altura', 'Valle de Uco'], ['Cabernet Franc', 'Gualtallary'], ['Pinot Noir', 'Patagonia']]],
  ['Blancos y espumantes', [['Torrontés', 'Cafayate'], ['Chardonnay', 'Tupungato'], ['Espumante Brut Nature', 'Método tradicional']]],
  ['Tragos de autor', [['Negroni de la casa'], ['Spritz de pomelo'], ['Gin tonic de pepino']]],
  ['Sin alcohol', [['Albahaca y limón'], ['Frutos rojos'], ['Vermut sin alcohol']]],
];
export function Vinos() {
  return (
    <section className="seccion" id="vinos" aria-labelledby="vinos-tit">
      <div className="contenedor">
        <div className="vinos-cab reveal">
          <div>
            <Etiqueta>Bodega y barra</Etiqueta>
            <h2 className="titulo" id="vinos-tit">Vinos y tragos</h2>
          </div>
          <p className="parrafo">Etiquetas argentinas por copa o por botella, y una barra con tragos de autor y opciones sin alcohol.</p>
        </div>
        <div className="vinos reveal">
          {BEBIDAS.map(([t, items]) => (
            <div key={t}>
              <h3>{t}</h3>
              <ul>
                {items.map(([n, o]) => <li key={n}>{n}{o && <small>{o}</small>}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 4.9 Historia (resumen) */
export function HistoriaResumen() {
  return (
    <section className="seccion" id="sofia" aria-labelledby="sofia-tit">
      <div className="contenedor">
        <div className="historia reveal">
          <div className="historia-txt">
            <Etiqueta>Nuestra historia</Etiqueta>
            <h2 className="titulo" id="sofia-tit">La cocina de Sofía</h2>
            <p className="parrafo">
              Sofía se formó como chef con una idea clara: que la cocina gourmet tenga lugar para todos. Con el apoyo
              incondicional de su mamá y la ayuda de tíos y primos abrió el primer local. Hoy Piaceres tiene seis
              casas y la misma convicción de siempre.
            </p>
            <Link className="link-linea" to="/historia">Leer la historia completa <Flecha w={28} /></Link>
          </div>
          <div className="historia-foto zoom">
            <Foto nombre="pizza-crudo" alt="Pizza a la leña con jamón crudo junto a una copa de vino tinto" sizes="(max-width: 860px) 100vw, 45vw" />
          </div>
        </div>
      </div>
    </section>
  );
}
