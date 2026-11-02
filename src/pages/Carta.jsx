import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import menu from '../data/menu.json';
import { HeroPagina } from '../components/Hero.jsx';
import { FILTROS, Filtros, ListaPlatos } from '../components/CartaLibro.jsx';

// Los filtros viven en la URL (?veg=1&vegano=1&sintacc=1) para poder compartir el link.
const PARAM = { veg: 'veg', vegano: 'vegano', sinTacc: 'sintacc' };

export default function Carta() {
  const [params, setParams] = useSearchParams();
  const filtros = Object.fromEntries(FILTROS.map(([k]) => [k, params.get(PARAM[k]) === '1']));
  useEffect(() => { document.title = 'La carta · Piaceri Argentini'; }, []);
  const cambiar = (k) =>
    setParams((prev) => {
      const sig = new URLSearchParams(prev);
      if (sig.get(PARAM[k]) === '1') sig.delete(PARAM[k]); else sig.set(PARAM[k], '1');
      return sig;
    }, { replace: true });

  return (
    <>
      <HeroPagina ciudad="Piaceri Argentini" titulo="La carta" img="zanahorias" />
      <main id="main" className="contenido ancho">
        <div className="carta-barra">
          <div className="contenedor carta-barra-in">
            <nav className="tabs" aria-label="Secciones de la carta">
              {menu.secciones.map((s) => <a key={s.id} href={`#${s.id}`}>{s.titulo}</a>)}
            </nav>
            <Filtros valor={filtros} onCambio={cambiar} />
          </div>
        </div>
        <div className="seccion">
          <div className="contenedor carta-secciones" aria-live="polite">
            {menu.secciones.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`t-${s.id}`}>
                <div className="pag-der-cab">
                  <h2 className="titulo" id={`t-${s.id}`}>{s.titulo}</h2>
                  <span className="nota">{s.nota}</span>
                </div>
                <ListaPlatos seccion={s} filtros={filtros} />
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
