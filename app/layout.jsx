// src/app/layout.jsx
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Confesionario Anónimo",
  description:
    "Confesiones anónimas por ciudad y universidad. Sin nombres, sin odio.",
};

export default function RootLayout({ children }) {
  const year = new Date().getFullYear();

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col min-h-screen">
          {/* HEADER */}
          <header className="flex items-center justify-between gap-4 mb-6">
            <div>
              <Link href="/" className="inline-block">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Confes<span className="text-pink-400">AR</span>
                </h1>
              </Link>
              <p className="text-sm text-slate-400">
                Confesiones anónimas por ciudad y universidad. Nada de odio.
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href="/confesiones"
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Confesiones
              </Link>
              <Link
                href="/confesar"
                className="px-3 py-1 rounded-full bg-pink-500 hover:bg-pink-400 text-slate-950 font-medium transition-colors"
              >
                Confesar
              </Link>
              <Link
                href="/reglas"
                className="px-3 py-1 rounded-full border border-slate-600 hover:bg-slate-800 transition-colors"
              >
                Reglas
              </Link>
            </nav>
          </header>

          {/* CONTENIDO PRINCIPAL */}
          <main className="flex-1 mb-8">{children}</main>

          {/* FOOTER PRINCIPAL */}
          <footer className="mt-4 pt-6 border-t border-slate-800 text-xs text-slate-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2 max-w-md">
                <p>
                  Este es un espacio de confesiones anónimas. No verificamos la
                  identidad de quienes publican ni la veracidad del contenido.
                  Los mensajes son responsabilidad exclusiva de quienes los
                  escriben.
                </p>
                <p className="text-[11px] text-slate-500">
                  No se permite difamación, datos personales, amenazas, discurso
                  de odio ni contenido sexual con menores. Si ves algo peligroso
                  o ilegal, usá el botón de{" "}
                  <span className="font-semibold">Reportar</span> para que
                  nuestro equipo lo revise.
                </p>
              </div>

              <div className="flex flex-col items-start gap-2 md:items-end">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/terminos"
                    className="hover:text-slate-300 transition-colors"
                  >
                    Términos
                  </Link>
                  <Link
                    href="/privacidad"
                    className="hover:text-slate-300 transition-colors"
                  >
                    Privacidad
                  </Link>
                  <Link
                    href="/cookies"
                    className="hover:text-slate-300 transition-colors"
                  >
                    Cookies
                  </Link>
                  <Link
                    href="/reglas"
                    className="hover:text-slate-300 transition-colors"
                  >
                    Reglas de la comunidad
                  </Link>
                  <Link
                    href="/confesiones/favoritos"
                    className="hover:text-slate-300 transition-colors"
                  >
                    Favoritos ⭐
                  </Link>
                </div>
                <p className="text-[11px] text-slate-600">
                  © {year} ConfesAR · Proyecto independiente hecho para
                  hablar sin nombres y sin odio.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}