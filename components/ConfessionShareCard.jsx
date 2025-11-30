// src/components/ConfessionShareCard.jsx
"use client";

import React, { forwardRef } from "react";

const categoryLabels = {
  amor: "Amor",
  estudio: "Estudio",
  familia: "Familia",
  trabajo: "Trabajo",
  plata: "Plata",
  random: "Random",
};

const intentionLabels = {
  advice: "Buscando consejo",
  vent: "Necesita desahogarse",
  story: "Historia para compartir",
};

const ConfessionShareCard = forwardRef(function ConfessionShareCard(
  { content, city, category, intention, shortId },
  ref
) {
  const safeContent = (content || "").trim();
  const truncated =
    safeContent.length > 260
      ? `${safeContent.slice(0, 240).trim()}…`
      : safeContent;

  const categoryText = categoryLabels[category] || "Confesión anónima";
  const intentionText =
    intentionLabels[intention] || "Compartiendo algo que siente";

  return (
    <div
      ref={ref}
      className="relative flex h-[480px] w-[270px] flex-col overflow-hidden rounded-3xl px-5 py-4"
      style={{
        // Degradado oscuro tipo slate que tenías antes
        background:
          "linear-gradient(180deg, #020617 0%, #0f172a 45%, #020617 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.65)",
        color: "#e5e7eb",
      }}
    >
      {/* Marca / header */}
      <div className="flex items-center justify-between text-[11px]">
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold tracking-wide"
          style={{
            backgroundColor: "rgba(15,23,42,0.7)", // bg-slate-900/70
            color: "#f9a8d4", // text-pink-200
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#fb7185" }} // pink-400
          />
          ConfesionarioAR
        </span>
        {shortId && (
          <span
            className="font-mono text-[10px]"
            style={{ color: "#94a3b8" }} // slate-400
          >
            #{shortId}
          </span>
        )}
      </div>

      {/* Info arriba derecha */}
      <div className="mt-3 flex flex-col items-end gap-1 text-[10px]">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1"
          style={{
            backgroundColor: "rgba(15,23,42,0.7)", // slate-900/70
            color: "#e5e7eb", // slate-200
          }}
        >
          {categoryText}
          {city ? ` · ${city}` : ""}
        </span>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1"
          style={{
            backgroundColor: "rgba(236,72,153,0.15)", // pink-500/15
            color: "#f9a8d4", // pink-200
          }}
        >
          {intentionText}
        </span>
      </div>

      {/* Texto central */}
      <div className="mt-6 flex flex-1 items-center">
        <div
          className="relative w-full rounded-2xl px-4 py-4"
          style={{
            backgroundColor: "rgba(2,6,23,0.6)", // slate-950/60
          }}
        >
          <span
            className="absolute -left-2 -top-1 text-4xl"
            style={{ color: "rgba(251,113,133,0.4)" }} // pink-400/40
          >
            “
          </span>
          <p
            className="relative whitespace-pre-wrap break-words text-[13px] leading-relaxed"
            style={{ color: "#f9fafb" }} // slate-50
          >
            {truncated}
          </p>
          <span
            className="absolute -bottom-4 right-3 text-4xl"
            style={{ color: "rgba(251,113,133,0.3)" }} // pink-400/30
          >
            ”
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex flex-col gap-1 text-[10px]">
        <div className="flex items-center justify-between">
          <span style={{ color: "#e5e7eb", fontWeight: 500 }}>
            Confesión anónima
          </span>
          {shortId && (
            <span
              className="font-mono text-[10px]"
              style={{ color: "#94a3b8" }} // slate-400
            >
              #{shortId}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span style={{ color: "#94a3b8" }}>
            Subilo a tus historias · sin nombres, sin datos.
          </span>
          <span
            className="font-semibold"
            style={{ color: "#f9a8d4" }} // pink-200
          >
            confesionario.ar
          </span>
        </div>
      </div>

      {/* Detalle decorativo */}
      <div
        className="pointer-events-none absolute -right-10 bottom-10 h-28 w-28 rounded-full blur-2xl"
        style={{
          backgroundColor: "rgba(236,72,153,0.15)", // glow rosado
        }}
      />
    </div>
  );
});

export default ConfessionShareCard;
