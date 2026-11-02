import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Carta from './pages/Carta.jsx';
import Historia from './pages/Historia.jsx';
import NoEncontrado from './pages/NoEncontrado.jsx';
import Footer from './components/Footer.jsx';

const sinMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const { pathname, hash } = useLocation();

  // Al cambiar de página: ir al ancla (#seccion) o arriba de todo.
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) { el.scrollIntoView({ behavior: sinMovimiento() ? 'auto' : 'smooth' }); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  // Animación de entrada al hacer scroll (fade + subir 24px).
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || sinMovimiento()) {
      els.forEach((e) => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entradas) => entradas.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [pathname]);

  return (
    <div className="marco">
      <a className="salto" href="#main">Saltar al contenido</a>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/carta" element={<Carta />} />
        <Route path="/historia" element={<Historia />} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
      <Footer />
    </div>
  );
}
