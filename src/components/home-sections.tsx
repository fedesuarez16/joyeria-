import Link from "next/link";
import Image from "next/image";

/** Banda de cita sobre fondo negro, separa el catálogo del resto del home. */
export function QuoteBand() {
  return (
    <section className="bg-ink px-4 py-16 text-center text-white sm:py-20">
      <p className="mx-auto max-w-2xl font-display text-2xl leading-snug sm:text-3xl">
        Hay piezas que se compran
        <br />
        <span className="text-gold">y piezas que te eligen.</span>
      </p>
      <div className="mx-auto mt-6 h-px w-16 bg-gold/60" aria-hidden />
      <p className="mt-6 text-sm uppercase tracking-[0.3em] text-neutral-400">
        Cuando la encuentres, lo vas a saber
      </p>
    </section>
  );
}

const promises = [
  {
    title: "Envío a todo el país",
    text: "Preparamos cada pedido con cuidado y te lo enviamos estés donde estés.",
    icon: (
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    ),
  },
  {
    title: "Materiales que cuidan tu piel",
    text: "Acero quirúrgico, plata 925 y baños de oro hipoalergénicos, pensados para el uso diario.",
    icon: <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3zM9.5 12l2 2 3.5-4" />,
  },
  {
    title: "Atención personalizada",
    text: "¿Dudas con un talle, un regalo o tu pedido? Te asesoramos por WhatsApp.",
    icon: (
      <path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12zM8.5 12h.01M12 12h.01M15.5 12h.01" />
    ),
  },
];

/** Tres promesas de la marca en cards con filete dorado. */
export function BrandPromises() {
  return (
    <section className="bg-neutral-100 px-4 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-accent">
          Nuestra promesa
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {promises.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border-t-2 border-gold bg-white p-6 shadow-sm"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-accent"
                aria-hidden
              >
                {p.icon}
              </svg>
              <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** CTA de registro: imagen a la izquierda, texto a la derecha, sobre negro. */
export function JoinClub() {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 md:grid-cols-2">
        <div className="relative order-last mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-gold/20 md:order-first">
          <Image
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80"
            alt="Anillo solitario sobre fondo oscuro"
            fill
            sizes="(max-width: 768px) 90vw, 45vw"
            className="object-cover"
          />
        </div>
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Club Maina</p>
          <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
            Creá tu cuenta y obtené{" "}
            <span className="text-gold">10% en tu primera compra</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-neutral-400 md:mx-0">
            Enterate antes que nadie de los nuevos ingresos, seguí tus pedidos y
            recibí beneficios exclusivos para socias del club.
          </p>
          <Link
            href="/registro"
            className="mt-8 inline-block rounded-full border border-gold px-8 py-3 text-sm font-semibold uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            Sumarme al club
          </Link>
        </div>
      </div>
    </section>
  );
}
