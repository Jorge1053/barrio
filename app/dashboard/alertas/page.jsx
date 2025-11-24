"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default function AlertasPage() {
  const { perfil, user } = useAuth();
  const [tipo, setTipo] = useState("sospecha");
  const [descripcion, setDescripcion] = useState("");
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!perfil) return;
    const load = async () => {
      const { data } = await supabase
        .from("alertas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      setAlertas(data || []);
    };
    load();
  }, [perfil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !perfil) return;
    setLoading(true);
    await supabase.from("alertas").insert({
      usuario_id: user.id,
      barrio_id: perfil.barrio_id,
      tipo,
      descripcion,
    });
    setDescripcion("");
    setLoading(false);

    const { data } = await supabase
      .from("alertas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    setAlertas(data || []);
  };

  return (
    <DashboardShell>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold mb-1 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-b-accent" />
              Alertas del barrio
            </h1>
            <p className="text-xs text-b-muted">
              Comparte situaciones de riesgo o problemas urgentes en tu entorno.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-950/70 border border-b-border rounded-3xl p-4 space-y-3"
        >
          <div className="flex gap-2 text-[11px]">
            {["sospecha", "robo", "servicio", "otro"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`px-3 py-1.5 rounded-full border capitalize ${
                  tipo === t
                    ? "bg-red-500/10 border-red-500/70 text-red-400"
                    : "bg-slate-950/80 border-b-border text-b-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <textarea
            className="w-full bg-slate-950/80 border border-b-border rounded-2xl px-3 py-2 text-sm min-h-[70px]"
            placeholder="Describe qué está pasando. No compartas datos personales sensibles."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar alerta"}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          {alertas.map((a) => (
            <article
              key={a.id}
              className="bg-slate-950/80 border border-b-border rounded-2xl p-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-red-400 capitalize">
                  {a.tipo}
                </span>
                <span className="text-[10px] text-b-muted">
                  {new Date(a.created_at).toLocaleString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-100">{a.descripcion}</p>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
