// src/components/ConfessionReplies.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { Heart } from "lucide-react";

const REPLY_LIKES_KEY = "confesionario:reply_likes";

const INTENTION_COPY = {
  advice: {
    title: "Respuestas de la comunidad",
    subtitle:
      "Dejá un consejo respetuoso y concreto. No juzgues, sumá perspectiva.",
    placeholder:
      "¿Qué consejo o perspectiva le darías? Evitá nombres, diagnósticos o juicios fuertes...",
    cta: "Dar un consejo",
  },
  vent: {
    title: "Mensajes de apoyo anónimos",
    subtitle:
      "Respondé con empatía. A veces alcanza con decir “te entiendo” o “no estás sola/o”.",
    placeholder:
      "Escribí un mensaje de apoyo o contá algo breve que pueda hacerle sentir menos sola/o...",
    cta: "Enviar apoyo",
  },
  story: {
    title: "Comentarios de la comunidad",
    subtitle:
      "Podés reaccionar, sumar tu experiencia o hacer una pregunta desde el respeto.",
    placeholder:
      "Comentá qué te generó esta historia, si te pasó algo parecido o qué pensás...",
    cta: "Comentar",
  },
};

export default function ConfessionReplies({ confessionId, intention }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [likedReplies, setLikedReplies] = useState([]);
  const [likingId, setLikingId] = useState(null);

  const mode = useMemo(() => {
    if (
      intention === "advice" ||
      intention === "story" ||
      intention === "vent"
    ) {
      return intention;
    }
    return "vent";
  }, [intention]);

  const copy = INTENTION_COPY[mode];

  // Cargar "likes" locales
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(REPLY_LIKES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setLikedReplies(parsed);
      }
    } catch {
      // ignorar
    }
  }, []);

  // Cargar comentarios aprobados iniciales
  useEffect(() => {
    if (!confessionId) return;
    loadReplies();

    // Suscripción Realtime a INSERT (nuevos comentarios)
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
          if (newReply.status !== "approved") return;

          setReplies((prev) => {
            if (prev.some((r) => r.id === newReply.id)) return prev;
            const withLikes =
              typeof newReply.likes_count === "number"
                ? newReply
                : { ...newReply, likes_count: 0 };
            // más recientes arriba
            return [withLikes, ...prev];
          });
        }
      )
      .subscribe();

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
      const items = (data.items || []).map((r) => ({
        ...r,
        likes_count: typeof r.likes_count === "number" ? r.likes_count : 0,
      }));
      setReplies(items);
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

    const tempId = `temp-${Date.now()}`;
    const tempReply = {
      id: tempId,
      confession_id: confessionId,
      content,
      created_at: new Date().toISOString(),
      status: "local",
      likes_count: 0,
    };

    setReplies((prev) => [tempReply, ...prev]);
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

      if (data.item && data.item.status === "approved") {
        setReplies((prev) => {
          const withoutTemp = prev.filter((r) => r.id !== tempId);
          const exists = withoutTemp.some((r) => r.id === data.item.id);
          const normalized = {
            ...data.item,
            likes_count:
              typeof data.item.likes_count === "number"
                ? data.item.likes_count
                : 0,
          };
          return exists ? withoutTemp : [normalized, ...withoutTemp];
        });
      } else {
        setReplies((prev) => prev.filter((r) => r.id !== tempId));
      }

      if (data.message) {
        setInfo(data.message);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al enviar el comentario.");
      setReplies((prev) => prev.filter((r) => r.id !== tempId));
    } finally {
      setSending(false);
    }
  }

  function persistLikedReplies(next) {
    setLikedReplies(next);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(REPLY_LIKES_KEY, JSON.stringify(next));
      }
    } catch {
      // ignorar
    }
  }

  async function handleLike(replyId) {
    if (!replyId || likingId === replyId) return;

    const alreadyLiked = likedReplies.includes(replyId);
    const action = alreadyLiked ? "unlike" : "like";
    const delta = alreadyLiked ? -1 : 1;

    setLikingId(replyId);
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? { ...r, likes_count: Math.max(0, (r.likes_count || 0) + delta) }
          : r
      )
    );

    const nextLiked = alreadyLiked
      ? likedReplies.filter((id) => id !== replyId)
      : [...likedReplies, replyId];
    persistLikedReplies(nextLiked);

    try {
      const res = await fetch("/api/confesiones/replies/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_id: replyId, action }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "No se pudo registrar el like.");
      }

      if (data.item) {
        setReplies((prev) =>
          prev.map((r) => (r.id === replyId ? data.item : r))
        );
      }
    } catch (e) {
      console.error(e);
      const revertDelta = -delta;
      setReplies((prev) =>
        prev.map((r) =>
          r.id === replyId
            ? {
                ...r,
                likes_count: Math.max(0, (r.likes_count || 0) + revertDelta),
              }
            : r
        )
      );
      persistLikedReplies(likedReplies);
    } finally {
      setLikingId(null);
    }
  }

  return (
    <section className="mt-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      {/* Título */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xs font-semibold text-slate-200">{copy.title}</h3>
        <span className="text-[11px] text-slate-500">{copy.subtitle}</span>
      </header>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={copy.placeholder}
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>{text.trim().length} / 800</span>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center rounded-full bg-pink-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-pink-400 disabled:opacity-60"
          >
            {sending ? "Enviando..." : copy.cta}
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

        {replies.map((r) => {
          const liked = likedReplies.includes(r.id);
          const likeCount = r.likes_count ?? 0;

          return (
            <article
              key={r.id}
              className="rounded-xl bg-slate-900/70 px-3 py-2 text-[12px] text-slate-100"
            >
              <p className="whitespace-pre-wrap break-words">{r.content}</p>

              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>
                  {new Intl.DateTimeFormat("es-AR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(r.created_at))}
                  {r.status === "local" && " · enviando..."}
                </span>

                <button
                  type="button"
                  onClick={() => handleLike(r.id)}
                  disabled={likingId === r.id}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-1 text-[10px] text-slate-200 hover:bg-slate-700 disabled:opacity-60"
                  aria-label={liked ? "Quitar apoyo" : "Dar apoyo"}
                >
                  <Heart
                    className={`h-3.5 w-3.5 transition-colors ${
                      liked ? "text-pink-400 fill-pink-400" : "text-slate-300"
                    }`}
                  />
                  <span>{likeCount}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
