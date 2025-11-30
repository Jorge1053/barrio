// src/app/api/confesiones/verdad-o-falso/next/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabaseServer";
import { getRequestFingerprint } from "../../../../../lib/fingerprint";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const supabase = createSupabaseServerClient();
    const fingerprint = getRequestFingerprint(req.headers);

    // 1) Traemos confesiones marcadas para "¿Verdad o falso?"
    const { data, error } = await supabase
      .from("confessions")
      .select(
        `
        id,
        city,
        category,
        content,
        created_at,
        truth_votes,
        fake_votes,
        status,
        is_truth_or_fake
      `
      )
      .eq("is_truth_or_fake", true)
      // 👇 IMPORTANTE: usar el estado que realmente usás en admin
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error cargando confesiones VF:", error);
      return NextResponse.json(
        { item: null, userVote: null, message: "Error al cargar confesiones." },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ item: null, userVote: null }, { status: 200 });
    }

    // 2) Elegimos una al azar del lote
    const randomIndex = Math.floor(Math.random() * data.length);
    const item = data[randomIndex];

    let userVote = null;

    // 3) Buscamos si este fingerprint ya votó esta confesión
    if (fingerprint && item?.id) {
      const { data: voteRows, error: voteError } = await supabase
        .from("confession_truth_votes")
        .select("vote")
        .eq("confession_id", item.id)
        .eq("fingerprint", fingerprint)
        .limit(1);

      if (!voteError && voteRows && voteRows.length > 0) {
        userVote = voteRows[0].vote === "truth" ? "truth" : "fake";
      }
    }

    return NextResponse.json(
      {
        item: {
          ...item,
          truth_votes: item.truth_votes ?? 0,
          fake_votes: item.fake_votes ?? 0,
        },
        userVote,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error inesperado VF next:", e);
    return NextResponse.json(
      { item: null, userVote: null, message: "Error inesperado." },
      { status: 500 }
    );
  }
}