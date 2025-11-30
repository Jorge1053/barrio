// src/app/api/confesiones/replies/like/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabaseServer";

export async function POST(req) {
  const supabase = createSupabaseServerClient();

  try {
    const body = await req.json();
    const { reply_id, action } = body || {};

    if (!reply_id || !["like", "unlike"].includes(action)) {
      return NextResponse.json(
        { message: "Datos inválidos para registrar el like." },
        { status: 400 }
      );
    }

    // 1) Traer el comentario actual
    const { data: current, error: fetchError } = await supabase
      .from("confession_replies")
      .select("id, confession_id, content, created_at, status, likes_count")
      .eq("id", reply_id)
      .single();

    if (fetchError || !current) {
      console.error("Error al obtener comentario:", fetchError);
      return NextResponse.json(
        { message: "Comentario no encontrado." },
        { status: 404 }
      );
    }

    const currentLikes = current.likes_count ?? 0;
    const delta = action === "unlike" ? -1 : 1;
    const newLikes = Math.max(0, currentLikes + delta);

    // 2) Actualizar contador
    const { data: updated, error: updateError } = await supabase
      .from("confession_replies")
      .update({ likes_count: newLikes })
      .eq("id", reply_id)
      .select(
        `
        id,
        confession_id,
        content,
        created_at,
        status,
        likes_count
      `
      )
      .single();

    if (updateError || !updated) {
      console.error("Error al actualizar likes:", updateError);
      return NextResponse.json(
        { message: "No se pudo actualizar el like." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          action === "like"
            ? "Te gustó este comentario."
            : "Se quitó tu me gusta.",
        item: updated,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Error interno al procesar el like." },
      { status: 500 }
    );
  }
}