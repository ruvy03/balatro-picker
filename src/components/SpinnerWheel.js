"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CHIP_SPRITE_H,
  CHIP_SPRITE_W,
  DECK_COLORS,
  DECK_SPRITE_H,
  DECK_SPRITE_W,
  STAKE_COLORS,
} from "../data/items";

const CANVAS_SIZE = 540;
const WHEEL_R = CANVAS_SIZE / 2 - 30;

function lighten(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

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

  // Keep refs to latest props so animation closure always has current values
  const itemsRef = useRef(items);
  const modeRef = useRef(mode);
  const imagesLoadedRef = useRef(imagesLoaded);
  itemsRef.current = items;
  modeRef.current = mode;
  imagesLoadedRef.current = imagesLoaded;

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

  const getSliceColor = (item, m) => {
    if (item.custom) return { bg: "#5b2c8e", dark: "#3d1b61" };
    if (m === "stakes") {
      const c = STAKE_COLORS[item.id];
      return c ? { bg: c.bg, dark: c.dark } : { bg: "#888", dark: "#555" };
    }
    const c = DECK_COLORS[item.id];
    return c ? { bg: c.bg, dark: c.dark } : { bg: "#888", dark: "#555" };
  };

  // Draw function reads from refs so it never goes stale
  const draw = useCallback((rotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const curItems = itemsRef.current;
    const curMode = modeRef.current;
    const curImgLoaded = imagesLoadedRef.current;
    const count = curItems.length;
    if (count === 0) return;
    const sliceAngle = (2 * Math.PI) / count;

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
      const item = curItems[i];
      const startA = rotation + i * sliceAngle - Math.PI / 2;
      const endA = startA + sliceAngle;
      const { bg, dark } = getSliceColor(item, curMode);

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

      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      const midA = startA + sliceAngle / 2;

      // Draw sprite icon in the slice
      if (curImgLoaded) {
        const iconDist = R * 0.42;
        const ix = cx + iconDist * Math.cos(midA);
        const iy = cy + iconDist * Math.sin(midA);

        ctx.save();
        ctx.translate(ix, iy);
        ctx.rotate(midA + Math.PI / 2);

        if (curMode === "stakes") {
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

      // Text label
      const textDist = R * 0.72;
      const tx = cx + textDist * Math.cos(midA);
      const ty = cy + textDist * Math.sin(midA);

      ctx.save();
      ctx.translate(tx, ty);
      let textRot = midA;
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
      const maxLineW = R * sliceAngle * 0.55;
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

    // Pointer at TOP, pointing DOWN into the wheel
    ctx.save();
    const ptrY = cy - R - 14;
    ctx.fillStyle = "#e74c3c";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cx, ptrY + 32); // tip pointing down
    ctx.lineTo(cx - 18, ptrY); // top-left
    ctx.lineTo(cx + 18, ptrY); // top-right
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#a93226";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Highlight
    ctx.beginPath();
    ctx.moveTo(cx, ptrY + 28);
    ctx.lineTo(cx - 12, ptrY + 4);
    ctx.lineTo(cx, ptrY + 4);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fill();
    ctx.restore();
  }, []); // No dependencies — reads everything from refs

  // Redraw when items, mode, or images change
  useEffect(() => {
    draw(angleRef.current);
  }, [items, mode, imagesLoaded, draw]);

  const spin = useCallback(() => {
    if (spinning) return;
    const count = itemsRef.current.length;
    if (count < 2) return;

    // Cancel any lingering animation
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    setSpinning(true);

    const sliceAngle = (2 * Math.PI) / count;

    // Crypto random
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const rand = arr[0] / (0xffffffff + 1);

    const targetIdx = Math.floor(rand * count);

    // Pointer is at top (-PI/2). We need slice targetIdx's midpoint to align there.
    // Slice i's midpoint is at: rotation + i*sliceAngle
    // For it to be at top (0 after the -PI/2 offset in draw): rotation + i*sliceAngle = 0
    // So target rotation = -targetIdx * sliceAngle
    // Add small random offset within the slice for variety (but not too close to edges)
    const sliceOffset = (rand - 0.5) * sliceAngle * 0.6;
    const targetAngle = -(targetIdx * sliceAngle) - sliceOffset;

    // Lots of extra full spins for dramatic effect (15-25 full rotations)
    const extraSpins = (15 + Math.floor(rand * 10)) * 2 * Math.PI;
    const totalSpin = targetAngle + extraSpins - angleRef.current;

    const duration = 5000 + rand * 1500;
    const startTime = performance.now();
    const startAngle = angleRef.current;

    // Quintic ease-out for satisfying deceleration
    const ease = (t) => 1 - Math.pow(1 - t, 5);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = ease(progress);

      angleRef.current = startAngle + totalSpin * eased;
      draw(angleRef.current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        animRef.current = null;
        setSpinning(false);
        onResult(itemsRef.current[targetIdx]);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  }, [spinning, draw, onResult, setSpinning]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
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
        }}
      >
        {spinning ? "Spinning..." : count < 2 ? "Need 2+ Items" : "SPIN!"}
      </button>
    </div>
  );
}
