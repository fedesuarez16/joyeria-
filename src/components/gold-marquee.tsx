const items = [
  "Plata 925 · Acero quirúrgico",
  "10% off en tu primera compra",
  "Atención personalizada por WhatsApp",
  "Nuevos ingresos cada semana",
];

/**
 * Cinta dorada infinita entre el hero y el catálogo.
 * 100% CSS: el track duplica el contenido y se desplaza -50%.
 * La segunda copia es aria-hidden para no repetir el texto en lectores.
 */
export function GoldMarquee() {
  return (
    <div className="marquee-wrap border-y border-gold/25 bg-ink py-3.5 text-gold select-none">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="marquee-group" aria-hidden={copy === 1}>
            {items.map((text) => (
              <span
                key={text}
                className="marquee-item font-sans text-[0.7rem] uppercase tracking-[0.3em]"
              >
                {text}
                <span className="marquee-diamond" aria-hidden />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
