// src/app/api/og/confesion/route.jsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

const categoryLabels = {
  amor: "Amor",
  estudio: "Estudio",
  familia: "Familia",
  trabajo: "Trabajo",
  plata: "Plata",
  random: "Random",
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id") || "";
  const rawText = searchParams.get("text") || "";
  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "";

  const categoryText =
    categoryLabels[category] || "Confesión anónima · ConfesionarioAR";

  const safeText = rawText.slice(0, 260);
  const truncated =
    safeText.length === rawText.length ? safeText : `${safeText}…`;

  const shortId = id ? `#${id}` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          flexDirection: "column",
          padding: "40px 60px",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background:
            "linear-gradient(180deg, #020617 0%, #0f172a 45%, #020617 100%)",
          color: "#e5e7eb",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 999,
              backgroundColor: "rgba(15,23,42,0.8)",
              color: "#f9a8d4",
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: "#fb7185",
              }}
            />
            ConfesionarioAR
          </div>

          {shortId && (
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco",
                fontSize: 16,
                color: "#94a3b8",
              }}
            >
              {shortId}
            </div>
          )}
        </div>

        {/* Subheader */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              padding: "8px 14px",
              backgroundColor: "rgba(15,23,42,0.85)",
              color: "#e5e7eb",
            }}
          >
            {categoryText}
            {city ? ` · ${city}` : ""}
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              padding: "8px 14px",
              backgroundColor: "rgba(236,72,153,0.18)",
              color: "#f9a8d4",
              fontSize: 16,
            }}
          >
            Confesión anónima
          </div>
        </div>

        {/* Tarjeta central */}
        <div
          style={{
            marginTop: 40,
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              borderRadius: 24,
              padding: "32px 40px",
              backgroundColor: "rgba(2,6,23,0.7)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 20,
                top: -10,
                fontSize: 80,
                color: "rgba(251,113,133,0.4)",
              }}
            >
              “
            </div>
            <p
              style={{
                position: "relative",
                fontSize: 26,
                lineHeight: 1.5,
                color: "#f9fafb",
                whiteSpace: "pre-wrap",
              }}
            >
              {truncated || "Confesión anónima desde confesionario.ar"}
            </p>
            <div
              style={{
                position: "absolute",
                right: 30,
                bottom: -20,
                fontSize: 80,
                color: "rgba(251,113,133,0.3)",
              }}
            >
              ”
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 32,
            fontSize: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#e5e7eb",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontWeight: 500 }}>Confesión anónima</span>
            <span style={{ fontSize: 16, color: "#94a3b8" }}>
              Subida por la comunidad · moderada antes de publicarse.
            </span>
          </div>
          <div
            style={{
              fontWeight: 600,
              color: "#f9a8d4",
              fontSize: 20,
            }}
          >
            confesionario.ar
          </div>
        </div>

        {/* Glow decorativo */}
        <div
          style={{
            position: "absolute",
            right: -80,
            bottom: 80,
            width: 260,
            height: 260,
            borderRadius: 999,
            backgroundColor: "rgba(236,72,153,0.18)",
            filter: "blur(40px)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
