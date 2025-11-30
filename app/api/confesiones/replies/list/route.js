// src/app/api/confesiones/replies/list/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabaseServer";

export async function GET(req) {
  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const confessionId = searchParams.get("confession_id");

  if (!confessionId) {
    return NextResponse.json(
      { message: "Falta el id de la confesión." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("confession_replies")
    .select("id, confession_id, content, created_at, status, likes_count")
    .eq("confession_id", confessionId)
    .eq("status", "approved")
    .order("created_at", { ascending: false }); // 🔹 más recientes arriba

  if (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al cargar comentarios." },
      { status: 500 }
    );
  }

  return NextResponse.json({ items: data || [] });
}
