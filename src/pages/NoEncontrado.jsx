import { Link } from 'react-router-dom';
import { HeroPagina } from '../components/Hero.jsx';

export default function NoEncontrado() {
  return (
    <>
      <HeroPagina ciudad="Error 404" titulo="Página no encontrada" />
      <main id="main" className="contenido ancho">
        <section className="seccion">
          <div className="contenedor">
            <p className="parrafo">La página que buscás no existe o cambió de lugar.</p>
            <div className="botones" style={{ marginTop: 28 }}>
              <Link className="btn btn-primario" to="/">Volver al inicio</Link>
              <Link className="btn btn-sec" to="/carta">Ver la carta</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
