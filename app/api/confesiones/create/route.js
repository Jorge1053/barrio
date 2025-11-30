// src/app/api/confesiones/create/route.js
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";
import { getRequestFingerprint } from "../../../../lib/fingerprint";

const BAD_WORDS = [
  "puto",
  "puta",
  "negro de mierda",
  "matarte",
  "te voy a matar",
  // agrega las que quieras, manteniendo el proyecto libre de odio y amenazas
];

function containsBadWords(text) {
  const lower = text.toLowerCase();
  return BAD_WORDS.some((w) => lower.includes(w));
}

// validar que no hay mails, teléfonos, @ o números largos
function containsPersonalData(text) {
  const lower = text.toLowerCase();
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(lower);
  const hasPhone = /\b\d{7,}\b/.test(lower);
  const hasAtHandle = /@\w{3,}/.test(lower);
  return hasEmail || hasPhone || hasAtHandle;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      city,
      university,
      category,
      content,
      intention: rawIntention,
      prompt_id,
    } = body || {};

    // ---- VALIDACIONES BÁSICAS ----
    if (!city || typeof city !== "string") {
      return NextResponse.json(
        { message: "La ciudad es obligatoria." },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { message: "La categoría es obligatoria." },
        { status: 400 }
      );
    }

    const allowedCategories = [
      "amor",
      "estudio",
      "familia",
      "trabajo",
      "plata",
      "random",
    ];
    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        { message: "Categoría no permitida." },
        { status: 400 }
      );
    }

    // ---- VALIDAR INTENTIÓN ----
    const allowedIntentions = ["advice", "vent", "story"];
    let intention =
      typeof rawIntention === "string" ? rawIntention.trim() : "advice";

    if (!allowedIntentions.includes(intention)) {
      // fallback seguro → mismo default que en el form
      intention = "advice";
    }

    const text = (content || "").toString().trim();
    if (text.length < 30 || text.length > 2000) {
      return NextResponse.json(
        { message: "La confesión debe tener entre 30 y 2000 caracteres." },
        { status: 400 }
      );
    }

    if (containsBadWords(text)) {
      return NextResponse.json(
        {
          message:
            "El texto contiene palabras que van contra las reglas de respeto. Intenta contarlo de otra forma.",
        },
        { status: 400 }
      );
    }

    if (containsPersonalData(text)) {
      return NextResponse.json(
        {
          message:
            "Por seguridad, no se permiten emails, teléfonos ni @ de redes. Borra esos datos e inténtalo de nuevo.",
        },
        { status: 400 }
      );
    }

    const fingerprint = getRequestFingerprint(req.headers);
    const supabase = createSupabaseServerClient();

    // 🔹 Rate limiting DESACTIVADO temporalmente para pruebas
    // const { count, error: countError } = await supabase
    //   .from("confessions")
    //   .select("id", { count: "exact", head: true })
    //   .eq("fingerprint", fingerprint)
    //   .gte(
    //     "created_at",
    //     new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    //   );
    //
    // if (countError) {
    //   console.error(countError);
    // } else if (count >= 3) {
    //   return NextResponse.json(
    //     {
    //       message:
    //         "Se alcanzó el límite diario de confesiones desde este dispositivo. Inténtalo de nuevo mañana.",
    //     },
    //     { status: 429 }
    //   );
    // }

    const { error } = await supabase.from("confessions").insert({
      city,
      university: university || null,
      category,
      content: text,
      status: "pending", // se modera en panel admin
      fingerprint,
      // 🔹 NUEVO: guardamos intención y prompt_id
      intention,
      prompt_id: prompt_id || null,
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Error al guardar la confesión." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Confesión enviada para revisión." },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Error inesperado." }, { status: 500 });
  }
}
