"use client";

export default function Toast({ visible, closing }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 22,
        left: "50%",
        zIndex: 2000,
        animation: `${closing ? "toastOut" : "toastIn"} 0.35s ease forwards`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 22px",
          background: "rgba(13, 17, 23, 0.92)",
          border: "2px solid rgba(255, 255, 255, 0.18)",
          borderRadius: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
          maxWidth: "min(560px, 90vw)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <span style={{ fontSize: 26, flexShrink: 0 }}>🔊</span>
        <span
          style={{
            fontSize: 15,
            lineHeight: 1.4,
            color: "var(--text-primary)",
            fontFamily: "var(--font-balatro)",
            letterSpacing: 0.3,
          }}
        >
          Music is off by default — enable it, switch{" "}
          <strong style={{ color: "var(--accent-red)" }}>Stakes</strong> /{" "}
          <strong style={{ color: "var(--accent-blue)" }}>Decks</strong>, and
          customize options anytime in the sidebar.
        </span>

        {/* Depleting progress bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            height: 3,
            width: "100%",
            background: "rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              height: "100%",
              background:
                "linear-gradient(90deg, var(--accent-red), var(--accent-blue))",
              animation: closing ? "none" : "toastProgress 3s linear forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
}
