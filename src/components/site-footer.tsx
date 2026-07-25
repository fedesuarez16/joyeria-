import Link from "next/link";
import Image from "next/image";

const categoryLinks = [
  { label: "Anillos", slug: "anillos" },
  { label: "Collares", slug: "collares" },
  { label: "Pulseras", slug: "pulseras" },
  { label: "Aros", slug: "aros" },
];

const navLinks = [
  { label: "Catálogo", href: "/#catalogo" },
  { label: "Carrito", href: "/carrito" },
  { label: "Mi cuenta", href: "/cuenta" },
  { label: "Crear cuenta", href: "/registro" },
];

const WHATSAPP_NUMBER = "5492995927196";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-neutral-400">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo-mark.png" alt="" width={58} height={40} className="h-9 w-auto" />
            <span className="font-display text-xl font-semibold uppercase tracking-[0.25em] text-gold">
              Maina
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Joyería &amp; bisutería. Detalles que brillan, belleza que te define.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Categorías
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {categoryLinks.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/?subcategoria=${c.slug}#catalogo`}
                  className="transition-colors hover:text-gold"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Navegación
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Contacto
          </h3>
          <p className="mt-4 text-sm leading-relaxed">
            Pedidos y consultas por WhatsApp.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full border border-gold/60 px-5 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            Escribinos
          </a>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Maina — Joyería &amp; Bisutería. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
