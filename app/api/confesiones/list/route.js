// src/app/api/confesiones/list/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";

const PAGE_SIZE = 10;

export async function GET(req) {
  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(req.url);

  // Parámetros de query
  const pageParam = searchParams.get("page") || "1";
  const city = searchParams.get("city") || "todos";
  const category = searchParams.get("category") || "todos";
  const sort = searchParams.get("sort") || "new";
  const promptId = searchParams.get("prompt_id") || null;

  // Aseguramos página válida (>= 1)
  let page = parseInt(pageParam, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;

  // Base query
  let query = supabase
    .from("confessions")
    .select(
      `
      id,
      city,
      university,
      category,
      content,
      created_at,
      likes_count,
      wow_count,
      haha_count
    `,
      { count: "exact" }
    )
    .eq("status", "approved");

  // Filtros
  if (city && city !== "todos") {
    query = query.eq("city", city);
  }

  if (category && category !== "todos") {
    query = query.eq("category", category);
  }

  if (promptId) {
    query = query.eq("prompt_id", promptId);
  }

  // Orden
  if (sort === "top") {
    query = query
      .order("likes_count", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
  } else {
    // "new" por defecto
    query = query.order("created_at", { ascending: false });
  }

  // Paginación
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error al cargar confesiones:", error);
    return NextResponse.json(
      { message: "Error al cargar confesiones." },
      { status: 500 }
    );
  }

  const total = count || 0;
  const hasMore = to + 1 < total;

  return NextResponse.json({
    items: data || [],
    hasMore,
    total,
    page,
  });
}
