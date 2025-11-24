"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { MapPin } from "lucide-react";

export default function PerfilPage() {
  const { user, perfil } = useAuth();
  const [barrios, setBarrios] = useState([]);
  const [barrioId, setBarrioId] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("barrios")
        .select("*")
        .order("nombre");
      setBarrios(data || []);
    };
    load();
  }, []);

  useEffect(() => {
    if (perfil?.barrio_id) setBarrioId(perfil.barrio_id);
  }, [perfil]);

  const handleSave = async () => {
    if (!user) return;
    await supabase
      .from("usuarios_perfil")
      .update({ barrio_id: barrioId || null })
      .eq("id", user.id);
  };

  return (
    <DashboardShell>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold mb-1">Mi perfil</h1>
          <p className="text-xs text-b-muted">
            Ajusta tus datos básicos y el barrio al que perteneces.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-b-border rounded-3xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-b-accent-soft flex items-center justify-center text-sm font-semibold">
              {perfil?.nombre?.[0] || "V"}
            </div>
            <div>
              <p className="text-sm font-medium">{perfil?.nombre}</p>
              <p className="text-[11px] text-b-muted">{user?.email}</p>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-b-muted mb-1 block">
              Barrio / sector
            </label>
            <div className="flex gap-2 items-center">
              <MapPin className="w-4 h-4 text-b-accent" />
              <select
                className="flex-1 bg-slate-950/80 border border-b-border rounded-2xl px-3 py-2 text-sm"
                value={barrioId}
                onChange={(e) => setBarrioId(e.target.value)}
              >
                <option value="">Seleccionar barrio</option>
                {barrios.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre} – {b.ciudad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Guardar cambios</Button>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
