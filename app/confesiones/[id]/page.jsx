// src/app/confesiones/[id]/page.jsx
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import ConfessionDetailClient from "./ConfessionDetailClient";

const categoryLabels = {
  amor: "Amor",
  estudio: "Estudio",
  familia: "Familia",
  trabajo: "Trabajo",
  plata: "Plata",
  random: "Random",
};

export async function generateMetadata(props) {
  // 🔹 params es una Promise en Next 16
  const { params } = props;
  const { id } = await params;

  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("confessions")
    .select("id, content, city, category")
    .eq("id", id)
    .single();

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://confesionario.ar";

  if (!data) {
    const title = "Confesión no encontrada · ConfesionarioAR";
    const description =
      "Esta confesión ya no está disponible o fue eliminada por moderación.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/confesiones/${id}`,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  }

  const shortId = data.id.slice(0, 6).toUpperCase();
  const rawText = (data.content || "").trim();
  const truncated =
    rawText.length > 160 ? `${rawText.slice(0, 160).trim()}…` : rawText;

  const ogUrl = new URL("/api/og/confesion", baseUrl);
  ogUrl.searchParams.set("id", shortId);
  if (rawText) ogUrl.searchParams.set("text", rawText.slice(0, 240));
  if (data.city) ogUrl.searchParams.set("city", data.city);
  if (data.category) ogUrl.searchParams.set("category", data.category);

  const categoryText =
    categoryLabels[data.category] || "Confesión anónima · ConfesionarioAR";

  const title = `Confesión #${shortId} · ConfesionarioAR`;
  const description =
    truncated ||
    `${categoryText} desde Argentina, moderada antes de publicarse.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${baseUrl}/confesiones/${id}`,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl.toString()],
    },
  };
}

export default async function ConfesionDetallePage(props) {
  // 🔹 Lo mismo acá: params es Promise
  const { params } = props;
  const { id } = await params;

  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("confessions")
    .select(
      "id, city, university, category, content, status, created_at, fingerprint, likes_count, wow_count, haha_count, prompt_id, intention"
    )
    .eq("id", id)
    .single();

  if (!data) {
    notFound();
  }

  return <ConfessionDetailClient initialConfession={data} />;
}
