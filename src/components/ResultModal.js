"use client";
import ChipSprite from "./ChipSprite";
import DeckSprite from "./DeckSprite";

export default function ResultModal({ result, mode, onClose }) {
  if (!result) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            "linear-gradient(135deg, #16213e 0%, #1a1a2e 50%, #16213e 100%)",
          borderRadius: 20,
          padding: "48px 56px",
          textAlign: "center",
          boxShadow:
            "0 0 60px rgba(231, 76, 60, 0.2), 0 0 120px rgba(52, 152, 219, 0.1), 0 25px 50px rgba(0,0,0,0.5)",
          border: "2px solid rgba(255, 255, 255, 0.1)",
          animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          maxWidth: 420,
          width: "90%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative corner accents */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 60,
            height: 60,
            borderTop: "2px solid rgba(231,76,60,0.4)",
            borderLeft: "2px solid rgba(231,76,60,0.4)",
            borderRadius: "20px 0 0 0",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 60,
            height: 60,
            borderBottom: "2px solid rgba(52,152,219,0.4)",
            borderRight: "2px solid rgba(52,152,219,0.4)",
            borderRadius: "0 0 20px 0",
          }}
        />

        <div
          style={{
            fontSize: 16,
            color: "var(--text-muted)",
            letterSpacing: 5,
            textTransform: "uppercase",
            marginBottom: 24,
            fontFamily: "var(--font-balatro)",
          }}
        >
          ✦ Selected ✦
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 24,
            animation: "float 2s ease-in-out infinite",
          }}
        >
          {mode === "stakes" ? (
            <ChipSprite
              chipX={result.custom ? 9 : result.chipX}
              size={130}
              isWildcard={result.custom}
            />
          ) : (
            <DeckSprite
              spriteX={result.custom ? 6 : result.spriteX}
              spriteY={result.custom ? 3 : result.spriteY}
              width={130}
              isWildcard={result.custom}
            />
          )}
        </div>

        <div
          style={{
            fontSize: 36,
            color: "#fff",
            fontFamily: "var(--font-balatro)",
            marginBottom: 32,
            textShadow: "0 2px 15px rgba(0,0,0,0.5)",
            lineHeight: 1.2,
          }}
        >
          {result.name}
        </div>

        <button
          onClick={onClose}
          style={{
            padding: "12px 40px",
            fontSize: 18,
            fontFamily: "var(--font-balatro)",
            background: "rgba(255, 255, 255, 0.08)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 10,
            cursor: "pointer",
            letterSpacing: 2,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255,255,255,0.08)";
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
