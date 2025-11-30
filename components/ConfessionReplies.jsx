// src/components/ConfessionReplies.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ConfessionReplies({ confessionId }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Cargar comentarios aprobados iniciales
  useEffect(() => {
    if (!confessionId) return;
    loadReplies();

    // Suscripción Realtime
    const channel = supabase
      .channel(`confession-replies:${confessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "confession_replies",
          filter: `confession_id=eq.${confessionId}`,
        },
        (payload) => {
          const newReply = payload.new;
          // Solo mostramos los aprobados
          if (newReply.status !== "approved") return;

          setReplies((prev) => {
            // evitar duplicados (por si ya está en la lista)
            if (prev.some((r) => r.id === newReply.id)) return prev;
            return [...prev, newReply];
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // opcional: console.log("Suscrito a realtime replies");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confessionId]);

  async function loadReplies() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("confession_id", confessionId);

      const res = await fetch(`/api/confesiones/replies/list?${params}`);
      if (!res.ok) throw new Error("Error al cargar comentarios.");

      const data = await res.json();
      setReplies(data.items || []);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los comentarios.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    const content = text.trim();
    if (content.length < 10) {
      setError("Escribí al menos 10 caracteres.");
      return;
    }
    if (content.length > 800) {
      setError("Máximo 800 caracteres.");
      return;
    }

    // UI optimista: comentario temporal visible al toque
    const tempId = `temp-${Date.now()}`;
    const tempReply = {
      id: tempId,
      confession_id: confessionId,
      content,
      created_at: new Date().toISOString(),
      status: "local",
    };

    setReplies((prev) => [...prev, tempReply]);
    setText("");
    setSending(true);

    try {
      const res = await fetch("/api/confesiones/replies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confession_id: confessionId, content }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "No se pudo enviar el comentario.");
      }

      // Si el backend devuelve item aprobado → reemplazamos el temp
      if (data.item && data.item.status === "approved") {
        setReplies((prev) =>
          prev.map((r) => (r.id === tempId ? data.item : r))
        );
      } else {
        // Si quedó pendiente/no aprobado, removemos el temp
        setReplies((prev) => prev.filter((r) => r.id !== tempId));
      }

      if (data.message) {
        setInfo(data.message);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al enviar el comentario.");
      // si falló, quitamos el temp
      setReplies((prev) => prev.filter((r) => r.id !== tempId));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      {/* Título */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xs font-semibold text-slate-200">
          Comentarios anónimos
        </h3>
        <span className="text-[11px] text-slate-500">
          Mensajes de apoyo, sin nombres ni datos de contacto.
        </span>
      </header>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí un comentario corto, sin nombres ni datos personales..."
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>{text.trim().length} / 800</span>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center rounded-full bg-pink-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-pink-400 disabled:opacity-60"
          >
            {sending ? "Enviando..." : "Comentar"}
          </button>
        </div>
        {error && (
          <p className="text-[11px] text-red-300 bg-red-900/20 border border-red-800 rounded-xl px-2 py-1">
            {error}
          </p>
        )}
        {info && !error && (
          <p className="text-[11px] text-emerald-300 bg-emerald-900/20 border border-emerald-700 rounded-xl px-2 py-1">
            {info}
          </p>
        )}
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {loading && (
          <p className="text-[11px] text-slate-500">Cargando comentarios...</p>
        )}

        {!loading && replies.length === 0 && (
          <p className="text-[11px] text-slate-500">
            Nadie comentó todavía. Sé la primera persona en responder.
          </p>
        )}

        {replies.map((r) => (
          <article
            key={r.id}
            className="rounded-xl bg-slate-900/70 px-3 py-2 text-[12px] text-slate-100"
          >
            <p className="whitespace-pre-wrap break-words">{r.content}</p>
            <p className="mt-1 text-[10px] text-slate-500">
              {new Intl.DateTimeFormat("es-AR", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(r.created_at))}
              {r.status === "local" && " · enviando..."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
