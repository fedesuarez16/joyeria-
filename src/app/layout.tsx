import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { CartBadge } from "@/components/cart-badge";
import { HeaderAuth } from "@/components/header-auth";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const jost = Jost({ variable: "--font-jost", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const siteName = "Maina";

export const metadata: Metadata = {
  title: { default: siteName, template: `%s | ${siteName}` },
  description:
    "Joyería y bisutería: anillos, collares, pulseras y aros. Detalles que brillan, belleza que te define.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${jost.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-gold/30 bg-ink/95 text-white backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo-mark.png"
                alt=""
                width={58}
                height={40}
                priority
                className="h-10 w-auto"
              />
              <span className="font-display text-2xl font-semibold uppercase tracking-[0.25em] text-gold">
                {siteName}
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm text-neutral-300">
              <Link href="/" className="transition-colors hover:text-gold">
                Catálogo
              </Link>
              <HeaderAuth />
              <CartBadge />
            </nav>
          </div>
          {/* Progreso de lectura ligado al scroll (CSS puro, sin JS) */}
          <div className="scroll-progress absolute inset-x-0 -bottom-px h-0.5" aria-hidden />
        </header>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
