// src/app/confesar/page.jsx
// 👇 OJO: este archivo NO lleva "use client"

import ConfesarClient from "./ConfesarClient";

export const dynamic = "force-dynamic"; // opcional, fuerza modo dinámico

export default function ConfesarPage({ searchParams }) {
  const promptIdFromUrl =
    typeof searchParams?.prompt_id === "string" ? searchParams.prompt_id : null;

  return <ConfesarClient promptIdFromUrl={promptIdFromUrl} />;
}
