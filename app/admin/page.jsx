// src/app/admin/page.jsx
"use client";

import { useEffect, useState } from "react";

const CONF_STATUS_LABELS = {
  pending: "Pendientes",
  approved: "Aprobadas",
  rejected: "Rechazadas",
};

export default function AdminDashboardPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("confessions"); // "confessions" | "reports"

  // Confesiones
  const [confStatusFilter, setConfStatusFilter] = useState("pending");
  const [confLoading, setConfLoading] = useState(false);
  const [confessions, setConfessions] = useState([]);

  // Reportes
  const [reportsHandledFilter, setReportsHandledFilter] = useState("unhandled"); // "unhandled" | "all"
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reports, setReports] = useState([]);

  // ---- AUTH ----
  async function handleLogin(e) {
    e.preventDefault();
    if (!token) return;
    setError("");
    // probamos cargando confesiones pendientes
    try {
      setConfLoading(true);
      const res = await fetch(`/api/admin/confesiones?status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Token inválido o error de servidor.");
      const data = await res.json();
      setConfessions(data.items || []);
      setAuthed(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al autenticar.");
      setAuthed(false);
    } finally {
      setConfLoading(false);
    }
  }

  // ---- CONFESIONES ----
  async function fetchConfessions(status = confStatusFilter) {
    if (!token) return;
    setConfLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("status", status);
      const res = await fetch(`/api/admin/confesiones?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar confesiones.");
      const data = await res.json();
      setConfessions(data.items || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cargando confesiones.");
    } finally {
      setConfLoading(false);
    }
  }

  async function handleConfessionAction(id, action) {
    if (!window.confirm(`¿Seguro que quieres ${action} esta confesión?`))
      return;
    try {
      const res = await fetch("/api/admin/confesiones", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error("Error al actualizar confesión.");
      await fetchConfessions();
      // después de afectar una confesión también recargamos reportes por si se eliminaron
      await fetchReports(reportsHandledFilter);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la confesión.");
    }
  }

  // ---- REPORTES ----
  async function fetchReports(filter = reportsHandledFilter) {
    if (!token) return;
    setReportsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filter === "unhandled") params.set("handled", "false");
      const res = await fetch(`/api/admin/reportes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar reportes.");
      const data = await res.json();
      setReports(data.items || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cargando reportes.");
    } finally {
      setReportsLoading(false);
    }
  }

  async function handleReportAction(reportId, action, confessionId) {
    // action: "mark_handled" | "mark_unhandled" | "delete_confession"
    let msg = "";
    if (action === "mark_handled") msg = "marcar este reporte como gestionado";
    if (action === "mark_unhandled") msg = "marcar este reporte como pendiente";
    if (action === "delete_confession")
      msg = "ELIMINAR la confesión y todos sus reportes";

    if (!window.confirm(`¿Seguro que quieres ${msg}?`)) return;

    try {
      const res = await fetch("/api/admin/reportes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportId, action, confessionId }),
      });
      if (!res.ok) throw new Error("Error al actualizar reporte.");
      await fetchReports();
      // si eliminaste confesión, refrescá lista de confesiones
      if (action === "delete_confession") {
        await fetchConfessions();
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el reporte.");
    }
  }

  // Si ya está autenticado y se cambia de pestaña/filtros, cargamos datos
  useEffect(() => {
    if (!authed) return;
    if (activeTab === "confessions") {
      fetchConfessions(confStatusFilter);
    } else if (activeTab === "reports") {
      fetchReports(reportsHandledFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, activeTab]);

  useEffect(() => {
    if (!authed) return;
    fetchConfessions(confStatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confStatusFilter]);

  useEffect(() => {
    if (!authed) return;
    fetchReports(reportsHandledFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportsHandledFilter]);

  // ---------- UI LOGIN ----------
  if (!authed) {
    return (
      <main className="max-w-md mx-auto space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Panel admin · Confesiones
        </h2>
        <p className="text-sm text-slate-400">
          Ingresa el token de administración para moderar confesiones y manejar
          reportes.
        </p>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ADMIN_API_TOKEN"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-full bg-pink-500 hover:bg-pink-400 text-slate-950 font-semibold"
          >
            Entrar
          </button>
        </form>
      </main>
    );
  }

  // ---------- UI DASHBOARD ----------
  return (
    <main className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Panel de moderación
          </h2>
          <p className="text-xs text-slate-400">
            Revisa confesiones, responde a reportes y mantén la comunidad
            segura.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("confessions")}
            className={`px-3 py-1 rounded-full border ${
              activeTab === "confessions"
                ? "bg-pink-500 text-slate-950 border-pink-400"
                : "bg-slate-950 border-slate-700 text-slate-300 hover:border-pink-400/60"
            }`}
          >
            Confesiones
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`px-3 py-1 rounded-full border ${
              activeTab === "reports"
                ? "bg-pink-500 text-slate-950 border-pink-400"
                : "bg-slate-950 border-slate-700 text-slate-300 hover:border-pink-400/60"
            }`}
          >
            Reportes
          </button>
        </div>
      </header>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* --------- TAB CONFESIONES --------- */}
      {activeTab === "confessions" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Estado actual:{" "}
              <span className="font-semibold text-slate-200">
                {CONF_STATUS_LABELS[confStatusFilter]}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 text-xs">
              <select
                className="bg-slate-950 border border-slate-700 rounded-full px-3 py-1 text-xs text-slate-200"
                value={confStatusFilter}
                onChange={(e) => setConfStatusFilter(e.target.value)}
              >
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobadas</option>
                <option value="rejected">Rechazadas</option>
              </select>
              <button
                type="button"
                onClick={() => fetchConfessions(confStatusFilter)}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs"
              >
                Refrescar
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {confLoading && (
              <p className="text-sm text-slate-400">Cargando confesiones...</p>
            )}
            {!confLoading && confessions.length === 0 && (
              <p className="text-sm text-slate-400">
                No hay confesiones en este estado.
              </p>
            )}
            {confessions.map((c) => (
              <article
                key={c.id}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>
                    {c.city}
                    {c.university ? ` · ${c.university}` : ""} ·{" "}
                    <span className="uppercase">{c.category}</span>
                  </span>
                  <span>{new Date(c.created_at).toLocaleString("es-AR")}</span>
                </div>
                <p className="text-slate-100 whitespace-pre-wrap mb-3">
                  {c.content}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 mb-2">
                  <span>
                    ❤️ {c.likes_count} · 😮 {c.wow_count} · 😂 {c.haha_count}
                  </span>
                  <span>
                    Estado:{" "}
                    <span
                      className={
                        c.status === "approved"
                          ? "text-emerald-400"
                          : c.status === "rejected"
                          ? "text-yellow-400"
                          : "text-sky-400"
                      }
                    >
                      {CONF_STATUS_LABELS[c.status] || c.status}
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {c.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => handleConfessionAction(c.id, "approve")}
                      className="px-3 py-1 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 font-medium"
                    >
                      Aprobar
                    </button>
                  )}
                  {c.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => handleConfessionAction(c.id, "reject")}
                      className="px-3 py-1 rounded-full bg-yellow-500/90 hover:bg-yellow-400 text-slate-950 font-medium"
                    >
                      Rechazar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleConfessionAction(c.id, "delete")}
                    className="px-3 py-1 rounded-full bg-red-600/90 hover:bg-red-500 text-slate-50"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* --------- TAB REPORTES --------- */}
      {activeTab === "reports" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Mostrando:{" "}
              <span className="font-semibold text-slate-200">
                {reportsHandledFilter === "unhandled"
                  ? "Reportes pendientes"
                  : "Todos los reportes"}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 text-xs">
              <select
                className="bg-slate-950 border border-slate-700 rounded-full px-3 py-1 text-xs text-slate-200"
                value={reportsHandledFilter}
                onChange={(e) => setReportsHandledFilter(e.target.value)}
              >
                <option value="unhandled">Pendientes</option>
                <option value="all">Todos</option>
              </select>
              <button
                type="button"
                onClick={() => fetchReports(reportsHandledFilter)}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs"
              >
                Refrescar
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {reportsLoading && (
              <p className="text-sm text-slate-400">Cargando reportes...</p>
            )}
            {!reportsLoading && reports.length === 0 && (
              <p className="text-sm text-slate-400">
                No hay reportes para este filtro.
              </p>
            )}
            {reports.map((r) => (
              <article
                key={r.id}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>
                    Reporte ·{" "}
                    {r.handled ? (
                      <span className="text-emerald-400 font-medium">
                        Gestionado
                      </span>
                    ) : (
                      <span className="text-yellow-400 font-medium">
                        Pendiente
                      </span>
                    )}
                  </span>
                  <span>{new Date(r.created_at).toLocaleString("es-AR")}</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  Motivo del reporte:{" "}
                  <span className="text-slate-100">{r.reason}</span>
                </p>

                {r.confession ? (
                  <div className="mt-2 rounded-lg bg-slate-950/60 border border-slate-800 p-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>
                        {r.confession.city}
                        {r.confession.university
                          ? ` · ${r.confession.university}`
                          : ""}{" "}
                        · {r.confession.category}
                      </span>
                      <span>
                        {new Date(r.confession.created_at).toLocaleString(
                          "es-AR"
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-100 whitespace-pre-wrap mb-1">
                      {r.confession.content.length > 300
                        ? r.confession.content.slice(0, 300) + "..."
                        : r.confession.content}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Estado actual:{" "}
                      <span
                        className={
                          r.confession.status === "approved"
                            ? "text-emerald-400"
                            : r.confession.status === "rejected"
                            ? "text-yellow-400"
                            : "text-sky-400"
                        }
                      >
                        {CONF_STATUS_LABELS[r.confession.status] ||
                          r.confession.status}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">
                    La confesión asociada ya no existe (fue eliminada).
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {!r.handled && (
                    <button
                      type="button"
                      onClick={() =>
                        handleReportAction(
                          r.id,
                          "mark_handled",
                          r.confession?.id
                        )
                      }
                      className="px-3 py-1 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 font-medium"
                    >
                      Marcar gestionado
                    </button>
                  )}
                  {r.handled && (
                    <button
                      type="button"
                      onClick={() =>
                        handleReportAction(
                          r.id,
                          "mark_unhandled",
                          r.confession?.id
                        )
                      }
                      className="px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-100"
                    >
                      Volver a pendiente
                    </button>
                  )}
                  {r.confession && (
                    <button
                      type="button"
                      onClick={() =>
                        handleReportAction(
                          r.id,
                          "delete_confession",
                          r.confession.id
                        )
                      }
                      className="px-3 py-1 rounded-full bg-red-600/90 hover:bg-red-500 text-slate-50"
                    >
                      Eliminar confesión
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
