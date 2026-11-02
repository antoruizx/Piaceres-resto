import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgePercent, X } from 'lucide-react';
import { Cantidad, Foto, IconosDieta } from '../components/ui.jsx';
import { catalogo, usePedido } from '../state/Pedido.jsx';
import { descuentoPara, pesos, precioConDescuento, sePuedePedir } from '../lib/pedido.js';
import { MARCA } from '../config.js';

export default function Plato() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { agregar, promosHoy } = usePedido();
  const item = catalogo.porId.get(id);
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState('');
  useEffect(() => { document.title = `${item?.nombre ?? 'Plato'} · ${MARCA}`; }, [item]);

  if (!item) {
    return (
      <div className="pagina vacio">
        <p>No encontramos ese plato.</p>
        <Link className="btn btn-primario" to="/carta">Volver a la carta</Link>
      </div>
    );
  }

  const seccion = catalogo.secciones.find((s) => s.id === item.seccion);
  const promo = promosHoy.find((p) => p.secciones.includes(item.seccion));
  const pct = descuentoPara(item, promosHoy);
  const unitario = precioConDescuento(item.precio, pct);
  const pedible = sePuedePedir(item);
  const volver = () => (window.history.length > 1 ? navegar(-1) : navegar('/carta'));
  const sumar = () => { agregar(item.id, cantidad, nota); volver(); };

  return (
    <article className="pagina detalle">
      <header className="detalle-cab">
        <button type="button" className="icono-btn naranja" onClick={volver} aria-label="Volver a la carta"><X size={24} /></button>
        <span>Detalle</span>
        <span />
      </header>

      <div className="detalle-grid">
        <div className="detalle-foto">
          <Foto nombre={item.img} alt={item.nombre} sizes="(max-width: 900px) 100vw, 50vw" eager />
        </div>
        <div className="detalle-info">
          <p className="sobretitulo">{seccion?.titulo}</p>
          <h1>{item.nombre}</h1>
          <IconosDieta item={item} conTexto />
          {promo && pct > 0 && (
            <p className="promo-linea"><BadgePercent size={18} aria-hidden="true" /> {promo.titulo}: {pct}% off hoy</p>
          )}
          <h2 className="sub">Ingredientes</h2>
          <p className="detalle-desc">{item.desc}</p>

          {pedible ? (
            <>
              <label className="sub" htmlFor="nota">Notas para la cocina</label>
              <textarea id="nota" className="campo" rows={2} maxLength={140} placeholder="Ej: sin cebolla, punto jugoso" value={nota} onChange={(e) => setNota(e.target.value)} />
              <div className="detalle-pie">
                <div>
                  <small>Total</small>
                  <strong>{pesos(unitario * cantidad)}</strong>
                  {pct > 0 && <s>{pesos(item.precio * cantidad)}</s>}
                </div>
                <Cantidad valor={cantidad} min={1} onCambio={setCantidad} etiqueta="Cantidad" />
                <button type="button" className="btn btn-primario" onClick={sumar}>Agregar al pedido</button>
              </div>
            </>
          ) : (
            <p className="aviso-info">Este plato es una cortesía de la casa: llega a tu mesa sin cargo.</p>
          )}
        </div>
      </div>
    </article>
  );
}
