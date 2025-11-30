// src/app/api/confesiones/react/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";
import { getRequestFingerprint } from "../../../../lib/fingerprint";

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, type } = body || {};
    const allowed = ["like", "wow", "haha"];

    if (!id || !allowed.includes(type)) {
      return NextResponse.json({ message: "Datos inválidos." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const fingerprint = getRequestFingerprint(req.headers);

    // Intentar insertar reacción
    const { error: reactionError } = await supabase.from("reactions").insert({
      confession_id: id,
      reaction_type: type,
      fingerprint,
    });

    // Si es unique violation (ya reaccionó), ignoramos
    if (reactionError && reactionError.code !== "23505") {
      console.error(reactionError);
    }

    // Leer conteos actuales
    const { data: row, error: readError } = await supabase
      .from("confessions")
      .select("likes_count, wow_count, haha_count")
      .eq("id", id)
      .single();

    if (readError || !row) {
      console.error(readError);
      return NextResponse.json(
        { message: "Confesión no encontrada." },
        { status: 404 }
      );
    }

    const updatedCounts = { ...row };
    if (!reactionError || reactionError.code !== "23505") {
      if (type === "like") updatedCounts.likes_count += 1;
      if (type === "wow") updatedCounts.wow_count += 1;
      if (type === "haha") updatedCounts.haha_count += 1;

      const { error: updateError } = await supabase
        .from("confessions")
        .update(updatedCounts)
        .eq("id", id);

      if (updateError) {
        console.error(updateError);
      }
    }

    return NextResponse.json({ updatedCounts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Error inesperado." }, { status: 500 });
  }
}
