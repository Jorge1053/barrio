// src/app/api/confesiones/report/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, reason } = body || {};

    if (!id || !reason || reason.trim().length < 5) {
      return NextResponse.json(
        { message: "Datos inválidos." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("reports").insert({
      confession_id: id,
      reason: reason.trim(),
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Error al guardar el reporte." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Reporte enviado." }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Error inesperado." }, { status: 500 });
  }
}
