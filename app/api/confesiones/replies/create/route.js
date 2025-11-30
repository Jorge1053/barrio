// src/app/api/confesiones/replies/create/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { confession_id, content, fingerprint } = body || {};

    if (!confession_id || typeof confession_id !== "string") {
      return NextResponse.json(
        { message: "Falta el ID de la confesión." },
        { status: 400 }
      );
    }

    const text = (content || "").trim();
    if (text.length < 10) {
      return NextResponse.json(
        { message: "Escribí al menos 10 caracteres." },
        { status: 400 }
      );
    }
    if (text.length > 500) {
      return NextResponse.json(
        { message: "El comentario es demasiado largo. Máximo 500 caracteres." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("confession_replies")
      .insert({
        confession_id,
        content: text,
        status: "pending", // se aprobará desde el panel admin
        fingerprint: fingerprint || null,
      })
      .select("id, created_at, status")
      .single();

    if (error) {
      console.error("Error al crear reply:", error);
      return NextResponse.json(
        { message: "Error al enviar el comentario." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Comentario enviado. Se publicará cuando pase la moderación.",
        reply: data,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Error interno al enviar el comentario." },
      { status: 500 }
    );
  }
}
