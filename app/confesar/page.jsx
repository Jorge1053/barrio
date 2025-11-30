// src/app/confesar/page.jsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const CITIES = [
  "Buenos Aires",
  "Córdoba",
  "Rosario",
  "Mendoza",
  "La Plata",
  "Otras",
];

const CATEGORIES = [
  { value: "amor", label: "Amor" },
  { value: "estudio", label: "Estudio" },
  { value: "familia", label: "Familia" },
  { value: "trabajo", label: "Trabajo" },
  { value: "plata", label: "Plata" },
  { value: "random", label: "Random" },
];

const INTENTIONS = [
  {
    value: "advice",
    label: "Necesito consejo",
    description:
      "Querés que otras personas te den ideas, perspectivas y sugerencias concretas.",
  },
  {
    value: "vent",
    label: "Solo desahogo",
    description:
      "Solo querés sacártelo de encima. Si te responden, mejor, pero no es obligatorio.",
  },
  {
    value: "story",
    label: "Historia random",
    description:
      "Algo que te pasó (gracioso, raro, intenso) y lo querés compartir con la comunidad.",
  },
];

export default function ConfesarPage() {
  const searchParams = useSearchParams();
  const promptIdFromUrl = searchParams.get("prompt_id");

  const [form, setForm] = useState({
    city: "",
    university: "",
    category: "amor",
    content: "",
    intention: "advice", // 🔹 default: consejo, no desahogo
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function updateField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.city) {
      setError("Seleccioná una ciudad.");
      return;
    }
    if (!form.category) {
      setError("Seleccioná una categoría.");
      return;
    }
    if (!form.intention) {
      setError("Contanos qué esperás de esta confesión.");
      return;
    }

    const length = form.content.trim().length;
    if (length < 30) {
      setError(
        "Escribí al menos 30 caracteres para que se entienda la historia."
      );
      return;
    }
    if (length > 2000) {
      setError("La confesión es demasiado larga. Máximo 2000 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        city: form.city,
        university: form.university || null,
        category: form.category,
        content: form.content,
        intention: form.intention, // 🔹 se manda tal cual
        prompt_id: promptIdFromUrl || null,
      };

      const res = await fetch("/api/confesiones/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al enviar la confesión.");
      }

      setSubmitted(true);
      setForm({
        city: "",
        university: "",
        category: "amor",
        content: "",
        intention: "advice", // 🔹 reset a consejo
      });
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al enviar la confesión.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="max-w-2xl mx-auto space-y-4">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Gracias por tu confianza 💜
          </h2>
          <p className="text-sm text-slate-300">
            Tu confesión se envió y será revisada según las reglas de la
            comunidad. No se publican nombres, ni datos personales, ni contenido
            que pueda dañar a alguien.
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 text-sm rounded-full bg-pink-500 hover:bg-pink-400 text-slate-950 font-medium"
          >
            Enviar otra confesión
          </button>
          <Link
            href="/confesiones"
            className="px-4 py-2 text-sm rounded-full border border-slate-600 hover:bg-slate-800 text-slate-100"
          >
            Ver confesiones
          </Link>
        </div>
      </main>
    );
  }

  const currentIntention =
    INTENTIONS.find((i) => i.value === form.intention) ?? INTENTIONS[0];

  return (
    <main className="max-w-2xl mx-auto space-y-5">
      {/* INTRO */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-100">
          Confesá de forma anónima
        </h2>
        <p className="text-sm text-slate-400">
          No escribas nombres completos, direcciones, teléfonos, redes ni nada
          que identifique directamente a una persona. Tampoco se permite odio,
          amenazas ni incitación a la violencia.
        </p>

        {promptIdFromUrl && (
          <p className="text-xs text-pink-200 bg-pink-500/10 border border-pink-500/40 rounded-xl px-3 py-2">
            Estás respondiendo a la{" "}
            <span className="font-semibold">pregunta del día</span>. Recordá que
            igual se aplican todas las reglas de la comunidad.
          </p>
        )}
      </section>

      {/* FORMULARIO */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
      >
        {/* Ciudad / Universidad */}
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Ciudad <span className="text-pink-400">*</span>
            </label>
            <select
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/70"
            >
              <option value="">Seleccioná una ciudad</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Universidad (opcional)
            </label>
            <input
              type="text"
              value={form.university}
              onChange={(e) => updateField("university", e.target.value)}
              placeholder="Ej: UBA, UTN, UNLP..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/70"
            />
          </div>
        </div>

        {/* Categoría */}
        <div className="space-y-1.5 text-sm">
          <label className="block text-xs font-medium text-slate-300">
            Tema principal <span className="text-pink-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => updateField("category", c.value)}
                className={`px-3 py-1 rounded-full border text-xs transition-colors ${
                  form.category === c.value
                    ? "bg-pink-500 text-slate-950 border-pink-400"
                    : "bg-slate-950 border-slate-700 text-slate-300 hover:border-pink-400/60"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intención */}
        <div className="space-y-1.5 text-sm">
          <label className="block text-xs font-medium text-slate-300">
            ¿Qué esperás de esta confesión?{" "}
            <span className="text-pink-400">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {INTENTIONS.map((opt) => {
              const active = form.intention === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField("intention", opt.value)}
                  className={`flex flex-col items-start gap-1 rounded-2xl border px-3 py-2 text-left text-xs transition-colors ${
                    active
                      ? "border-pink-400 bg-pink-500/15 text-pink-100"
                      : "border-slate-700 bg-slate-950 text-slate-200 hover:border-pink-400/60"
                  }`}
                >
                  <span className="font-semibold text-[11px]">{opt.label}</span>
                  <span className="text-[11px] text-slate-400">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-1 text-[11px] text-slate-500">
            Esto ayuda a que la comunidad sepa si necesitás consejo, apoyo o si
            solo querés compartir algo que te pasó.
          </p>
        </div>

        {/* Texto de la confesión */}
        <div className="space-y-1.5 text-sm">
          <label className="block text-xs font-medium text-slate-300">
            Tu confesión <span className="text-pink-400">*</span>
          </label>
          <textarea
            value={form.content}
            onChange={(e) => updateField("content", e.target.value)}
            rows={8}
            placeholder="Contá lo que quieras compartir, sin nombres ni datos personales..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/70 resize-none"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Mínimo 30 caracteres · Máximo 2000</span>
            <span>{form.content.trim().length} / 2000</span>
          </div>

          <p className="mt-1 text-[11px] text-slate-400">
            Modo seleccionado:{" "}
            <span className="font-semibold text-pink-200">
              {currentIntention.label}
            </span>
            . {currentIntention.description}
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        {/* Botón submit */}
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm rounded-full bg-pink-500 hover:bg-pink-400 text-slate-950 font-semibold disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Enviar confesión anónima"}
        </button>

        {/* Nota legal */}
        <p className="text-[11px] text-slate-500">
          Al enviar aceptás las{" "}
          <Link href="/reglas" className="text-pink-300 underline">
            reglas de la comunidad
          </Link>
          . No se almacena tu nombre ni tu email.
        </p>
      </form>
    </main>
  );
}
