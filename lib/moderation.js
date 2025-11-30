// src/app/api/confesiones/replies/create/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabaseServer";
import { autoModerateText } from "../../../../../lib/moderation";
import { getClientFingerprint } from "../../../../../lib/fingerprint"; // si ya lo usas

export async function POST(req) {
  const supabase = createSupabaseServerClient();

  try {
    const body = await req.json();
    const { confession_id, content } = body || {};

    if (!confession_id || !content) {
      return NextResponse.json(
        { message: "Faltan datos para comentar." },
        { status: 400 }
      );
    }

    const trimmed = content.trim();
    if (!trimmed) {
      return NextResponse.json(
        { message: "El comentario no puede estar vacío." },
        { status: 400 }
      );
    }

    // Moderación automática
    const moderation = await autoModerateText(trimmed);

    if (!moderation.allowed && moderation.level === "hard") {
      // Bloqueo directo
      return NextResponse.json(
        {
          message: moderation.message ?? "El comentario no cumple las reglas.",
        },
        { status: 400 }
      );
    }

    // status según resultado
    const status = moderation.allowed ? "approved" : "pending";

    // Fingerprint opcional
    const fingerprint = await getClientFingerprint?.(req);

    const { data, error } = await supabase
      .from("confession_replies")
      .insert({
        confession_id,
        content: trimmed,
        fingerprint: fingerprint || null,
        status,
        moderation_reason: moderation.reason,
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
      console.error(error);
      return NextResponse.json(
        { message: "No se pudo guardar el comentario." },
        { status: 500 }
      );
    }

    // Si quedó pending, no lo devolvemos para UI (no aparece al toque)
    if (data.status !== "approved") {
      return NextResponse.json(
        {
          message:
            moderation.message ??
            "Tu comentario quedó en revisión antes de publicarse.",
          item: null,
        },
        { status: 200 }
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
      { message: "Error inesperado al procesar el comentario." },
      { status: 500 }
    );
  }
}
