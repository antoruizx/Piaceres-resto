// Piezas chicas reutilizables: íconos de línea, monograma, foto optimizada, etiqueta y lista numerada.

const linea = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Flecha = ({ w = 40 }) => (
  <svg width={w} height="12" viewBox={`0 0 ${w} 12`} aria-hidden="true" {...linea}>
    <path d={`M0 6h${w - 1}M${w - 7} 1l6 5-6 5`} />
  </svg>
);
export const FlechaIzq = ({ w = 28 }) => (
  <svg width={w} height="12" viewBox={`0 0 ${w} 12`} aria-hidden="true" {...linea}>
    <path d={`M${w} 6H1M7 1L1 6l6 5`} />
  </svg>
);
export const Campana = () => (
  <svg width="34" height="26" viewBox="0 0 34 26" aria-hidden="true" {...linea}>
    <path d="M3 21a14 14 0 0 1 28 0M1 21h32M17 7V4M14 4h6M5 24h24" />
  </svg>
);
export const Telefono = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" {...linea}>
    <path d="M5.5 1.5H3A1.5 1.5 0 0 0 1.5 3c0 6.4 5.1 11.5 11.5 11.5A1.5 1.5 0 0 0 14.5 13v-2.5l-3-1-1.5 1.5a8 8 0 0 1-4-4L7.5 5.5l-1-3z" />
  </svg>
);
export const Pin = () => (
  <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true" {...linea}>
    <path d="M7 17s6-5.6 6-10A6 6 0 0 0 1 7c0 4.4 6 10 6 10z" /><circle cx="7" cy="7" r="2" />
  </svg>
);
export const IconoMenu = ({ abierto }) => (
  <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true" {...linea}>
    {abierto ? <path d="M3 1l14 12M17 1L3 13" /> : <path d="M0 1h20M0 7h20M0 13h20" />}
  </svg>
);

export const Monograma = ({ alto = 44 }) => (
  <svg width={alto * 0.72} height={alto} viewBox="0 0 36 50" aria-hidden="true">
    <ellipse cx="18" cy="25" rx="16.5" ry="23.5" fill="none" stroke="currentColor" strokeWidth=".9" />
    <text x="18" y="33" textAnchor="middle" fontFamily="Forum, Georgia, serif" fontSize="25" fill="currentColor">P</text>
  </svg>
);

const ANCHOS = [480, 960, 1600];
export function Foto({ nombre, alt, sizes = '(max-width: 760px) 100vw, 40vw', eager = false, className = '' }) {
  return (
    <img
      className={className}
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

export const Etiqueta = ({ children, clara }) => <p className={`etiqueta${clara ? ' clara' : ''}`}>{children}</p>;

export const ListaNum = ({ items }) => (
  <ol className="lista-num">
    {items.map((t, i) => (
      <li key={i}><span className="num">/{String(i + 1).padStart(2, '0')}</span><span>{t}</span></li>
    ))}
  </ol>
);
