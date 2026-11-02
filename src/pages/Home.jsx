import { useEffect } from 'react';
import { Hero } from '../components/Hero.jsx';
import CartaLibro from '../components/CartaLibro.jsx';
import Sucursales from '../components/Sucursales.jsx';
import Almacen from '../components/Almacen.jsx';
import { Antipasti, CartaIntro, HistoriaResumen, Ocasiones, Recomendaciones, Restaurante, Vinos } from '../components/Secciones.jsx';

export default function Home() {
  useEffect(() => { document.title = 'Piaceri Argentini · Restaurante argentino en el Caribe mexicano'; }, []);
  return (
    <>
      <Hero />
      <main id="main" className="contenido ancho">
        <Restaurante />
        <CartaIntro />
        <CartaLibro />
        <Recomendaciones />
        <Antipasti />
        <Almacen />
        <Ocasiones />
        <Vinos />
        <HistoriaResumen />
        <Sucursales />
      </main>
    </>
  );
}
