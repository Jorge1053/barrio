// src/app/api/admin/confesiones/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";

function checkAuth(req) {
  const header = req.headers.get("authorization") || "";
  const [, token] = header.split(" ");
  return token && token === process.env.ADMIN_API_TOKEN;
}

// GET /api/admin/confesiones?status=pending|approved|rejected
export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";

  const { data, error } = await supabase
    .from("confessions")
    .select(
      "id, city, university, category, content, created_at, status, likes_count, wow_count, haha_count"
    )
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al cargar confesiones" },
      { status: 500 }
    );
  }

  return NextResponse.json({ items: data || [] });
}

// PATCH /api/admin/confesiones
// body: { id, action: "approve" | "reject" | "delete" }
export async function PATCH(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const body = await req.json();
  const { id, action } = body || {};

  if (!id || !["approve", "reject", "delete"].includes(action)) {
    return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
  }

  try {
    if (action === "delete") {
      const { error } = await supabase.from("confessions").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ message: "Confesión eliminada" });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";
    const { error } = await supabase
      .from("confessions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Confesión actualizada" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al actualizar confesión" },
      { status: 500 }
    );
  }
}
