import { Link } from 'react-router-dom';
import { Flecha, Monograma } from './Base.jsx';
import { NAV } from './Hero.jsx';
import { DIRECCION, EMAIL, INSTAGRAM, TELEFONO, wa } from '../config.js';

export default function Footer() {
  return (
    <footer className="footer ancho">
      <div className="footer-in">
        <div className="footer-top">
          <div className="footer-marca">
            <Link to="/" className="logo" aria-label="Piaceres, ir al inicio"><Monograma /><span className="logo-txt">PIACERES</span></Link>
            <p>Parrilla a la leña, pastas de autor y cocina vegetariana. Seis casas en Tucumán.</p>
          </div>
          <nav aria-label="Pie de página">
            <h2>Navegación</h2>
            <ul>
              {NAV.map(([t, h]) => <li key={h}><Link to={h}>{t}</Link></li>)}
              <li><Link to="/carta">Carta completa</Link></li>
              <li><Link to="/historia">Nuestra historia</Link></li>
            </ul>
          </nav>
          <div>
            <h2>Contacto</h2>
            <ul>
              <li><a href={wa()} target="_blank" rel="noopener noreferrer">WhatsApp {TELEFONO}</a></li>
              <li>{DIRECCION}, San Miguel de Tucumán</li>
              <li>{INSTAGRAM ? <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Instagram</a> : 'Instagram [INSTAGRAM]'}</li>
              <li>{EMAIL ? <a href={`mailto:${EMAIL}`}>{EMAIL}</a> : '[EMAIL]'}</li>
            </ul>
          </div>
          <div>
            <h2>Horarios</h2>
            <ul>
              <li className="horario">Mediodía <Flecha w={24} /> 12 a 16 h</li>
              <li className="horario">Noche <Flecha w={24} /> 20 a 00 h</li>
              <li className="horario">Todos los días</li>
            </ul>
            <div className="botones">
              <a className="btn btn-primario" href={wa('Hola, quiero reservar una mesa.')} target="_blank" rel="noopener noreferrer">Reservar mesa</a>
              <Link className="btn btn-claro" to="/carta">Carta</Link>
            </div>
          </div>
        </div>
        <div className="footer-bajo">
          <p>Piaceres Restaurante · San Miguel de Tucumán</p>
          <p>© 2026 Sitio oficial</p>
        </div>
      </div>
    </footer>
  );
}
