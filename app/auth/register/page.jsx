"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [nombre, setNombre] = useState("");
  const [barrioId, setBarrioId] = useState("");
  const [barrios, setBarrios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const router = useRouter();

  useEffect(() => {
    const loadBarrios = async () => {
      const { data } = await supabase
        .from("barrios")
        .select("*")
        .order("nombre");
      setBarrios(data || []);
    };
    loadBarrios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (error) {
      setLoading(false);
      setErr(error.message);
      return;
    }

    const user = data.user;
    if (!user) {
      setLoading(false);
      setErr("No se pudo crear el usuario.");
      return;
    }

    await supabase.from("usuarios_perfil").insert({
      id: user.id,
      nombre,
      barrio_id: barrioId || null,
      rol: "vecino",
    });

    setLoading(false);
    router.push("/dashboard/mi-barrio");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-b-card/80 border border-b-border rounded-3xl p-6 shadow-soft">
        <h1 className="text-xl font-semibold mb-1">Crear cuenta</h1>
        <p className="text-sm text-b-muted mb-6">
          Une tu correo con tu barrio y empecemos.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-b-muted mb-1 block">
              Nombre y apellido
            </label>
            <input
              className="w-full rounded-xl bg-slate-950/70 border border-b-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-b-accent/60"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs text-b-muted mb-1 block">Email</label>
            <input
              type="email"
              className="w-full rounded-xl bg-slate-950/70 border border-b-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-b-accent/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs text-b-muted mb-1 block">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-xl bg-slate-950/70 border border-b-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-b-accent/60"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="text-xs text-b-muted mb-1 block">
              Barrio / sector
            </label>
            <select
              className="w-full rounded-xl bg-slate-950/70 border border-b-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-b-accent/60"
              value={barrioId}
              onChange={(e) => setBarrioId(e.target.value)}
            >
              <option value="">Lo elegiré después</option>
              {barrios.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre} – {b.ciudad}
                </option>
              ))}
            </select>
          </div>

          {err && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-3 py-2">
              {err}
            </p>
          )}

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta y entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
