// Piezas de interfaz reutilizables: logo, foto, íconos de dieta, panel deslizante y selector de cantidad.
import { useEffect, useRef } from 'react';
import { Leaf, Minus, Plus, Sprout, WheatOff, X } from 'lucide-react';

/** Logo: cubiertos blancos sobre un cuadrado naranja + "Piaceres Argentinos". */
export function Logo({ compacto = false }) {
  return (
    <span className="logo">
      <span className="logo-icono" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* tenedor */}
          <path d="M9 4v8a3 3 0 0 0 6 0V4M12 4v24" />
          {/* cuchillo */}
          <path d="M22 28V4c-2.5 2-4 5.5-4 10 0 2 1 3 2.5 3H22" />
        </svg>
      </span>
      {!compacto && (
        <span className="logo-txt">
          Piaceres<small>argentinos</small>
        </span>
      )}
    </span>
  );
}

const ANCHOS = [480, 960, 1600];
// Encuadre por foto cuando el plato no está en el centro (ej. foto vertical con el plato abajo).
const ENCUADRE = { panqueques: 'center 80%' };

export function Foto({ nombre, alt, sizes = '(max-width: 760px) 50vw, 25vw', eager = false, className = '' }) {
  if (!nombre) return <span className={`foto-vacia ${className}`} aria-hidden="true" />;
  return (
    <img
      className={className}
      style={ENCUADRE[nombre] ? { objectPosition: ENCUADRE[nombre] } : undefined}
      src={`/img/${nombre}-960.webp`}
      srcSet={ANCHOS.map((w) => `/img/${nombre}-${w}.webp ${w}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchpriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );
}

export const DIETAS = [
  ['veg', 'Vegetariano', Leaf],
  ['vegano', 'Vegano', Sprout],
  ['sinTacc', 'Sin TACC', WheatOff],
];

/** Íconos redondos de dieta (como "Spicy / Milk / Fish" de la referencia). */
export function IconosDieta({ item, conTexto = false }) {
  const lista = DIETAS.filter(([k]) => item[k] && !(k === 'veg' && item.vegano));
  if (!lista.length) return null;
  return (
    <ul className={`dietas${conTexto ? ' con-texto' : ''}`}>
      {lista.map(([k, t, Icono]) => (
        <li key={k} title={t}>
          <span className="dieta-icono"><Icono size={conTexto ? 20 : 14} aria-hidden="true" /></span>
          {conTexto ? <span>{t}</span> : <span className="sr-only">{t}</span>}
        </li>
      ))}
    </ul>
  );
}

/** Panel que sube desde abajo (celular) o entra por la derecha (escritorio). */
export function Panel({ abierto, onCerrar, titulo, children, pie, lado = 'abajo', accion }) {
  const ref = useRef(null);
  const cerrarRef = useRef(onCerrar);
  cerrarRef.current = onCerrar;
  // Solo depende de "abierto": así no le roba el foco a un campo cada vez que la pantalla se actualiza.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement;
    const tecla = (e) => e.key === 'Escape' && cerrarRef.current();
    document.addEventListener('keydown', tecla);
    document.body.classList.add('sin-scroll');
    setTimeout(() => ref.current?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', tecla);
      document.body.classList.remove('sin-scroll');
      previo?.focus?.();
    };
  }, [abierto]);
  if (!abierto) return null;
  return (
    <div className="panel-fondo" onClick={onCerrar}>
      <div
        className={`panel panel-${lado}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="panel-asa" aria-hidden="true" />
        <header className="panel-cab">
          <button type="button" className="icono-btn" onClick={onCerrar} aria-label="Cerrar"><X size={22} /></button>
          <h2>{titulo}</h2>
          <span className="panel-accion">{accion}</span>
        </header>
        <div className="panel-cuerpo">{children}</div>
        {pie && <footer className="panel-pie">{pie}</footer>}
      </div>
    </div>
  );
}

export function Cantidad({ valor, onCambio, min = 0, etiqueta }) {
  return (
    <div className="cantidad" role="group" aria-label={etiqueta}>
      <button type="button" onClick={() => onCambio(valor - 1)} disabled={valor <= min} aria-label="Quitar uno"><Minus size={16} /></button>
      <output aria-live="polite">{valor}</output>
      <button type="button" onClick={() => onCambio(valor + 1)} disabled={valor >= 20} aria-label="Agregar uno"><Plus size={16} /></button>
    </div>
  );
}
