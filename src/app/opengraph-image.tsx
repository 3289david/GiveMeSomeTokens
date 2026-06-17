import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GiveMeSomeTokens — Support creators with AI tokens";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #f97316, #a855f7, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "28px",
            boxShadow: "0 0 60px rgba(168,85,247,0.4)",
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #f97316, #a855f7, #3b82f6)",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-2px",
            lineHeight: "1",
            marginBottom: "20px",
          }}
        >
          GiveMeSomeTokens
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "26px",
            color: "#a1a1aa",
            fontWeight: "400",
            letterSpacing: "0.5px",
          }}
        >
          Support creators with AI tokens instead of money
        </div>

        {/* Provider pills row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {["Claude", "GPT", "Gemini", "Grok", "Mistral", "DeepSeek", "+8 more"].map((p) => (
            <div
              key={p}
              style={{
                padding: "8px 18px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#e4e4e7",
                fontSize: "15px",
                fontWeight: "500",
              }}
            >
              {p}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "18px",
            color: "#52525b",
            fontWeight: "500",
          }}
        >
          givemesometokens.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
