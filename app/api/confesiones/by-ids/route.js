// src/app/api/confesiones/by-ids/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";

export async function POST(req) {
  try {
    const supabase = createSupabaseServerClient();
    const body = await req.json();
    const { ids } = body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "No se recibieron IDs." },
        { status: 400 }
      );
    }

    // quitamos duplicados
    const uniqueIds = [...new Set(ids)];

    const { data, error } = await supabase
      .from("confessions")
      .select(
        `
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
      `
      )
      .in("id", uniqueIds)
      .eq("status", "approved"); // solo mostramos aprobadas

    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Error al cargar confesiones favoritas." },
        { status: 500 }
      );
    }

    const items = (data || []).sort((a, b) => {
      const ia = uniqueIds.indexOf(a.id);
      const ib = uniqueIds.indexOf(b.id);
      return ia - ib;
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Error inesperado." }, { status: 500 });
  }
}