// src/app/api/confesiones/verdad-o-falso/vote/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabaseServer";
import { getRequestFingerprint } from "../../../../../lib/fingerprint";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const supabase = createSupabaseServerClient();
    const fingerprint = getRequestFingerprint(req.headers);

    const body = await req.json();
    const { id, vote } = body || {};

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { message: "Falta el id de la confesión." },
        { status: 400 }
      );
    }

    if (vote !== "truth" && vote !== "fake") {
      return NextResponse.json({ message: "Voto inválido." }, { status: 400 });
    }

    if (!fingerprint) {
      return NextResponse.json(
        { message: "No se pudo identificar el dispositivo." },
        { status: 400 }
      );
    }

    // 1) Ver si este fingerprint ya votó esta confesión
    const { data: existingRows, error: existingError } = await supabase
      .from("confession_truth_votes")
      .select("id, vote")
      .eq("confession_id", id)
      .eq("fingerprint", fingerprint)
      .limit(1);

    if (existingError) {
      console.error("Error buscando voto existente:", existingError);
    }

    const existing = existingRows && existingRows[0] ? existingRows[0] : null;
    let finalVote = vote;

    // 2) Insertar o actualizar el voto
    if (!existing) {
      const { error: insertError } = await supabase
        .from("confession_truth_votes")
        .insert({
          confession_id: id,
          fingerprint,
          vote,
        });

      if (insertError) {
        console.error("Error insertando voto:", insertError);
        return NextResponse.json(
          { message: "No se pudo registrar tu voto." },
          { status: 500 }
        );
      }
    } else if (existing.vote !== vote) {
      const { error: updateVoteError } = await supabase
        .from("confession_truth_votes")
        .update({ vote })
        .eq("id", existing.id);

      if (updateVoteError) {
        console.error("Error actualizando voto:", updateVoteError);
        return NextResponse.json(
          { message: "No se pudo actualizar tu voto." },
          { status: 500 }
        );
      }
    } else {
      // Ya había votado lo mismo; simplemente devolvemos estado actualizado luego
      finalVote = existing.vote;
    }

    // 3) Recalcular conteos para esa confesión
    const { count: truthCount, error: truthError } = await supabase
      .from("confession_truth_votes")
      .select("id", { count: "exact", head: true })
      .eq("confession_id", id)
      .eq("vote", "truth");

    const { count: fakeCount, error: fakeError } = await supabase
      .from("confession_truth_votes")
      .select("id", { count: "exact", head: true })
      .eq("confession_id", id)
      .eq("vote", "fake");

    if (truthError || fakeError) {
      console.error("Error contando votos:", truthError, fakeError);
      return NextResponse.json(
        { message: "No se pudieron actualizar las estadísticas." },
        { status: 500 }
      );
    }

    const truthVotes = truthCount ?? 0;
    const fakeVotes = fakeCount ?? 0;

    // 4) Guardar conteos agregados en la tabla confessions
    const { data: updatedConf, error: updateConfError } = await supabase
      .from("confessions")
      .update({
        truth_votes: truthVotes,
        fake_votes: fakeVotes,
      })
      .eq("id", id)
      .select("id, truth_votes, fake_votes")
      .limit(1)
      .single();

    if (updateConfError) {
      console.error("Error actualizando confessions:", updateConfError);
      return NextResponse.json(
        { message: "No se pudieron guardar las estadísticas." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        updated: updatedConf,
        userVote: finalVote,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error inesperado al votar VF:", e);
    return NextResponse.json(
      { message: "Error inesperado al votar." },
      { status: 500 }
    );
  }
}