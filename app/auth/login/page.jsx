"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard/mi-barrio");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-b-card/80 border border-b-border rounded-3xl p-6 shadow-soft">
        <h1 className="text-xl font-semibold mb-1">Bienvenido a Barrio</h1>
        <p className="text-sm text-b-muted mb-6">
          Entra a tu comunidad y conecta con tus vecinos.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
            />
          </div>

          {err && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-3 py-2">
              {err}
            </p>
          )}

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-xs text-b-muted mt-5">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/auth/register" className="text-b-accent underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
}