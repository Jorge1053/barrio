// src/lib/moderation.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =====================
// Regex básicos de PII / datos sensibles
// =====================
const EMAIL_RE = /\b[\w.+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/;
const PHONE_RE = /\b(?:\+?\d{1,3})?[-.\s]?(?:\d{2,4}[-.\s]?){2,4}\d\b/;
const URL_RE = /\bhttps?:\/\/[^\s]+/i;
const SOCIAL_RE =
  /\b(@[a-zA-Z0-9_]{3,})|\b(instagram|tiktok|facebook|ig|fb|x\.com|twitter)\b/i;

// DNI / documento / cédula, etc. (muy simple, pero ayuda)
const DOC_ID_WORD_RE =
  /\b(dni|documento|c[ée]dula|cedula|cuil|cuit|pasaporte|legajo)\b/i;

/**
 * autoModerateText
 *
 * Devuelve un objeto:
 * {
 *   allowed: boolean,
 *   level: "none" | "soft" | "hard",
 *   message?: string,
 *   reason?: string,
 *   categories?: any
 * }
 *
 * Donde:
 *  - allowed=false & level="hard"  => BLOQUEAR (no guardar, no publicar)
 *  - allowed=true                  => podés publicar
 *  - level="soft"                  => contenido permitido pero “borderline” (podés loguearlo)
 */
export async function autoModerateText(text) {
  const trimmed = (text || "").trim();

  // 1) Validaciones mínimas de UX (coherentes con tu API)
  if (trimmed.length < 10) {
    return {
      allowed: false,
      level: "hard",
      message: "Escribí al menos 10 caracteres.",
      reason: "too_short",
    };
  }

  if (trimmed.length > 800) {
    return {
      allowed: false,
      level: "hard",
      message:
        "El comentario es demasiado largo. Máximo 800 caracteres en respuestas.",
      reason: "too_long",
    };
  }

  // 2) Bloquear datos personales directos (clave para lo legal y para el anonimato)
  if (
    EMAIL_RE.test(trimmed) ||
    PHONE_RE.test(trimmed) ||
    URL_RE.test(trimmed)
  ) {
    return {
      allowed: false,
      level: "hard",
      message:
        "Por seguridad no podés poner mails, teléfonos, links ni datos de contacto en los comentarios.",
      reason: "personal_data",
    };
  }

  // Mención explícita de documentos / identificadores
  if (DOC_ID_WORD_RE.test(trimmed)) {
    return {
      allowed: false,
      level: "hard",
      message:
        "No incluyas números de documento, cédulas, CUIT/CUIL ni identificadores similares.",
      reason: "document_ids",
    };
  }

  // Usuarios o redes sociales (querés que sea 100% anónimo)
  if (SOCIAL_RE.test(trimmed)) {
    return {
      allowed: false,
      level: "hard", // 🚨 lo tratamos como bloqueo duro
      message:
        "Evitá compartir usuarios o redes sociales en los comentarios, mantenemos todo 100% anónimo.",
      reason: "social_handles",
    };
  }

  // 3) Moderación de OpenAI
  try {
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: trimmed,
    });

    const [result] = moderation.results || [];
    if (!result) {
      // Si por alguna razón viene vacío, no forzamos bloqueo
      return {
        allowed: true,
        level: "none",
        message: null,
        reason: null,
      };
    }

    const categories = result.categories || {};

    // ----- ZONA ROJA (bloqueo duro) -----
    // Todo lo que es muy delicado legalmente / éticamente:
    const isSevere =
      categories["sexual/minors"] ||
      categories["self-harm"] ||
      categories["self-harm/intent"] ||
      categories["self-harm/instructions"] ||
      categories["violence/graphic"] ||
      categories["hate"] || // odio hacia grupos protegidos
      categories["hate/threatening"] ||
      categories["harassment/threatening"];

    if (isSevere) {
      return {
        allowed: false,
        level: "hard",
        message:
          "El comentario va contra las reglas de la comunidad (odio, violencia grave, daño, menores, etc.).",
        reason: "severe_policy_violation",
        categories,
      };
    }

    // ----- ZONA GRISES (permitido pero sensible) -----
    // Ej: lenguaje sexual entre adultos, violencia no gráfica,
    // discusiones acaloradas sin amenazas, etc.
    if (result.flagged) {
      return {
        allowed: true, // ⚠️ se permite, pero lo marcamos como “soft”
        level: "soft",
        message:
          "Tu comentario fue marcado como sensible por el sistema automático, pero se publicó de todas formas.",
        reason: "borderline_policy_content",
        categories,
      };
    }

    // ----- OK -----
    return {
      allowed: true,
      level: "none",
      message: null,
      reason: null,
    };
  } catch (error) {
    console.error("Error en autoModerateText:", error);

    // Fallback legalmente conservador: si NO podemos moderar,
    // es más seguro NO publicar el contenido.
    return {
      allowed: false,
      level: "hard",
      message:
        "No pudimos revisar tu comentario automáticamente. Probá de nuevo en unos minutos.",
      reason: "moderation_error",
    };
  }
}