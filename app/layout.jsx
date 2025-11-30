// src/app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "Confesionario Anónimo",
  description:
    "Confesiones anónimas por ciudad y universidad. Sin nombres, sin odio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <header className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Confesionario<span className="text-pink-400">AR</span>
              </h1>
              <p className="text-sm text-slate-400">
                Confesiones anónimas por ciudad y universidad. Nada de nombres,
                nada de odio.
              </p>
            </div>
            <nav className="flex items-center gap-2 text-sm">
              <a
                href="/confesiones"
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700"
              >
                Confesiones
              </a>
              <a
                href="/confesar"
                className="px-3 py-1 rounded-full bg-pink-500 hover:bg-pink-400 text-slate-950 font-medium"
              >
                Confesar
              </a>
              <a
                href="/reglas"
                className="px-3 py-1 rounded-full border border-slate-600 hover:bg-slate-800"
              >
                Reglas
              </a>
            </nav>
          </header>
          {children}
          <footer className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500">
            Proyecto anónimo. No se permite difamación, odio ni datos
            personales. Si ves algo peligroso o ilegal, repórtalo y será
            revisado.
          </footer>
        </div>
      </body>
    </html>
  );
}
