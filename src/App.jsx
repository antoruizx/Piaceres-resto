import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Inicio from './pages/Inicio.jsx';
import Carta from './pages/Carta.jsx';
import Plato from './pages/Plato.jsx';
import Checkout from './pages/Checkout.jsx';
import { Historia, Mesa, NoEncontrado, Resultado, Sucursales } from './pages/Otras.jsx';

// El generador de QR se carga aparte: lo usa solo el personal.
const Qr = lazy(() => import('./pages/Qr.jsx'));

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/carta" element={<Carta />} />
        <Route path="/carta/:id" element={<Plato />} />
        <Route path="/pedido" element={<Checkout />} />
        <Route path="/pedido/:estado" element={<Resultado />} />
        <Route path="/historia" element={<Historia />} />
        <Route path="/sucursales" element={<Sucursales />} />
        <Route path="/mesa" element={<Mesa />} />
        <Route path="/qr" element={<Suspense fallback={<p className="vacio">Cargando…</p>}><Qr /></Suspense>} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </Layout>
  );
}
