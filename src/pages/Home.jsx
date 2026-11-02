import { useEffect } from 'react';
import { Hero } from '../components/Hero.jsx';
import CartaLibro from '../components/CartaLibro.jsx';
import Sucursales from '../components/Sucursales.jsx';
import { Antipasti, CartaIntro, HistoriaResumen, Ocasiones, Recomendaciones, Restaurante, Vinos } from '../components/Secciones.jsx';

export default function Home() {
  useEffect(() => { document.title = 'Piaceres · Restaurante en Tucumán'; }, []);
  return (
    <>
      <Hero />
      <main id="main" className="contenido ancho">
        <Restaurante />
        <CartaIntro />
        <CartaLibro />
        <Recomendaciones />
        <Antipasti />
        <Ocasiones />
        <Vinos />
        <HistoriaResumen />
        <Sucursales />
      </main>
    </>
  );
}
