"use client";
import { useState } from "react";
import { DECK_COLORS, DECKS, STAKE_COLORS, STAKES } from "../data/items";
import ChipSprite from "./ChipSprite";
import DeckSprite from "./DeckSprite";

export default function Sidebar({
  isOpen,
  onToggle,
  mode,
  setMode,
  disabledStakes,
  disabledDecks,
  toggleStake,
  toggleDeck,
  customStakes,
  customDecks,
  addCustomStake,
  addCustomDeck,
  removeCustomStake,
  removeCustomDeck,
  history,
  activeCount,
}) {
  const [newCustom, setNewCustom] = useState("");

  const items = mode === "stakes" ? STAKES : DECKS;
  const disabled = mode === "stakes" ? disabledStakes : disabledDecks;
  const customs = mode === "stakes" ? customStakes : customDecks;
  const toggle = mode === "stakes" ? toggleStake : toggleDeck;
  const removeCustom = mode === "stakes" ? removeCustomStake : removeCustomDeck;

  const handleAdd = () => {
    const trimmed = newCustom.trim();
    if (!trimmed) return;
    if (mode === "stakes") addCustomStake(trimmed);
    else addCustomDeck(trimmed);
    setNewCustom("");
  };

  const enableAll = () => {
    items.forEach((item) => {
      if (disabled[item.id]) toggle(item.id);
    });
  };

  const disableAll = () => {
    items.forEach((item) => {
      if (!disabled[item.id]) toggle(item.id);
    });
  };

  return (
    <>
      {/* Sidebar panel */}
      <div
        style={{
          width: isOpen ? 330 : 0,
          minWidth: isOpen ? 330 : 0,
          height: "100vh",
          background: "linear-gradient(180deg, #0d1117 0%, #161b22 100%)",
          borderRight: isOpen ? "1px solid var(--border-subtle)" : "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Logo area */}
        <div
          style={{
            padding: "20px 18px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <img
            src="/sprites/mlb-logo.png"
            alt="MLB"
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              objectFit: "contain",
              imageRendering: "pixelated",
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                letterSpacing: 3,
                lineHeight: 1.2,
              }}
            >
              MAJOR LEAGUE
            </div>
            <div
              style={{
                fontSize: 24,
                color: "var(--accent-red)",
                letterSpacing: 3,
                lineHeight: 1.1,
              }}
            >
              BALATRO
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              padding: 3,
              border: "1px solid var(--border-subtle)",
            }}
          >
            {["stakes", "decks"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "var(--font-balatro)",
                  fontSize: 16,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                  background:
                    mode === m
                      ? m === "stakes"
                        ? "linear-gradient(180deg, var(--accent-red), var(--accent-red-dark))"
                        : "linear-gradient(180deg, var(--accent-blue), var(--accent-blue-dark))"
                      : "transparent",
                  color: mode === m ? "#fff" : "var(--text-muted)",
                  boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                }}
              >
                {m === "stakes" ? "◆ Stakes" : "♠ Decks"}
              </button>
            ))}
          </div>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflow: "auto", padding: "12px 14px" }}>
          {/* Header with select/deselect all */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {mode} ({activeCount} active)
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={enableAll}
                style={{
                  fontSize: 12,
                  background: "none",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontFamily: "var(--font-balatro)",
                }}
              >
                All
              </button>
              <button
                onClick={disableAll}
                style={{
                  fontSize: 12,
                  background: "none",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontFamily: "var(--font-balatro)",
                }}
              >
                None
              </button>
            </div>
          </div>

          {/* Item checkboxes */}
          {items.map((item) => {
            const off = !!disabled[item.id];
            return (
              <label
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  marginBottom: 2,
                  background: off ? "transparent" : "rgba(255,255,255,0.025)",
                  opacity: off ? 0.35 : 1,
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="checkbox"
                  checked={!off}
                  onChange={() => toggle(item.id)}
                  style={{
                    accentColor:
                      mode === "stakes"
                        ? "var(--accent-red)"
                        : "var(--accent-blue)",
                    width: 16,
                    height: 16,
                    cursor: "pointer",
                  }}
                />
                {/* Mini sprite preview */}
                {mode === "stakes" ? (
                  <ChipSprite chipX={item.chipX} chipY={item.chipY} size={26} />
                ) : null}
                <span
                  style={{
                    fontSize: 15,
                    color: off ? "var(--text-muted)" : "var(--text-primary)",
                    lineHeight: 1.2,
                  }}
                >
                  {item.name}
                </span>
              </label>
            );
          })}

          {/* Custom entries */}
          {customs.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 6,
                  paddingLeft: 4,
                }}
              >
                Custom
              </div>
              {customs.map((name) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 10px",
                    borderRadius: 8,
                    marginBottom: 2,
                    background: "rgba(155, 89, 182, 0.1)",
                    border: "1px solid rgba(155, 89, 182, 0.15)",
                  }}
                >
                  {mode === "stakes" ? (
                    <ChipSprite chipX={9} size={22} isWildcard />
                  ) : null}
                  <span style={{ flex: 1, fontSize: 14, color: "#bb8fce" }}>
                    {name}
                  </span>
                  <button
                    onClick={() => removeCustom(name)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent-red)",
                      cursor: "pointer",
                      fontSize: 20,
                      lineHeight: 1,
                      padding: "0 4px",
                      fontFamily: "var(--font-balatro)",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add custom input */}
          <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
            <input
              value={newCustom}
              onChange={(e) => setNewCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={`Add custom ${mode === "stakes" ? "stake" : "deck"}...`}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-light)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: 14,
                fontFamily: "var(--font-balatro)",
                outline: "none",
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid var(--border-light)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 20,
                fontFamily: "var(--font-balatro)",
                lineHeight: 1,
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              padding: "12px 14px",
              maxHeight: 180,
              overflow: "auto",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              History
            </div>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "3px 0",
                  fontSize: 13,
                  color: "var(--text-muted)",
                }}
              >
                <span
                  style={{
                    color:
                      h.mode === "stakes"
                        ? "var(--accent-red)"
                        : "var(--accent-blue)",
                  }}
                >
                  {h.mode === "stakes" ? "◆" : "♠"}
                </span>
                <span style={{ flex: 1, color: "var(--text-secondary)" }}>
                  {h.name}
                </span>
                <span style={{ fontSize: 11 }}>{h.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        style={{
          position: "fixed",
          top: 18,
          left: isOpen ? 340 : 12,
          zIndex: 100,
          width: 38,
          height: 38,
          borderRadius: 8,
          border: "1px solid var(--border-light)",
          background: "rgba(13, 17, 23, 0.95)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontFamily: "var(--font-balatro)",
        }}
      >
        {isOpen ? "◀" : "▶"}
      </button>
    </>
  );
}
