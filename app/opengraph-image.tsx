import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Brand OG card (1200×630) for WhatsApp/Instagram/social shares. */
export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "#1c1712",
          color: "#f7f1e4",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: "#d3ac5f" }}>AREM WORLD · COLOMBIA</div>
        <div style={{ fontSize: 92, lineHeight: 1.02, marginTop: 24 }}>
          Colombian craft,
          <br />
          curated for the world.
        </div>
        <div style={{ display: "flex", marginTop: 40, gap: 16 }}>
          {["#b4552d", "#d9a441", "#7a8450"].map((c) => (
            <div key={c} style={{ width: 56, height: 56, transform: "rotate(45deg)", background: c }} />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
