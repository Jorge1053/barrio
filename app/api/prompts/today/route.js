// src/app/api/prompts/today/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer"; // ajusta ruta

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("daily_prompts")
      .select("*")
      .or("active_to.is.null,active_to.gt." + now)
      .eq("is_active", true)
      .lte("active_from", now)
      .order("active_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("today prompt error", error);
      return NextResponse.json(
        { error: "Error obteniendo la pregunta del día" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ prompt: null });
    }

    return NextResponse.json({ prompt: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
