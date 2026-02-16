"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CHIP_SPRITE_H,
  CHIP_SPRITE_W,
  DECK_COLORS,
  DECK_COLS,
  DECK_SPRITE_H,
  DECK_SPRITE_W,
  STAKE_COLORS,
} from "../data/items";

const CANVAS_SIZE = 540;
const WHEEL_R = CANVAS_SIZE / 2 - 30;

export default function SpinnerWheel({
  items,
  mode,
  onResult,
  spinning,
  setSpinning,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const angleRef = useRef(0);
  const chipImg = useRef(null);
  const deckImg = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const count = items.length;
  const slice = (2 * Math.PI) / count;

  // Load sprite sheet images
  useEffect(() => {
    let loaded = 0;
    const check = () => {
      if (++loaded >= 2) setImagesLoaded(true);
    };

    const ci = new Image();
    ci.onload = check;
    ci.onerror = check;
    ci.src = "/sprites/chips.png";
    chipImg.current = ci;

    const di = new Image();
    di.onload = check;
    di.onerror = check;
    di.src = "/sprites/decks.png";
    deckImg.current = di;
  }, []);

  const getSliceColor = useCallback(
    (item) => {
      if (item.custom) return { bg: "#5b2c8e", dark: "#3d1b61" };
      if (mode === "stakes") {
        const c = STAKE_COLORS[item.id];
        return c ? { bg: c.bg, dark: c.dark } : { bg: "#888", dark: "#555" };
      }
      const c = DECK_COLORS[item.id];
      return c ? { bg: c.bg, dark: c.dark } : { bg: "#888", dark: "#555" };
    },
    [mode],
  );

  const draw = useCallback(
    (rotation) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const S = CANVAS_SIZE;
      const cx = S / 2,
        cy = S / 2;
      const R = WHEEL_R;

      ctx.clearRect(0, 0, S, S);

      // Outer glow
      ctx.save();
      ctx.shadowColor = "rgba(200, 50, 50, 0.25)";
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fill();
      ctx.restore();

      // Outer ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R + 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // Draw slices
      for (let i = 0; i < count; i++) {
        const item = items[i];
        const startA = rotation + i * slice - Math.PI / 2;
        const endA = startA + slice;
        const { bg, dark } = getSliceColor(item);

        // Slice fill
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, startA, endA);
        ctx.closePath();

        const grad = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R);
        grad.addColorStop(0, lighten(bg, 25));
        grad.addColorStop(0.7, bg);
        grad.addColorStop(1, dark);
        ctx.fillStyle = grad;
        ctx.fill();

        // Slice border
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Inner accent line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, startA, endA);
        ctx.closePath();
        ctx.strokeStyle = "rgba(255,255,255,0.07)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        const midA = startA + slice / 2;

        // Draw sprite icon in the slice
        if (imagesLoaded) {
          const iconDist = R * 0.42;
          const ix = cx + iconDist * Math.cos(midA);
          const iy = cy + iconDist * Math.sin(midA);

          ctx.save();
          ctx.translate(ix, iy);
          ctx.rotate(midA + Math.PI / 2);

          if (mode === "stakes") {
            const chipSize = Math.min(36, 260 / count);
            const col = item.custom ? 9 : item.chipX;
            if (chipImg.current && chipImg.current.complete) {
              ctx.drawImage(
                chipImg.current,
                col * CHIP_SPRITE_W,
                0,
                CHIP_SPRITE_W,
                CHIP_SPRITE_H,
                -chipSize / 2,
                -chipSize / 2,
                chipSize,
                chipSize,
              );
            }
          } else {
            const cardW = Math.min(26, 200 / count);
            const cardH = cardW * (DECK_SPRITE_H / DECK_SPRITE_W);
            const col = item.custom ? 6 : item.spriteX;
            const row = item.custom ? 3 : item.spriteY;
            if (deckImg.current && deckImg.current.complete) {
              ctx.drawImage(
                deckImg.current,
                col * DECK_SPRITE_W,
                row * DECK_SPRITE_H,
                DECK_SPRITE_W,
                DECK_SPRITE_H,
                -cardW / 2,
                -cardH / 2,
                cardW,
                cardH,
              );
            }
          }
          ctx.restore();
        }

        // Text label - positioned along the outer part of the slice
        const textDist = R * 0.72;
        const tx = cx + textDist * Math.cos(midA);
        const ty = cy + textDist * Math.sin(midA);

        ctx.save();
        ctx.translate(tx, ty);
        // Rotate text so it reads outward from center
        let textRot = midA;
        // Flip text on the left half so it's not upside down
        if (midA > Math.PI / 2 && midA < (3 * Math.PI) / 2) {
          textRot += Math.PI;
        }
        ctx.rotate(textRot);

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const maxFontSize = 18;
        const fontSize = Math.min(maxFontSize, Math.floor(320 / count));
        ctx.font = `${fontSize}px m6x11plus, Courier New, monospace`;

        const name = item.name;
        // Split into lines if needed
        const maxLineW = R * slice * 0.55;
        const words = name.split(" ");
        let lines = [];
        let cur = "";
        for (const w of words) {
          const test = cur ? cur + " " + w : w;
          if (ctx.measureText(test).width > maxLineW && cur) {
            lines.push(cur);
            cur = w;
          } else {
            cur = test;
          }
        }
        if (cur) lines.push(cur);

        const lineH = fontSize + 2;
        const totalH = lines.length * lineH;
        lines.forEach((line, li) => {
          ctx.fillText(line, 0, -totalH / 2 + li * lineH + lineH / 2);
        });

        ctx.restore();
      }

      // Center hub
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.13, 0, Math.PI * 2);
      const hubGrad = ctx.createRadialGradient(
        cx - 4,
        cy - 4,
        0,
        cx,
        cy,
        R * 0.13,
      );
      hubGrad.addColorStop(0, "#ffffff");
      hubGrad.addColorStop(0.5, "#d0d0d0");
      hubGrad.addColorStop(1, "#999999");
      ctx.fillStyle = hubGrad;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Inner ring on hub
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.09, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Pointer (right side, pointing left into the wheel)
      ctx.save();
      const ptrX = cx + R + 14;
      ctx.fillStyle = "#e74c3c";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(ptrX, cy);
      ctx.lineTo(ptrX - 32, cy - 18);
      ctx.lineTo(ptrX - 32, cy + 18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#a93226";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Pointer highlight
      ctx.beginPath();
      ctx.moveTo(ptrX - 2, cy);
      ctx.lineTo(ptrX - 28, cy - 12);
      ctx.lineTo(ptrX - 28, cy);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fill();
      ctx.restore();
    },
    [items, count, slice, mode, getSliceColor, imagesLoaded],
  );

  // Redraw when items or images change
  useEffect(() => {
    draw(angleRef.current);
  }, [draw]);

  const spin = useCallback(() => {
    if (spinning || count < 2) return;
    setSpinning(true);

    // Crypto random
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const rand = arr[0] / (0xffffffff + 1);

    const targetIdx = Math.floor(rand * count);
    // Target angle: the pointer is at the right (0 rad before -PI/2 offset),
    // so we need the target slice's midpoint at angle 0 (right side).
    // Slice i center is at: rotation + i*slice + slice/2 - PI/2 = 0  (mod 2PI for pointer at right)
    // So rotation = -i*slice - slice/2 + PI/2... but pointer is on the right, draw offsets by -PI/2.
    // Actually pointer at 0 rad (right). Slice i drawn at rotation + i*slice - PI/2.
    // For pointer to land in slice i: rotation + i*slice - PI/2 + slice/2 ≡ 0 (mod 2PI)
    // rotation = -(i*slice + slice/2) + PI/2
    const targetAngle = -(targetIdx * slice + slice / 2) + Math.PI / 2;
    const extraSpins = (7 + Math.floor(rand * 5)) * 2 * Math.PI;
    const totalSpin = targetAngle + extraSpins - angleRef.current;

    const duration = 4500 + rand * 2500;
    const startTime = performance.now();
    const startAngle = angleRef.current;

    // Custom easing: slow start, fast middle, very slow end
    const ease = (t) => {
      // Modified quintic ease-out with slight bounce feel
      const t1 = 1 - t;
      return 1 - t1 * t1 * t1 * t1 * t1;
    };

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = ease(progress);

      angleRef.current = startAngle + totalSpin * eased;
      draw(angleRef.current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        onResult(items[targetIdx]);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  }, [spinning, count, items, slice, draw, onResult, setSpinning]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          maxWidth: "90vw",
          maxHeight: "60vh",
          cursor: spinning ? "not-allowed" : "pointer",
          filter: "drop-shadow(0 0 30px rgba(0,0,0,0.5))",
        }}
        onClick={spin}
      />
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
          position: "relative",
          overflow: "hidden",
        }}
      >
        {spinning ? "Spinning..." : count < 2 ? "Need 2+ Items" : "SPIN!"}
      </button>
    </div>
  );
}

function lighten(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}
