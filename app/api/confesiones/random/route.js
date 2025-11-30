// src/app/api/confesiones/random/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer"; // ajusta ruta si hace falta

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Number(limitParam) || 1, 3); // máx 3 por llamada

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase.rpc("confessions_random", {
      p_limit: limit,
    });

    if (error) {
      console.error("confessions_random error", error);
      return NextResponse.json(
        { error: "Error obteniendo confesiones aleatorias" },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
