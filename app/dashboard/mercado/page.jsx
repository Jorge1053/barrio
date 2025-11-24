"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Store } from "lucide-react";

export default function MercadoPage() {
  const { perfil, user } = useAuth();
  const [negocios, setNegocios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!perfil) return;
    const load = async () => {
      const { data } = await supabase
        .from("negocios")
        .select("*")
        .order("created_at", { ascending: false });
      setNegocios(data || []);
    };
    load();
  }, [perfil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!perfil || !user) return;

    setLoading(true);
    await supabase.from("negocios").insert({
      usuario_id: user.id,
      barrio_id: perfil.barrio_id,
      nombre,
      categoria,
      descripcion,
      whatsapp,
    });
    setNombre("");
    setCategoria("");
    setDescripcion("");
    setWhatsapp("");
    setLoading(false);

    const { data } = await supabase
      .from("negocios")
      .select("*")
      .order("created_at", { ascending: false });
    setNegocios(data || []);
  };

  return (
    <DashboardShell>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold mb-1 flex items-center gap-2">
              <Store className="w-4 h-4 text-b-accent" />
              Mercado del barrio
            </h1>
            <p className="text-xs text-b-muted">
              Emprendimientos y servicios ofrecidos por tus vecinos.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-950/70 border border-b-border rounded-3xl p-4 space-y-3"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-b-muted mb-1 block">
                Nombre del negocio / servicio
              </label>
              <input
                className="w-full bg-slate-950/80 border border-b-border rounded-2xl px-3 py-2 text-sm"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-b-muted mb-1 block">
                Categoría
              </label>
              <input
                className="w-full bg-slate-950/80 border border-b-border rounded-2xl px-3 py-2 text-sm"
                placeholder="Comidas, plomería, clases, etc."
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-b-muted mb-1 block">
              Descripción
            </label>
            <textarea
              className="w-full bg-slate-950/80 border border-b-border rounded-2xl px-3 py-2 text-sm min-h-[60px]"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] text-b-muted mb-1 block">
              WhatsApp de contacto
            </label>
            <input
              className="w-full bg-slate-950/80 border border-b-border rounded-2xl px-3 py-2 text-sm"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Publicar negocio"}
            </Button>
          </div>
        </form>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {negocios.map((n) => (
            <article
              key={n.id}
              className="bg-slate-950/80 border border-b-border rounded-2xl p-3"
            >
              <h2 className="text-sm font-semibold mb-1.5">{n.nombre}</h2>
              <p className="text-[11px] text-b-accent mb-1">{n.categoria}</p>
              {n.descripcion && (
                <p className="text-xs text-slate-200 mb-2 line-clamp-3">
                  {n.descripcion}
                </p>
              )}
              {n.whatsapp && (
                <a
                  href={`https://wa.me/${n.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-b-accent underline"
                >
                  Escribir por WhatsApp
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
