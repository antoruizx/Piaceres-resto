// Página interna: genera QR imprimibles por mesa (/qr). No figura en el menú ni en buscadores.
// Cada QR abre /mesa?sucursal=ID&mesa=N, que pone la app en modo salón con esa mesa.
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';
import { Logo } from '../components/ui.jsx';
import { sucursales } from '../state/Pedido.jsx';
import { MARCA } from '../config.js';

const MAX_MESAS = 100;

export default function Qr() {
  const [sucursal, setSucursal] = useState(sucursales[0].id);
  const [desde, setDesde] = useState(1);
  const [hasta, setHasta] = useState(12);
  const [base, setBase] = useState(() => window.location.origin);
  const [codigos, setCodigos] = useState([]);
  const suc = sucursales.find((s) => s.id === sucursal);

  useEffect(() => {
    document.title = `QR de mesas · ${MARCA}`;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const mesas = useMemo(() => {
    const a = Math.max(1, Math.floor(Number(desde) || 1));
    const b = Math.min(a + MAX_MESAS - 1, Math.max(a, Math.floor(Number(hasta) || a)));
    return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  }, [desde, hasta]);

  useEffect(() => {
    let vivo = true;
    const raiz = base.replace(/\/$/, '');
    Promise.all(
      mesas.map(async (n) => {
        const url = `${raiz}/mesa?${new URLSearchParams({ sucursal, mesa: String(n) })}`;
        const svg = await QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#111111', light: '#FFFFFF' } });
        return { n, url, svg };
      })
    ).then((r) => vivo && setCodigos(r));
    return () => { vivo = false; };
  }, [mesas, sucursal, base]);

  return (
    <div className="pagina qr-pagina">
      <div className="qr-controles no-imprimir">
        <h1 className="titulo-pagina">QR de mesas</h1>
        <p className="ayuda">Cada código abre la carta en modo salón con la mesa ya cargada. Imprimilos en A4 y recortalos.</p>
        <div className="campos qr-campos">
          <label><span>Sucursal</span>
            <select className="campo" value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
              {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </label>
          <label><span>Desde la mesa</span><input className="campo" type="number" min={1} value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
          <label><span>Hasta la mesa</span><input className="campo" type="number" min={1} value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
          <label className="ancho"><span>Dirección del sitio publicado</span><input className="campo" type="url" value={base} onChange={(e) => setBase(e.target.value)} /></label>
        </div>
        {base.includes('localhost') && <p className="ayuda naranja">Ojo: estás en tu computadora. Para imprimir, poné la dirección pública del sitio (ej. https://piaceres-resto.vercel.app).</p>}
        <button type="button" className="btn btn-primario btn-grande" onClick={() => window.print()}>
          <Printer size={20} aria-hidden="true" /> Imprimir {mesas.length} {mesas.length === 1 ? 'QR' : 'QR'}
        </button>
      </div>

      <ul className="qr-grilla">
        {codigos.map(({ n, url, svg }) => (
          <li key={n} className="qr-tarjeta">
            <div className="qr-marca"><Logo /></div>
            <p className="qr-mesa">Mesa <strong>{n}</strong></p>
            <div className="qr-codigo" role="img" aria-label={`Código QR de la mesa ${n}`} dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="qr-txt">Escaneá para ver la carta, pedir y pagar desde tu celular</p>
            <p className="qr-suc">{MARCA} · {suc?.nombre}</p>
            <p className="qr-url">{url.replace(/^https?:\/\//, '')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
