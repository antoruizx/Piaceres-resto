import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Campana, Flecha, Foto, IconoMenu, LogoTexto, Monograma, Pin, Telefono } from './Base.jsx';
import { DIRECCION, HERO_IMG, TELEFONO, TEL_HREF, wa } from '../config.js';

export const NAV = [
  ['El restaurante', '/#restaurante'],
  ['La carta', '/#carta'],
  ['Pastas frescas', '/#pastas-frescas'],
  ['Cocina de Sofía', '/#sofia'],
  ['Vinos y tragos', '/#vinos'],
  ['Eventos', '/#eventos'],
  ['Sucursales', '/#sucursales'],
];

function Cabecera() {
  const [abierto, setAbierto] = useState(false);
  return (
    <header className="cabecera">
      <div className="barra">
        <div className="barra-dir"><Pin />{DIRECCION}, Cancún</div>
        <div className="barra-logo">
          <Link to="/" className="logo" aria-label="Piaceri Argentini, ir al inicio">
            <Monograma /><LogoTexto />
          </Link>
        </div>
        <div className="barra-der">
          <a className="barra-tel" href={TEL_HREF} aria-label={`Llamar al ${TELEFONO}`}><Telefono /><span>{TELEFONO}</span></a>
          <a className="btn btn-claro" href={wa('Hola, quiero reservar una mesa.')} target="_blank" rel="noopener noreferrer">Reservar</a>
          <button className="btn-menu" type="button" aria-expanded={abierto} aria-controls="nav-principal" onClick={() => setAbierto(!abierto)}>
            <IconoMenu abierto={abierto} /><span className="sr-only">{abierto ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
        </div>
      </div>
      <nav id="nav-principal" className={`nav${abierto ? ' abierto' : ''}`} aria-label="Principal">
        <ul>
          {NAV.map(([t, h]) => (
            <li key={h}><Link to={h} onClick={() => setAbierto(false)}>{t}</Link></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

// Spotlight violeta que sigue al mouse o al dedo.
const mover = (e) => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
  el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
};
const salir = (e) => {
  e.currentTarget.style.setProperty('--mx', '68%');
  e.currentTarget.style.setProperty('--my', '42%');
};

function Capas({ img }) {
  return (
    <>
      <div className="layer ken"><Foto nombre={img} alt="" sizes="100vw" eager /></div>
      <div className="layer veil" />
      <div className="layer vignette" />
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />
      <div className="layer spot" />
    </>
  );
}

const PROMO = '10% de descuento en la cuenta, entradas y una torta mediana de regalo para tus invitados';

// Cinta que pasa de derecha a izquierda. El texto se repite para que el loop no tenga cortes;
// los lectores de pantalla leen solo la primera copia.
function Cinta() {
  const items = Array.from({ length: 4 }, (_, i) => (
    <span className="cinta-item" key={i} aria-hidden={i > 0 ? 'true' : undefined}>
      {PROMO}
      <svg className="cinta-sep" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0l5 5-5 5-5-5z" fill="currentColor" /></svg>
    </span>
  ));
  return (
    <div className="cinta" role="note" aria-label="Promoción">
      <div className="cinta-pista">{items}{items}</div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero hero-full" onPointerMove={mover} onPointerLeave={salir} aria-label="Bienvenida">
      <Capas img={HERO_IMG} />
      <Cabecera />
      <div className="hero-pie">
        <div>
          <p className="hero-ciudad entra" style={{ '--i': 0 }}>Caribe mexicano</p>
          <h1 className="hero-titulo entra" style={{ '--i': 1 }}>Piaceri <span>Argentini</span></h1>
          <p className="hero-bajada entra" style={{ '--i': 2 }}>
            Parrilla argentina a la leña, pastas de autor y una cocina vegetariana al mismo nivel que cualquier otro plato. Frente al mar Caribe.
          </p>
          <div className="entra" style={{ '--i': 3 }}>
            <a className="btn btn-primario" href={wa('Hola, quiero reservar una mesa.')} target="_blank" rel="noopener noreferrer">
              Reservar mesa <Flecha w={28} />
            </a>
          </div>
        </div>
        <a className="btn-delivery entra" style={{ '--i': 4 }} href={wa('Hola, quiero hacer un pedido a domicilio.')} target="_blank" rel="noopener noreferrer">
          <Campana /><span>Pedir<br />delivery</span>
        </a>
      </div>
      <Cinta />
    </section>
  );
}

export function HeroPagina({ ciudad = 'Piaceri Argentini', titulo, img = HERO_IMG }) {
  return (
    <section className="hero hero-compacto ancho" onPointerMove={mover} onPointerLeave={salir}>
      <Capas img={img} />
      <Cabecera />
      <div className="hero-pie">
        <div>
          <p className="hero-ciudad entra" style={{ '--i': 0 }}>{ciudad}</p>
          <h1 className="hero-titulo entra" style={{ '--i': 1 }}>{titulo}</h1>
        </div>
      </div>
    </section>
  );
}
