import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, CreditCard, Loader2, MessageCircle } from 'lucide-react';
import { SelectorModo } from '../components/Layout.jsx';
import { sucursales, usePedido } from '../state/Pedido.jsx';
import { MODOS, PROPINAS, pesos } from '../lib/pedido.js';
import { MARCA, wa } from '../config.js';

const CLIENTE = 'piaceres-cliente';

function mensajeWhatsApp(p, r, cliente, pago) {
  const lineas = r.detalle.map((d) => `• ${d.cantidad} x ${d.nombre}${d.nota ? ` (${d.nota})` : ''} — ${pesos(d.total)}`);
  return [
    `Hola! Quiero hacer un pedido (${MODOS[p.modo]} · ${r.sucursal.nombre}${p.modo === 'salon' && p.mesa ? ` · Mesa ${p.mesa}` : ''}):`,
    ...lineas,
    r.descuento ? `Descuento del día: - ${pesos(r.descuento)}` : null,
    p.modo === 'delivery' ? `Envío: ${r.envio ? pesos(r.envio) : 'sin cargo'}` : null,
    r.propina ? `Propina: ${pesos(r.propina)}` : null,
    `Total: ${pesos(r.total)}`,
    `Pago: ${pago}`,
    `Nombre: ${cliente.nombre} · Tel: ${cliente.telefono}`,
    p.modo === 'delivery' ? `Dirección: ${cliente.direccion}` : null,
  ].filter(Boolean).join('\n');
}

export default function Checkout() {
  const p = usePedido();
  const r = p.resumen;
  const [cliente, setCliente] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CLIENTE)) || { nombre: '', telefono: '', direccion: '' }; } catch { return { nombre: '', telefono: '', direccion: '' }; }
  });
  const [metodo, setMetodo] = useState('mp');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { document.title = `Tu pedido · ${MARCA}`; }, []);
  useEffect(() => { try { localStorage.setItem(CLIENTE, JSON.stringify(cliente)); } catch { /* ok */ } }, [cliente]);

  if (!r) {
    return (
      <div className="pagina vacio">
        <h1 className="titulo-pagina">Tu pedido</h1>
        <p>Todavía no agregaste nada.</p>
        <Link className="btn btn-primario" to="/carta">Ver la carta</Link>
      </div>
    );
  }

  const campo = (k) => ({ value: cliente[k], onChange: (e) => setCliente({ ...cliente, [k]: e.target.value }) });
  const efectivoTxt = p.modo === 'salon' ? 'Pagar en la mesa' : p.modo === 'retiro' ? 'Pagar al retirar' : 'Efectivo al recibir';

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (!cliente.nombre.trim() || !cliente.telefono.trim()) return setError('Completá tu nombre y teléfono.');
    if (p.modo === 'delivery' && !cliente.direccion.trim()) return setError('Completá la dirección de entrega.');
    if (p.modo === 'salon' && !p.mesa.trim()) return setError('Indicá el número de mesa.');

    if (metodo === 'efectivo') {
      window.open(wa(mensajeWhatsApp(p, r, cliente, efectivoTxt)), '_blank', 'noopener');
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: p.lineas,
          modo: p.modo,
          sucursal: p.sucursal,
          mesa: p.mesa,
          propinaPct: p.propinaPct,
          cliente,
        }),
      });
      const datos = await res.json().catch(() => ({}));
      if (!res.ok || !datos.init_point) throw new Error(datos.error || 'El pago online no está disponible en este momento.');
      window.location.assign(datos.init_point);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <form className="pagina checkout" onSubmit={enviar} noValidate>
      <h1 className="titulo-pagina">Confirmá tu pedido</h1>

      <section className="bloque">
        <h2 className="sub">¿Cómo lo querés?</h2>
        <SelectorModo />
      </section>

      <section className="bloque">
        <label className="sub" htmlFor="suc">Sucursal</label>
        <select id="suc" className="campo" value={p.sucursal} onChange={(e) => p.setOpciones({ sucursal: e.target.value })}>
          {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        {p.modo === 'salon' && (
          <>
            <label className="sub" htmlFor="mesa">Número de mesa</label>
            <input id="mesa" className="campo" inputMode="numeric" maxLength={10} placeholder="Ej: 12" value={p.mesa} onChange={(e) => p.setOpciones({ mesa: e.target.value })} />
          </>
        )}
      </section>

      <section className="bloque">
        <h2 className="sub">Tus datos</h2>
        <div className="campos">
          <label><span>Nombre</span><input className="campo" autoComplete="name" maxLength={80} {...campo('nombre')} /></label>
          <label><span>Teléfono</span><input className="campo" type="tel" autoComplete="tel" maxLength={30} {...campo('telefono')} /></label>
          {p.modo === 'delivery' && (
            <label className="ancho"><span>Dirección de entrega</span><input className="campo" autoComplete="street-address" maxLength={160} placeholder="Calle, número, piso, barrio" {...campo('direccion')} /></label>
          )}
        </div>
      </section>

      <section className="bloque">
        <h2 className="sub">Propina</h2>
        <div className="chips">
          {PROPINAS.map((n) => (
            <button key={n} type="button" className="chip chip-grande" aria-pressed={p.propinaPct === n} onClick={() => p.setOpciones({ propinaPct: n })}>{n} %</button>
          ))}
        </div>
      </section>

      <section className="bloque">
        <h2 className="sub">Forma de pago</h2>
        <div className="chips">
          <button type="button" className="chip chip-grande" aria-pressed={metodo === 'mp'} onClick={() => setMetodo('mp')}><CreditCard size={18} aria-hidden="true" /> Mercado Pago</button>
          <button type="button" className="chip chip-grande" aria-pressed={metodo === 'efectivo'} onClick={() => setMetodo('efectivo')}><Banknote size={18} aria-hidden="true" /> {efectivoTxt}</button>
        </div>
        {metodo === 'efectivo' && <p className="ayuda">Te abrimos WhatsApp con el pedido armado para que lo confirmes con la sucursal.</p>}
      </section>

      <section className="bloque">
        <h2 className="sub">Detalle</h2>
        <dl className="totales">
          <div><dt>{r.cantidadItems} {r.cantidadItems === 1 ? 'producto' : 'productos'}</dt><dd>{pesos(r.subtotalLista)}</dd></div>
          {r.descuento > 0 && <div><dt>Descuento del día</dt><dd className="verde">- {pesos(r.descuento)}</dd></div>}
          {p.modo === 'delivery' && <div><dt>Envío</dt><dd>{r.envio ? pesos(r.envio) : 'Sin cargo'}</dd></div>}
          {r.propina > 0 && <div><dt>Propina</dt><dd>{pesos(r.propina)}</dd></div>}
          <div><dt>Tiempo estimado</dt><dd>{r.minutos} min</dd></div>
        </dl>
      </section>

      {error && (
        <div className="error" role="alert">
          <p>{error}</p>
          {metodo === 'mp' && (
            <a className="link-naranja" href={wa(mensajeWhatsApp(p, r, cliente, 'a coordinar'))} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} aria-hidden="true" /> Enviar el pedido por WhatsApp
            </a>
          )}
        </div>
      )}

      <div className="pagar-barra">
        <div><small>Total</small><strong>{pesos(r.total)}</strong></div>
        <button type="submit" className="btn btn-primario btn-grande" disabled={enviando}>
          {enviando ? <><Loader2 size={18} className="girando" aria-hidden="true" /> Conectando…</> : metodo === 'mp' ? 'Pagar con Mercado Pago' : 'Enviar pedido'}
        </button>
      </div>
    </form>
  );
}
