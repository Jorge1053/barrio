// src/lib/fingerprint.js
import crypto from "crypto";

// Versión genérica que ya tenías
export function getRequestFingerprint(headers) {
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "0.0.0.0";
  const ua = headers.get("user-agent") || "unknown";

  const raw = `${ip}::${ua}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return hash;
}

// Versión cómoda para usar desde rutas de Next (req de App Router)
export function getClientFingerprint(req) {
  const headers = req.headers;
  return getRequestFingerprint(headers);
}
