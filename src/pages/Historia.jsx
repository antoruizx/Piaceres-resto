import { useEffect } from 'react';
import { HeroPagina } from '../components/Hero.jsx';
import { Etiqueta, Foto } from '../components/Base.jsx';

export default function Historia() {
  useEffect(() => { document.title = 'Nuestra historia · Piaceres'; }, []);
  return (
    <>
      <HeroPagina ciudad="Nuestra historia" titulo="La cocina de Sofía" img="pizza-crudo" />
      <main id="main" className="contenido ancho">
        <section className="seccion">
          <div className="contenedor historia-pag">
            <div className="reveal">
              <Etiqueta>Desde el primer día</Etiqueta>
              <p className="parrafo">
                Piaceres nació alrededor de una mesa familiar, donde cocinar siempre fue la forma más sincera de decir
                “te quiero”. Sofía creció entre ollas y sobremesas largas. Cuando decidió formarse como chef, lo hizo con
                una idea clara: que la cocina gourmet tuviera lugar para todos, y que un plato vegetariano pudiera ser tan
                memorable como cualquier otro.
              </p>
              <p className="parrafo">
                En cada paso tuvo a su mamá a su lado: fue su sostén en los días de dudas y la primera en creer en el
                proyecto cuando todavía era solo un sueño. Y cuando llegó el momento de hacerlo realidad, la familia
                entera dijo presente: tíos, tías y primos pusieron manos, tiempo y corazón para abrir las puertas del
                primer local.
              </p>
              <p className="parrafo">
                Hoy Piaceres tiene seis sucursales y sigue siendo lo que fue desde el primer día. En nuestra carta
                conviven carnes nobles y una propuesta vegetariana de autor creada por Sofía, pensada con el mismo
                cuidado y el mismo respeto por el producto. Porque en una buena mesa, nadie se queda afuera.
              </p>
              <blockquote className="cita">
                <p>“Quiero que quien no come carne se siente a la mesa y tenga para elegir, no que se conforme.”</p>
                <footer>Sofía, chef y fundadora</footer>
              </blockquote>
            </div>
            <div className="foto-alta zoom reveal">
              <Foto nombre="tortelli" alt="Tortelli al vino tinto servidos en un plato hondo" sizes="(max-width: 860px) 100vw, 45vw" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
