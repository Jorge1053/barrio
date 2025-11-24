"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Home, Bell, Store, User, LogOut, MapPin } from "lucide-react";
import { useEffect } from "react";

const links = [
  { href: "/dashboard/mi-barrio", label: "Mi barrio", icon: Home },
  { href: "/dashboard/alertas", label: "Alertas", icon: Bell },
  { href: "/dashboard/mercado", label: "Mercado", icon: Store },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
];

export function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, perfil, loading, supabase } = useAuth();

  // 🔹 Redirección hecha correctamente en un efecto, NO durante el render
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  // Mientras carga o mientras se dispara la redirección, mostramos un loader simple
  if (loading || (!loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-b-bg">
        <p className="text-b-muted text-sm">Cargando tu barrio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950/95">
      <header className="border-b border-b-border bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-b-accent-soft flex items-center justify-center">
              <span className="font-bold text-b-accent text-sm">B</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-none">Barrio</span>
              <span className="text-[10px] text-b-muted leading-none mt-0.5">
                Tu comunidad digital
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {perfil && (
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-medium">
                  {perfil.nombre || "Vecino"}
                </span>
                <span className="text-[11px] text-b-muted flex items-center gap-1 justify-end">
                  <MapPin className="w-3 h-3" />
                  {perfil.barrio_id ? "Barrio asignado" : "Sin barrio aún"}
                </span>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-5 grid md:grid-cols-[220px,1fr] gap-5">
        <aside className="hidden md:flex flex-col gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm border transition-all ${
                    active
                      ? "bg-b-accent-soft border-b-accent/60 text-b-accent"
                      : "bg-slate-950/60 border-b-border hover:bg-slate-900/80"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </aside>

        {/* Mobile nav */}
        <nav className="md:hidden mb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="flex-1">
                <div
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-2xl text-[11px] border ${
                    active
                      ? "bg-b-accent-soft border-b-accent/60 text-b-accent"
                      : "bg-slate-950/60 border-b-border"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <main className="min-h-[60vh]">{children}</main>
      </div>
    </div>
  );
}
