import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Faqih Nur Fahmi — HR Manager and Full Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const photo = await readFile(join(process.cwd(), "public", "profil.png"));
  const photoSrc = `data:image/png;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#F4F3EF",
        padding: "0 80px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 24, letterSpacing: 6, color: "#8A6F3F" }}>FAQIH.ID</div>
        <div style={{ fontSize: 82, fontWeight: 700, color: "#1B1C1E", lineHeight: 1.05, marginTop: 20 }}>Faqih Nur Fahmi</div>
        <div style={{ width: 96, height: 5, backgroundColor: "#8A6F3F", marginTop: 32, marginBottom: 32 }} />
        <div style={{ fontSize: 36, color: "#4A4A46", lineHeight: 1.3 }}>Certified HR Manager (BNSP) & Full Stack Developer</div>
        <div style={{ fontSize: 24, color: "#8B897F", marginTop: 18 }}>BNSP Certified HR Manager · 9+ years experience</div>
      </div>
      <img src={photoSrc} width={340} height={340} style={{ borderRadius: "50%", objectFit: "cover", border: "6px solid #D8D6CE" }} />
    </div>,
    { ...size },
  );
}
