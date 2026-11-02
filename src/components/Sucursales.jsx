import { useState } from 'react';
import sucursales from '../data/sucursales.json';
import { Etiqueta, ListaNum } from './Base.jsx';
import { PH, wa } from '../config.js';

// Distancia en km entre dos puntos (fórmula de haversine).
function distanciaKm(a, b) {
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const Ph = ({ children }) => <span className="ph">{children}</span>;

export default function Sucursales() {
  const [sel, setSel] = useState('centro');
  const [msg, setMsg] = useState('');
  const [buscando, setBuscando] = useState(false);
  const s = sucursales.find((x) => x.id === sel);

  const usarUbicacion = () => {
    if (!('geolocation' in navigator)) {
      setMsg('Tu navegador no permite usar la ubicación. Elegí tu zona más abajo.');
      return;
    }
    setBuscando(true);
    setMsg('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBuscando(false);
        const yo = { lat: coords.latitude, lng: coords.longitude };
        const conCoords = sucursales.filter((x) => x.lat != null && x.lng != null);
        if (!conCoords.length) { setMsg('Todavía no tenemos las ubicaciones cargadas. Elegí tu zona más abajo.'); return; }
        const [mejor] = conCoords
          .map((x) => ({ ...x, km: distanciaKm(yo, x) }))
          .sort((a, b) => a.km - b.km);
        setSel(mejor.id);
        setMsg(`Tu Piaceres más cercano es ${mejor.nombre}, a ${mejor.km.toFixed(1).replace('.', ',')} km.`);
      },
      () => {
        setBuscando(false);
        setMsg('No pudimos acceder a tu ubicación. No pasa nada: elegí tu zona más abajo.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };

  const envio = s.envioGratisDesde != null ? `$ ${s.envioGratisDesde.toLocaleString('es-AR')}` : PH.monto;

  return (
    <section className="seccion" id="sucursales" aria-labelledby="suc-tit">
      <div className="contenedor sucursales">
        <div className="reveal">
          <Etiqueta>Sucursales</Etiqueta>
          <h2 className="titulo" id="suc-tit">Tu Piaceres más cercano</h2>
          <p className="parrafo">Cinco casas en Tucumán. Usá tu ubicación o elegí tu zona para ver dirección, horarios y delivery.</p>
          <div className="geo">
            <button type="button" className="btn btn-sec" onClick={usarUbicacion} disabled={buscando}>Usar mi ubicación</button>
            <p className="geo-msg" role="status">{msg}</p>
          </div>
          <p className="zona-tit" id="zona-tit">Elegí tu zona</p>
          <div className="chips" role="group" aria-labelledby="zona-tit">
            {sucursales.map((x) => (
              <button key={x.id} type="button" className="chip" aria-pressed={x.id === sel} onClick={() => { setSel(x.id); setMsg(''); }}>
                {x.nombre}
              </button>
            ))}
          </div>
        </div>
        <article className="suc-card reveal" aria-live="polite">
          <h3>{s.nombre}</h3>
          <ListaNum
            items={[
              s.direccion || <Ph>{PH.direccion}</Ph>,
              `Todos los días, ${s.horario}`,
              <>Delivery en {s.deliveryMin ?? <Ph>{PH.minutos}</Ph>} min · sin cargo desde {envio === PH.monto ? <Ph>{envio}</Ph> : envio}</>,
            ]}
          />
          <div className="botones">
            <a className="btn btn-primario" href={wa(`Hola, quiero hacer un pedido a domicilio (sucursal ${s.nombre}).`)} target="_blank" rel="noopener noreferrer">Pedir a domicilio</a>
            <a className="btn btn-sec" href={wa(`Hola, quiero reservar una mesa en la sucursal ${s.nombre}.`)} target="_blank" rel="noopener noreferrer">Reservar mesa</a>
          </div>
        </article>
      </div>
    </section>
  );
}
