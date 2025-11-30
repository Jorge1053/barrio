// src/app/api/confesiones/replies/create/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabaseServer";
import { autoModerateText } from "../../../../../lib/moderation";
import { getRequestFingerprint } from "../../../../../lib/fingerprint";

export async function POST(req) {
  const supabase = createSupabaseServerClient();

  try {
    const body = await req.json();
    const { confession_id, content } = body || {};

    // Validaciones básicas
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

    if (text.length > 800) {
      return NextResponse.json(
        { message: "Máximo 800 caracteres." },
        { status: 400 }
      );
    }

    // Moderación automática (OpenAI)
    const moderation = await autoModerateText(text);

    // Bloqueo solo para cosas MUY graves
    if (!moderation.allowed && moderation.level === "hard") {
      return NextResponse.json(
        {
          message:
            moderation.message ??
            "Tu comentario no cumple las normas de la comunidad.",
        },
        { status: 400 }
      );
    }

    // Fingerprint del cliente
    const fingerprint = getRequestFingerprint(req.headers);

    // Guardar como aprobado para que se vea al toque
    const { data, error } = await supabase
      .from("confession_replies")
      .insert({
        confession_id,
        content: text,
        status: "approved",
        fingerprint,
      })
      .select(
        `
        id,
        confession_id,
        content,
        created_at,
        status
      `
      )
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
        message: "Comentario publicado.",
        item: data,
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
