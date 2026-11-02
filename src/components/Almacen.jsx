import almacen from '../data/almacen.json';
import menu from '../data/menu.json';
import { Etiqueta, Flecha, Foto } from './Base.jsx';
import { precioTxt, wa } from '../config.js';
import { Etiquetas } from './CartaLibro.jsx';

// Comparación mesa vs. para llevar, tomada de los datos (no hardcodeada).
const enMesa = menu.secciones.flatMap((s) => s.items).find((i) => i.id === 'tortelli');
const paraLlevar = almacen.grupos[0].items.find((i) => i.id === 'tortelli-casa');

export default function Almacen() {
  return (
    <section className="seccion" id="pastas-frescas" aria-labelledby="alm-tit">
      <div className="contenedor">
        <div className="almacen-cab">
          <div className="almacen-foto zoom reveal">
            <Foto nombre="tortelli" alt="Tortelli frescos al vino tinto listos para cocinar" sizes="(max-width: 860px) 100vw, 45vw" />
          </div>
          <div className="reveal">
            <Etiqueta>Almacén Piaceres</Etiqueta>
            <h2 className="titulo" id="alm-tit">Pastas frescas para llevar</h2>
            <p className="parrafo">
              Las mismas pastas que servimos en el salón, hechas cada mañana, para cocinar en tu casa. Sumá una salsa de
              nuestra cocina y un buen queso, y la cena está resuelta a precio de almacén.
            </p>
            {enMesa && paraLlevar && (
              <div className="comparacion">
                <div>
                  <p className="comp-tit">Tortelli en la mesa</p>
                  <p className="comp-precio">{precioTxt(enMesa.precio)}</p>
                  <p className="comp-nota">un plato</p>
                </div>
                <div>
                  <p className="comp-tit">Para hacer en casa</p>
                  <p className="comp-precio destacado">{precioTxt(paraLlevar.precio)}</p>
                  <p className="comp-nota">500 g, rinde para dos</p>
                </div>
              </div>
            )}
            <div className="botones">
              <a className="btn btn-primario" href={wa('Hola, quiero encargar pastas frescas para llevar.')} target="_blank" rel="noopener noreferrer">
                Encargar por WhatsApp <Flecha w={28} />
              </a>
            </div>
            <p className="comp-nota" style={{ marginTop: 14 }}>Retiro en cualquier sucursal o con tu pedido de delivery.</p>
          </div>
        </div>

        <div className="almacen-cols reveal">
          {almacen.grupos.map((g) => (
            <div key={g.id}>
              <div className="almacen-col-cab">
                <h3>{g.titulo}</h3>
                <span className="nota">{g.nota}</span>
              </div>
              <ul className="almacen-lista">
                {g.items.map((i) => (
                  <li key={i.id}>
                    <div>
                      <p className="alm-nombre">
                        {i.nombre}
                        {g.id === 'pastas' ? <Etiquetas item={i} /> : <>
                          {i.vegano && <span className="tag tag-vegano">Vegano</span>}
                          {i.sinTacc && <span className="tag tag-sintacc">Sin TACC</span>}
                        </>}
                      </p>
                      <p className="alm-desc">{i.desc} · {i.presentacion}</p>
                    </div>
                    <span className="alm-precio">{precioTxt(i.precio)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
