import { useEffect, useRef, useState } from 'react';
import menu from '../data/menu.json';
import { Etiqueta, Monograma } from './Base.jsx';
import { precioTxt } from '../config.js';

export const VACIO_VEG = 'Esta sección no tiene platos vegetarianos. Te esperamos en Huerta, Pastas y Antipasti.';

// Aplica el filtro "Solo vegetariano" (solo afecta a las secciones de comida).
export const filtrar = (sec, soloVeg) => (soloVeg && sec.comida ? sec.items.filter((i) => i.veg) : sec.items);

export function ListaPlatos({ seccion, soloVeg }) {
  const items = filtrar(seccion, soloVeg);
  if (!items.length) return <p className="vacio">{VACIO_VEG}</p>;
  return (
    <ul className="platos">
      {items.map((p) => {
        const ph = p.precio === null || p.precio === undefined;
        return (
          <li key={p.id}>
            <h4 className="plato-nombre">
              {p.nombre}
              {p.veg && seccion.comida && <span className="tag">Vegetariano</span>}
              {p.cortesia && <span className="tag tag-cortesia">Cortesía</span>}
            </h4>
            <p className="plato-desc">{p.desc}</p>
            <span className={`plato-precio${ph ? ' ph' : ''}`}>{precioTxt(p.precio)}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function BotonVeg({ activo, onClick }) {
  return (
    <button type="button" className="btn-veg" aria-pressed={activo} onClick={onClick}>
      Solo vegetariano
    </button>
  );
}

export default function CartaLibro() {
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(menu.secciones[0].id);
  const [soloVeg, setSoloVeg] = useState(false);
  const tapaRef = useRef(null);
  const libroRef = useRef(null);
  const tituloRef = useRef(null);
  const derRef = useRef(null);
  const seccion = menu.secciones.find((s) => s.id === activa);

  // El libro abierto no es navegable con teclado mientras está cerrado (y viceversa con la tapa).
  useEffect(() => {
    if (libroRef.current) libroRef.current.inert = !abierto;
    if (tapaRef.current) tapaRef.current.inert = abierto;
    if (abierto) {
      const t = setTimeout(() => tituloRef.current?.focus({ preventScroll: true }), 500);
      return () => clearTimeout(t);
    }
  }, [abierto]);

  const elegir = (id) => {
    setActiva(id);
    if (derRef.current) derRef.current.scrollTop = 0;
  };
  const cerrar = () => {
    setAbierto(false);
    setTimeout(() => tapaRef.current?.focus({ preventScroll: true }), 50);
  };

  return (
    <section className="seccion libro-sec" id="carta-libro" aria-labelledby="carta-libro-tit">
      <div className="contenedor">
        <div className="libro-cab reveal">
          <Etiqueta>La carta en la mesa</Etiqueta>
          <h2 className="titulo" id="carta-libro-tit">Abrí la carta</h2>
        </div>

        <div className={`libro${abierto ? ' abierto' : ''}`}>
          <button ref={tapaRef} type="button" className="tapa" onClick={() => setAbierto(true)} aria-label="Abrir la carta">
            <span className="tapa-marco" />
            <span className="tapa-int">
              <Monograma alto={86} />
              <span className="tapa-titulo">CARTA</span>
              <span className="tapa-linea" />
              <span className="tapa-txt">Parrilla · Pastas · Huerta<span>Tocá para abrir</span></span>
            </span>
          </button>

          <div ref={libroRef} className="libro-abierto">
            <div className="pag-izq">
              <div className="pag-izq-cab"><Monograma alto={40} /><span>CARTA</span></div>
              <ol className="indice" aria-label="Secciones de la carta">
                {menu.secciones.map((s, i) => (
                  <li key={s.id}>
                    <button type="button" aria-current={s.id === activa} onClick={() => elegir(s.id)}>
                      <span className="num">/{String(i + 1).padStart(2, '0')}</span>{s.titulo}
                    </button>
                  </li>
                ))}
              </ol>
              <div className="pag-izq-pie">
                <BotonVeg activo={soloVeg} onClick={() => setSoloVeg(!soloVeg)} />
                <button type="button" className="link-linea" onClick={cerrar}>Cerrar la carta</button>
              </div>
            </div>

            <div className="pag-der" ref={derRef}>
              <div className="pag-der-cab" ref={tituloRef} tabIndex={-1}>
                <h3>{seccion.titulo}</h3>
                <span className="nota">{seccion.nota}</span>
              </div>
              <div aria-live="polite">
                <ListaPlatos seccion={seccion} soloVeg={soloVeg} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
