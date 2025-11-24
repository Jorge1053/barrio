"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Home, MessageSquare } from "lucide-react";

const tipos = [
  { value: "general", label: "General", icon: Home },
  { value: "seguridad", label: "Seguridad", icon: ShieldCheck },
  { value: "mercado", label: "Mercado", icon: MessageSquare },
];

export default function MiBarrioPage() {
  const { user, perfil } = useAuth();
  const [selectedTipo, setSelectedTipo] = useState("general");
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    if (!perfil) return;
    const load = async () => {
      setLoadingFeed(true);
      const query = supabase
        .from("publicaciones")
        .select("*, usuarios_perfil ( nombre )")
        .order("created_at", { ascending: false })
        .limit(50);

      if (perfil.barrio_id) {
        query.eq("barrio_id", perfil.barrio_id);
      }

      const { data } = await query;
      setPosts(data || []);
      setLoadingFeed(false);
    };
    load();
  }, [perfil]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!user || !perfil) return;
    if (!titulo.trim()) return;

    setLoadingPost(true);

    await supabase.from("publicaciones").insert({
      usuario_id: user.id,
      barrio_id: perfil.barrio_id,
      tipo: selectedTipo,
      titulo: titulo.trim(),
      contenido: contenido.trim(),
    });

    setTitulo("");
    setContenido("");
    setLoadingPost(false);

    // reload feed
    const { data } = await supabase
      .from("publicaciones")
      .select("*, usuarios_perfil ( nombre )")
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts(data || []);
  };

  return (
    <DashboardShell>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold mb-1">Mi barrio</h1>
            <p className="text-xs text-b-muted">
              Comparte avisos, noticias o dudas con tus vecinos.
            </p>
          </div>
        </div>

        {/* Formulario de publicación */}
        <form
          onSubmit={handlePublish}
          className="bg-slate-950/70 border border-b-border rounded-3xl p-4 space-y-3"
        >
          <div className="flex flex-wrap gap-2 text-[11px]">
            {tipos.map((t) => {
              const Icon = t.icon;
              const active = selectedTipo === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setSelectedTipo(t.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all ${
                    active
                      ? "bg-b-accent-soft border-b-accent/70 text-b-accent"
                      : "bg-slate-950/80 border-b-border text-b-muted hover:text-b-text"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <input
            className="w-full bg-slate-950/80 border border-b-border rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-b-accent/60"
            placeholder="Título de tu publicación..."
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <textarea
            className="w-full bg-slate-950/80 border border-b-border rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-b-accent/60 min-h-[70px]"
            placeholder="Cuenta lo que está pasando, lo que necesitas o quieres compartir."
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={loadingPost}>
              {loadingPost ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </form>

        {/* Feed */}
        <div className="space-y-3">
          {loadingFeed && (
            <p className="text-xs text-b-muted">Cargando publicaciones...</p>
          )}

          {!loadingFeed && posts.length === 0 && (
            <p className="text-xs text-b-muted">
              Aún no hay publicaciones en tu barrio. Sé el primero en escribir
              algo.
            </p>
          )}

          {posts.map((p) => (
            <article
              key={p.id}
              className="bg-slate-950/80 border border-b-border rounded-3xl p-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-b-accent-soft flex items-center justify-center text-[11px] font-semibold">
                    {p.usuarios_perfil?.nombre?.[0] || "V"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">
                      {p.usuarios_perfil?.nombre || "Vecino"}
                    </span>
                    <span className="text-[10px] text-b-muted capitalize">
                      {p.tipo}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-b-muted">
                  {new Date(p.created_at).toLocaleString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
              <h2 className="text-sm font-medium mb-1.5">{p.titulo}</h2>
              {p.contenido && (
                <p className="text-xs text-slate-200">{p.contenido}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
