// src/app/confesiones/[id]/ConfessionDetailClient.jsx
"use client";

import { useState } from "react";
import ConfessionCard from "../../../components/ConfessionCard";

export default function ConfessionDetailClient({ initialConfession }) {
  const [confession, setConfession] = useState(initialConfession);

  async function handleReact(id, type) {
    try {
      const res = await fetch("/api/confesiones/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });
      if (!res.ok) throw new Error("Error en reacción");
      const { updatedCounts } = await res.json();

      setConfession((prev) =>
        prev && prev.id === id ? { ...prev, ...updatedCounts } : prev
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function handleReport(id, reason) {
    try {
      const res = await fetch("/api/confesiones/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason }),
      });
      if (!res.ok) throw new Error("Error al reportar");
    } catch (e) {
      console.error(e);
    }
  }

  if (!confession) {
    return (
      <main className="mx-auto max-w-2xl py-6">
        <p className="text-sm text-slate-400">
          No encontramos esta confesión. Puede que haya sido eliminada.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 py-6">
      <h1 className="text-base font-semibold text-slate-100">
        Confesión anónima
      </h1>
      <ConfessionCard
        confession={confession}
        onReact={handleReact}
        onReport={handleReport}
      />
    </main>
  );
}
