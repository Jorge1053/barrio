// src/app/api/confesiones/quote-of-day/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";

export async function GET() {
  const supabase = createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("confessions")
      .select(
        `
        id,
        city,
        university,
        category,
        intention,
        content,
        status,
        created_at,
        likes_count,
        wow_count,
        haha_count
      `
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("quote-of-day error:", error);
      return NextResponse.json(
        { message: "Error al cargar frase del día.", item: null },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ item: null });
    }

    // Elegimos una al azar de las últimas 10
    const idx = Math.floor(Math.random() * data.length);
    const item = data[idx];

    return NextResponse.json({ item });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Error interno al cargar frase del día.", item: null },
      { status: 500 }
    );
  }
}