"use client";
import { DECK_COLORS, STAKE_COLORS } from "../data/items";
import ChipSprite from "./ChipSprite";
import DeckSprite from "./DeckSprite";

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ResultModal({ result, mode, onClose }) {
  if (!result) return null;

  const color = result.custom
    ? "#9b59b6"
    : (mode === "stakes" ? STAKE_COLORS : DECK_COLORS)[result.id]?.bg ||
      "#e74c3c";

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
          boxShadow: `0 0 70px ${hexToRgba(color, 0.35)}, 0 0 140px ${hexToRgba(color, 0.12)}, 0 25px 50px rgba(0,0,0,0.5)`,
          border: `2px solid ${hexToRgba(color, 0.3)}`,
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
            borderTop: `2px solid ${hexToRgba(color, 0.5)}`,
            borderLeft: `2px solid ${hexToRgba(color, 0.5)}`,
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
            borderBottom: "2px solid rgba(241,196,15,0.4)",
            borderRight: "2px solid rgba(241,196,15,0.4)",
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
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          {/* Glow ring behind the sprite, matched to the result's color */}
          <div
            style={{
              position: "absolute",
              width: 170,
              height: 170,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${hexToRgba(color, 0.45)} 0%, transparent 70%)`,
              filter: "blur(4px)",
            }}
          />
          <div style={{ animation: "float 2s ease-in-out infinite" }}>
            {mode === "stakes" ? (
              <ChipSprite
                chipX={result.custom ? 4 : result.chipX}
                chipY={result.custom ? 1 : result.chipY}
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
          className="balatro-btn balatro-btn--ghost"
          style={{
            "--btn-color": "#3a3f48",
            "--btn-shadow": "#20232a",
            padding: "12px 40px",
            fontSize: 18,
            fontFamily: "var(--font-balatro)",
            color: "#fff",
            borderRadius: 10,
            letterSpacing: 2,
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
