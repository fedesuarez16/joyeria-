"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const SLIDE_MS = 6000;

const slides = [
  {
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1600&q=80",
    alt: "Collar de oro sobre fondo negro",
    eyebrow: "Joyería & Bisutería",
    title: (
      <>
        Detalles que brillan,
        <br />
        <span className="italic text-gold">belleza que te define.</span>
      </>
    ),
    body: "Anillos, collares, pulseras y aros elegidos pieza por pieza.",
  },
  {
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1600&q=80",
    alt: "Pulsera de brillantes sobre fondo negro",
    eyebrow: "Club Maina",
    title: (
      <>
        Registrate y llevate
        <br />
        <span className="italic text-gold">10% en tu primera compra.</span>
      </>
    ),
    body: "Creá tu cuenta gratis, seguí tus pedidos y accedé a beneficios exclusivos.",
  },
  {
    image: "https://images.unsplash.com/photo-1620656798579-1984d9e87df7?w=1600&q=80",
    alt: "Mujer con collar y anillo dorados",
    eyebrow: "Promos y novedades",
    title: (
      <>
        Enterate antes que nadie
        <br />
        <span className="italic text-gold">de cada nuevo brillo.</span>
      </>
    ),
    body: "Dejanos tu mail y recibí promociones y nuevos ingresos.",
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  const goTo = useCallback((i: number) => {
    setActive(i);
  }, []);

  return (
    <section
      className="relative h-[75vh] min-h-[520px] w-full overflow-hidden bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carrusel"
    >
      {slides.map((s, i) => (
        <div
          key={s.image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={i !== active}
        >
          <Image
            src={s.image}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover ${i === active ? "hero-kenburns" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
          <div
            className={`relative mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center px-4 text-center ${
              i === active ? "hero-copy-active" : ""
            }`}
          >
            <p className="hero-line flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-gold">
              <span className="h-px w-8 bg-gold/60" aria-hidden />
              {s.eyebrow}
              <span className="h-px w-8 bg-gold/60" aria-hidden />
            </p>
            <h2 className="hero-line mt-5 font-display text-5xl font-medium leading-[1.05] sm:text-6xl">
              {s.title}
            </h2>
            <p className="hero-line mt-5 max-w-md font-sans text-sm uppercase tracking-[0.15em] text-neutral-300">
              {s.body}
            </p>
            <div className="hero-line mt-8">
              {i === 0 && (
                <a
                  href="#catalogo"
                  className="inline-block rounded-full bg-gold px-8 py-3 text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-gold/85"
                >
                  Ver catálogo
                </a>
              )}
              {i === 1 && (
                <Link
                  href="/registro"
                  className="inline-block rounded-full border border-gold px-8 py-3 text-sm font-semibold uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-ink"
                >
                  Crear cuenta
                </Link>
              )}
              {i === 2 && <NewsletterForm />}
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2.5">
        {slides.map((s, i) => (
          <button
            key={s.image}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ir al slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-6 bg-gold" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim().toLowerCase() });
    // Mail repetido = ya suscripto: lo tratamos como éxito.
    if (error && error.code !== "23505") {
      setStatus("error");
      return;
    }
    setStatus("ok");
  }

  if (status === "ok") {
    return <p className="font-medium text-gold">¡Listo! Te vamos a escribir pronto ✨</p>;
  }

  return (
    <form onSubmit={subscribe} className="flex w-full max-w-md flex-col items-center gap-2">
      <div className="flex w-full overflow-hidden rounded-full border border-gold/50 bg-ink/60 backdrop-blur">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          aria-label="Tu dirección de correo electrónico"
          className="w-full bg-transparent px-5 py-3 text-sm text-white placeholder:text-neutral-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 bg-gold px-6 text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-gold/85 disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Suscribirme"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-sm text-red-400">No pudimos suscribirte. Probá de nuevo en un rato.</p>
      )}
    </form>
  );
}
