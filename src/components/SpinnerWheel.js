"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Wheel } from "spin-wheel";
import {
  CHIP_SPRITE_H,
  CHIP_SPRITE_W,
  DECK_COLORS,
  DECK_SHEET_COLS,
  DECK_SHEET_ROWS,
  DECK_SPRITE_H,
  DECK_SPRITE_W,
  STAKE_COLORS,
} from "../data/items";

function cropSprite(srcImg, sx, sy, sw, sh) {
  return new Promise((resolve) => {
    const c = document.createElement("canvas");
    c.width = sw;
    c.height = sh;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(srcImg, sx, sy, sw, sh, 0, 0, sw, sh);
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = c.toDataURL();
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

function easeCubicOut(n) {
  return 1 - Math.pow(1 - n, 3);
}

export default function SpinnerWheel({ items, mode, onResult }) {
  const containerRef = useRef(null);
  const wheelRef = useRef(null);
  const spinningRef = useRef(false);
  const [spinning, setSpinningState] = useState(false);
  const [ready, setReady] = useState(false);

  // Keep stable refs for callbacks
  const itemsRef = useRef(items);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // Build wheel items with colors and cropped sprite images
  const buildWheelItems = useCallback(async (curItems, curMode) => {
    let chipSheet = null;
    let deckSheet = null;

    try {
      chipSheet = await loadImage("/sprites/chips.png");
    } catch (e) {}
    try {
      deckSheet = await loadImage("/sprites/decks.png");
    } catch (e) {}

    const wheelItems = [];

    for (const item of curItems) {
      const entry = { label: item.name, value: item };
      let img = null;

      if (curMode === "stakes") {
        const c = item.custom
          ? { bg: "#5b2c8e", dark: "#3d1b61" }
          : STAKE_COLORS[item.id] || { bg: "#888", dark: "#555" };
        entry.backgroundColor = c.bg;
        entry.labelColor = "#fff";
        if (chipSheet && !item.custom) {
          try {
            const col = item.chipX ?? 0;
            const row = item.chipY ?? 0;
            img = await cropSprite(
              chipSheet,
              col * CHIP_SPRITE_W,
              row * CHIP_SPRITE_H,
              CHIP_SPRITE_W,
              CHIP_SPRITE_H,
            );
          } catch (e) {}
        }
      } else {
        const c = item.custom
          ? { bg: "#5b2c8e", dark: "#3d1b61" }
          : DECK_COLORS[item.id] || { bg: "#888", dark: "#555" };
        entry.backgroundColor = c.bg;
        entry.labelColor = "#fff";
        if (deckSheet && !item.custom) {
          try {
            const col = item.spriteX ?? 0;
            const row = item.spriteY ?? 0;
            img = await cropSprite(
              deckSheet,
              col * DECK_SPRITE_W,
              row * DECK_SPRITE_H,
              DECK_SPRITE_W,
              DECK_SPRITE_H,
            );
          } catch (e) {}
        }
      }

      if (img && curMode === "stakes") {
        entry.image = img;
        entry.imageRadius = 0.42;
        entry.imageScale = Math.min(0.35, 2.5 / curItems.length);
      }

      wheelItems.push(entry);
    }

    return wheelItems;
  }, []);

  // Create / recreate the wheel when items or mode change
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const setup = async () => {
      const wheelItems = await buildWheelItems(items, mode);
      if (cancelled) return;

      // Destroy previous wheel
      if (wheelRef.current) {
        try {
          wheelRef.current.remove();
        } catch (e) {}
        wheelRef.current = null;
      }

      // Clear the container
      containerRef.current.innerHTML = "";

      const props = {
        items: wheelItems,
        itemLabelFont: "m6x11plus, Courier New, monospace",
        itemLabelFontSizeMax: Math.min(22, Math.floor(360 / items.length)),
        itemLabelRadius: 0.78,
        itemLabelRadiusMax: 0.35,
        itemLabelAlign: "right",
        itemLabelColors: ["#fff"],
        itemLabelStrokeColor: "#000",
        itemLabelStrokeWidth: 1,
        itemBackgroundColors: ["#333", "#444"],
        lineColor: "rgba(0,0,0,0.4)",
        lineWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        borderWidth: 3,
        radius: 0.93,
        pointerAngle: 0,
        rotationResistance: -55,
        rotationSpeedMax: 800,
        isInteractive: false, // disable drag — button only
        pixelRatio: 0,
        onRest: (e) => {
          spinningRef.current = false;
          setSpinningState(false);
          const idx = e.currentIndex;
          const ci = itemsRef.current;
          if (ci && ci[idx]) {
            onResultRef.current(ci[idx]);
          }
        },
      };

      const wheel = new Wheel(containerRef.current, props);
      wheelRef.current = wheel;
      setReady(true);
    };

    setup();

    return () => {
      cancelled = true;
      if (wheelRef.current) {
        try {
          wheelRef.current.remove();
        } catch (e) {}
        wheelRef.current = null;
      }
    };
  }, [items, mode, buildWheelItems]);

  // Spin handler — uses refs only, no state in dependency
  const spin = useCallback(() => {
    if (spinningRef.current) return;
    const wheel = wheelRef.current;
    const count = itemsRef.current.length;
    if (!wheel || count < 2) return;

    spinningRef.current = true;
    setSpinningState(true);

    // Cryptographically fair random index
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const targetIdx = arr[0] % count;

    const duration = 4000 + Math.random() * 2000;
    const revolutions = 6 + Math.floor(Math.random() * 4);

    wheel.spinToItem(targetIdx, duration, false, revolutions, 1, easeCubicOut);
  }, []);

  const count = items.length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      {/* Pointer triangle at top */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "18px solid transparent",
          borderRight: "18px solid transparent",
          borderTop: "30px solid #e74c3c",
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.5))",
          zIndex: 10,
          marginBottom: -8,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -28,
            left: -8,
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "20px solid rgba(255,255,255,0.2)",
          }}
        />
      </div>

      {/* Wheel container — fixed size, never re-rendered by React */}
      <div
        ref={containerRef}
        style={{
          width: 480,
          height: 480,
          maxWidth: "85vw",
          maxHeight: "55vh",
          aspectRatio: "1 / 1",
          filter: "drop-shadow(0 0 40px rgba(0,0,0,0.5))",
          position: "relative",
        }}
      />

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning || count < 2}
        style={{
          padding: "14px 56px",
          fontSize: 24,
          fontFamily: "var(--font-balatro)",
          fontWeight: "normal",
          letterSpacing: 4,
          textTransform: "uppercase",
          background: spinning
            ? "#444"
            : "linear-gradient(180deg, #e74c3c, #a93226)",
          color: "#fff",
          border: spinning ? "2px solid #555" : "2px solid #ff6b5a",
          borderRadius: 10,
          cursor: spinning ? "not-allowed" : "pointer",
          boxShadow: spinning
            ? "none"
            : "0 4px 20px rgba(231,76,60,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          transition: "all 0.3s",
          animation: !spinning && count >= 2 ? "pulseGlow 2s infinite" : "none",
        }}
      >
        {spinning ? "Spinning..." : count < 2 ? "Need 2+ Items" : "SPIN!"}
      </button>
    </div>
  );
}
