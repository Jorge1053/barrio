// src/app/api/confesiones/list/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";

const PAGE_SIZE = 10;

export async function GET(req) {
  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const city = searchParams.get("city") || "todos";
  const category = searchParams.get("category") || "todos";
  const sort = searchParams.get("sort") || "new";

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("confessions")
    .select(
      `
      id,
      city,
      university,
      category,
      content,
      status,
      created_at,
      likes_count,
      wow_count,
      haha_count,
      intention
    `
    )
    .eq("status", "approved");

  if (city !== "todos") {
    query = query.eq("city", city);
  }

  if (category !== "todos") {
    query = query.eq("category", category);
  }

  if (sort === "top") {
    // ordenar por reacciones totales (likes + wow + haha)
    query = query
      .order("likes_count", { ascending: false, nullsFirst: false })
      .order("wow_count", { ascending: false, nullsFirst: false })
      .order("haha_count", { ascending: false, nullsFirst: false });
  } else {
    // "new" → más nuevas primero
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error("Error al listar confesiones:", error);
    return NextResponse.json(
      { message: "Error al cargar confesiones." },
      { status: 500 }
    );
  }

  const items = (data || []).map((c) => ({
    ...c,
    likes_count: c.likes_count ?? 0,
    wow_count: c.wow_count ?? 0,
    haha_count: c.haha_count ?? 0,
  }));

  const hasMore = items.length === PAGE_SIZE;

  return NextResponse.json({ items, hasMore });
}
