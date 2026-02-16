"use client";
import { useEffect, useRef } from "react";

/*
  Balatro-style CRT / psychedelic background using a canvas shader-like approach.
  Draws animated swirling dark colors similar to the Balatro menu screen.
*/
export default function BalatroBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.width,
        H = canvas.height;
      // Scale down for performance - draw at 1/4 res then upscale
      const scale = 4;
      const sw = Math.ceil(W / scale),
        sh = Math.ceil(H / scale);

      const offscreen = document.createElement("canvas");
      offscreen.width = sw;
      offscreen.height = sh;
      const octx = offscreen.getContext("2d");
      const imgData = octx.createImageData(sw, sh);
      const d = imgData.data;

      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const u = x / sw - 0.5;
          const v = y / sh - 0.5;

          // Swirling noise-like pattern
          const angle = Math.atan2(v, u);
          const dist = Math.sqrt(u * u + v * v);

          const n1 = Math.sin(u * 6 + t * 0.3) * Math.cos(v * 6 + t * 0.2);
          const n2 = Math.sin((u + v) * 4 - t * 0.25) * 0.5;
          const n3 = Math.cos(dist * 12 - t * 0.4) * 0.3;
          const val = (n1 + n2 + n3) * 0.33;

          // Dark Balatro palette: deep navy, dark red, near-black
          const r = Math.floor(
            12 + (val + 0.5) * 18 + Math.sin(angle + t * 0.1) * 8,
          );
          const g = Math.floor(8 + (val + 0.5) * 10);
          const b = Math.floor(
            20 + (val + 0.5) * 25 + Math.cos(dist * 8 - t * 0.3) * 10,
          );

          const idx = (y * sw + x) * 4;
          d[idx] = Math.max(0, Math.min(40, r));
          d[idx + 1] = Math.max(0, Math.min(25, g));
          d[idx + 2] = Math.max(0, Math.min(50, b));
          d[idx + 3] = 255;
        }
      }

      octx.putImageData(imgData, 0, 0);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offscreen, 0, 0, W, H);

      // CRT scanline overlay
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      for (let y = 0; y < H; y += 3) {
        ctx.fillRect(0, y, W, 1);
      }

      // Slight vignette
      const vg = ctx.createRadialGradient(
        W / 2,
        H / 2,
        W * 0.2,
        W / 2,
        H / 2,
        W * 0.75,
      );
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      t += 0.016;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
