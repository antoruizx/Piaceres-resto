// Páginas simples: historia, sucursales, resultado del pago, modo mesa (QR) y 404.
import { useEffect } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, XCircle } from 'lucide-react';
import { Foto } from '../components/ui.jsx';
import { ListaSucursales } from '../components/Layout.jsx';
import { sucursales, usePedido } from '../state/Pedido.jsx';
import { pesos } from '../lib/pedido.js';
import { MARCA, wa } from '../config.js';

export function Historia() {
  useEffect(() => { document.title = `Nuestra historia · ${MARCA}`; }, []);
  return (
    <article className="pagina historia">
      <div className="historia-hero">
        <Foto nombre="pizza-crudo" alt="Pizza a la leña con jamón crudo y una copa de vino tinto" sizes="(max-width: 900px) 100vw, 1100px" eager />
        <div>
          <p className="sobretitulo">Nuestra historia</p>
          <h1>La cocina de Sofía</h1>
        </div>
      </div>
      <div className="historia-txt">
        <p>
          {MARCA} nació alrededor de una mesa familiar en Tucumán, donde cocinar siempre fue la forma más sincera de
          decir “te quiero”. Sofía creció entre ollas y sobremesas largas. Cuando decidió formarse como chef, lo hizo con
          una idea clara: que la cocina gourmet tuviera lugar para todos, y que un plato vegetariano pudiera ser tan
          memorable como cualquier otro.
        </p>
        <p>
          En cada paso tuvo a su mamá a su lado: fue su sostén en los días de dudas y la primera en creer en el proyecto
          cuando todavía era solo un sueño. Y cuando llegó el momento de hacerlo realidad, la familia entera dijo
          presente: tíos, tías y primos pusieron manos, tiempo y corazón para abrir las puertas del primer local.
        </p>
        <p>
          Hoy {MARCA} tiene seis casas y sigue siendo lo que fue desde el primer día. En nuestra carta conviven carnes
          nobles y una propuesta vegetariana de autor creada por Sofía, pensada con el mismo cuidado y el mismo respeto
          por el producto. Porque en una buena mesa, nadie se queda afuera.
        </p>
        <blockquote>
          <p>“Quiero que quien no come carne se siente a la mesa y tenga para elegir, no que se conforme.”</p>
          <footer>Sofía, chef y fundadora</footer>
        </blockquote>
        <Link to="/carta" className="btn btn-primario btn-grande">Hacé tu pedido</Link>
      </div>
    </article>
  );
}

export function Sucursales() {
  const p = usePedido();
  const s = sucursales.find((x) => x.id === p.sucursal);
  useEffect(() => { document.title = `Sucursales · ${MARCA}`; }, []);
  return (
    <div className="pagina sucursales">
      <h1 className="titulo-pagina">Sucursales</h1>
      <div className="suc-grid">
        <ListaSucursales elegida={p.sucursal} onElegir={(id) => p.setOpciones({ sucursal: id })} />
        <section className="suc-card" aria-live="polite">
          <MapPin size={28} className="naranja" aria-hidden="true" />
          <h2>{s.nombre}</h2>
          <dl className="totales">
            <div><dt>Dirección</dt><dd>{s.direccion || '[DIRECCIÓN]'}</dd></div>
            <div><dt>Horario</dt><dd>{s.horario}</dd></div>
            <div><dt>Delivery</dt><dd>{s.deliveryMin} min · {pesos(s.costoEnvio)}</dd></div>
            <div><dt>Envío sin cargo</dt><dd>desde {pesos(s.envioGratisDesde)}</dd></div>
          </dl>
          <div className="botones">
            <Link to="/carta" className="btn btn-primario">Pedir desde acá</Link>
            <a href={wa(`Hola, quiero reservar una mesa en ${s.nombre}.`)} target="_blank" rel="noopener noreferrer" className="btn btn-sec">Reservar mesa</a>
          </div>
        </section>
      </div>
    </div>
  );
}

const RESULTADOS = {
  exito: [CheckCircle2, '¡Pago aprobado!', 'Recibimos tu pedido. La sucursal ya lo está preparando.'],
  pendiente: [Clock, 'Pago pendiente', 'Mercado Pago está procesando el pago. Te avisamos apenas se acredite.'],
  error: [XCircle, 'No se pudo completar el pago', 'No se hizo ningún cobro. Podés intentar de nuevo o pagar al recibir.'],
};

export function Resultado() {
  const { estado } = useParams();
  const [params] = useSearchParams();
  const p = usePedido();
  const dato = RESULTADOS[estado];
  const ok = estado === 'exito';
  useEffect(() => { if (ok) p.vaciar(); }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!dato) return <Navigate to="/" replace />;
  const [Icono, titulo, txt] = dato;
  const ref = params.get('external_reference');
  return (
    <div className={`pagina resultado resultado-${estado}`}>
      <Icono size={64} aria-hidden="true" />
      <h1>{titulo}</h1>
      <p>{txt}</p>
      {ref && <p className="ayuda">Número de pedido: {ref.slice(0, 8).toUpperCase()}</p>}
      <div className="botones">
        {ok ? <Link to="/" className="btn btn-primario">Volver al inicio</Link> : <Link to="/pedido" className="btn btn-primario">Volver al pedido</Link>}
        <a href={wa('Hola, tengo una consulta sobre mi pedido.')} target="_blank" rel="noopener noreferrer" className="btn btn-sec">Escribinos</a>
      </div>
    </div>
  );
}

/** QR de mesa: /mesa?sucursal=centro&mesa=12 → modo salón y directo a la carta. */
export function Mesa() {
  const [params] = useSearchParams();
  const p = usePedido();
  const suc = sucursales.find((s) => s.id === params.get('sucursal'));
  const mesa = (params.get('mesa') || '').slice(0, 10);
  useEffect(() => {
    if (suc && mesa) p.setOpciones({ modo: 'salon', sucursal: suc.id, mesa });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <Navigate to="/carta" replace />;
}

export function NoEncontrado() {
  return (
    <div className="pagina vacio">
      <h1 className="titulo-pagina">Página no encontrada</h1>
      <p>La página que buscás no existe o cambió de lugar.</p>
      <Link to="/" className="btn btn-primario">Volver al inicio</Link>
    </div>
  );
}
