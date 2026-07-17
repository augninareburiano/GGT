import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

// Static social-share card generated at build time — no design assets needed.
export const alt = "Gourmet Getaway Tours — food, wine & adventure tours from Sydney";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(150deg, #5F7321, #3C4A14)",
          color: "#F3ECD8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 2, textTransform: "uppercase", opacity: 0.85 }}>
          Owner-operated · New South Wales
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 40, marginTop: 24, color: "#FFFBF2", opacity: 0.9 }}>
            Food, wine &amp; adventure tours from Sydney
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
          <div
            style={{
              background: "#FF5E1A",
              color: "#211C24",
              padding: "10px 22px",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            Build your tour
          </div>
          <div style={{ opacity: 0.8 }}>gourmetgetawaytours.com.au</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
