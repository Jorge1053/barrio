// src/app/api/admin/reportes/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";

// 🔐 Verifica el token de admin que mandas desde el panel
function checkAuth(req) {
  const header = req.headers.get("authorization") || "";
  const [, token] = header.split(" ");
  return token && token === process.env.ADMIN_API_TOKEN;
}

// ✅ GET /api/admin/reportes?handled=false|true
export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const handledParam = searchParams.get("handled"); // "true" | "false" | null

  // 🔹 Traemos el reporte + la confesión asociada
  let query = supabase
    .from("reports")
    .select(
      `
      id,
      confession_id,
      reason,
      created_at,
      handled,
      confession:confessions(
        id,
        city,
        university,
        category,
        content,
        created_at,
        status,
        likes_count,
        wow_count,
        haha_count
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (handledParam === "true") {
    query = query.eq("handled", true);
  } else if (handledParam === "false") {
    query = query.eq("handled", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error GET /api/admin/reportes:", error);
    return NextResponse.json(
      { message: "Error al cargar reportes" },
      { status: 500 }
    );
  }

  return NextResponse.json({ items: data || [] });
}

// ✅ PATCH /api/admin/reportes
// body: { reportId, action: "mark_handled" | "mark_unhandled" | "delete_confession", confessionId }
export async function PATCH(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const body = await req.json();
  const { reportId, action, confessionId } = body || {};

  if (
    !reportId ||
    !["mark_handled", "mark_unhandled", "delete_confession"].includes(action)
  ) {
    return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
  }

  try {
    // 👉 Marcar reporte como gestionado
    if (action === "mark_handled") {
      const { error } = await supabase
        .from("reports")
        .update({ handled: true })
        .eq("id", reportId);

      if (error) throw error;

      return NextResponse.json({ message: "Reporte marcado como gestionado" });
    }

    // 👉 Volver a pendiente
    if (action === "mark_unhandled") {
      const { error } = await supabase
        .from("reports")
        .update({ handled: false })
        .eq("id", reportId);

      if (error) throw error;

      return NextResponse.json({ message: "Reporte vuelto a pendiente" });
    }

    // 👉 Eliminar confesión (y por FK se borran reportes asociados)
    if (action === "delete_confession") {
      if (!confessionId) {
        return NextResponse.json(
          { message: "Falta confessionId para eliminar confesión" },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("confessions")
        .delete()
        .eq("id", confessionId);

      if (error) throw error;

      return NextResponse.json({
        message: "Confesión y reportes asociados eliminados",
      });
    }

    return NextResponse.json(
      { message: "Acción no reconocida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error PATCH /api/admin/reportes:", error);
    return NextResponse.json(
      { message: "Error al procesar la acción" },
      { status: 500 }
    );
  }
}
