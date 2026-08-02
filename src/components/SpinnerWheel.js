"use client";
import confetti from "canvas-confetti";
import { useCallback, useEffect, useRef, useState } from "react";
import { Wheel } from "spin-wheel";
import { DECK_COLORS, STAKE_COLORS } from "../data/items";

function easeCubicOut(n) {
  return 1 - Math.pow(1 - n, 3);
}

const BULB_COUNT = 18;
const BULB_ANGLES = Array.from(
  { length: BULB_COUNT },
  (_, i) => (360 / BULB_COUNT) * i,
);

function getItemColor(item, mode) {
  if (item.custom) return "#9b59b6";
  const table = mode === "stakes" ? STAKE_COLORS : DECK_COLORS;
  return table[item.id]?.bg || "#e74c3c";
}

export default function SpinnerWheel({ items, mode, onResult, musicEnabled }) {
  const containerRef = useRef(null);
  const wheelRef = useRef(null);
  const pointerRef = useRef(null);
  const spinningRef = useRef(false);
  const [spinning, setSpinningState] = useState(false);
  const [ready, setReady] = useState(false);
  const [flashColor, setFlashColor] = useState(null);
  const flashTimeoutRef = useRef(null);

  const itemsRef = useRef(items);
  const onResultRef = useRef(onResult);
  const musicEnabledRef = useRef(musicEnabled);

  // Web Audio API refs
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const spinSourceRef = useRef(null);
  const spinBufferRef = useRef(null);
  const winAudioRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);
  useEffect(() => {
    musicEnabledRef.current = musicEnabled;
  }, [musicEnabled]);

  // Preload audio
  useEffect(() => {
    // Win sound — simple HTML audio is fine
    winAudioRef.current = new Audio("/win.ogg");
    winAudioRef.current.preload = "auto";

    // Spin music — load into Web Audio API buffer for gain control
    const loadSpinAudio = async () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;

        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNodeRef.current = gainNode;

        const resp = await fetch("/music2.mp3");
        const arrayBuf = await resp.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);
        spinBufferRef.current = audioBuf;
      } catch (e) {
        console.warn("Failed to load spin audio:", e);
      }
    };

    loadSpinAudio();

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Clear any pending flash timeout on unmount
  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  const stopSpinAudio = useCallback(() => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    if (spinSourceRef.current) {
      try {
        spinSourceRef.current.stop();
      } catch (e) {}
      spinSourceRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.cancelScheduledValues(0);
      gainNodeRef.current.gain.value = 1;
    }
  }, []);

  const playSpinAudio = useCallback(
    (duration) => {
      const ctx = audioCtxRef.current;
      const buffer = spinBufferRef.current;
      const gainNode = gainNodeRef.current;
      if (!ctx || !buffer || !gainNode) return;

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      stopSpinAudio();

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);

      // Start at full volume
      gainNode.gain.setValueAtTime(1, ctx.currentTime);

      // Fade out over the last 2 seconds
      const fadeStart = Math.max(0, duration / 1000 - 2);
      gainNode.gain.setValueAtTime(1, ctx.currentTime + fadeStart);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeStart + 2);

      source.start(0);
      spinSourceRef.current = source;

      // Auto-stop source after duration + small buffer
      fadeTimeoutRef.current = setTimeout(() => {
        stopSpinAudio();
      }, duration + 500);
    },
    [stopSpinAudio],
  );

  // Stop audio if music gets disabled mid-spin
  useEffect(() => {
    if (!musicEnabled) {
      stopSpinAudio();
    }
  }, [musicEnabled, stopSpinAudio]);

  // Confetti burst centered on the wheel, colored to match the winning item
  const fireConfetti = useCallback((colorHex) => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;
    const rect = el.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
    confetti({
      particleCount: 110,
      spread: 100,
      startVelocity: 45,
      gravity: 0.9,
      scalar: 0.9,
      ticks: 220,
      origin,
      colors: [colorHex, "#ffffff", "#f1c40f"],
      zIndex: 1500,
    });
  }, []);

  const getLabel = (item) => {
    return item.name.replace(/ Deck$/i, "").replace(/ Stake$/i, "");
  };

  const buildWheelItems = useCallback((curItems, curMode) => {
    return curItems.map((item) => {
      const entry = { label: getLabel(item), value: item };
      if (curMode === "stakes") {
        const c = item.custom
          ? { bg: "#5b2c8e", dark: "#3d1b61" }
          : STAKE_COLORS[item.id] || { bg: "#888", dark: "#555" };
        entry.backgroundColor = c.bg;
        entry.labelColor = "#fff";
      } else {
        const c = item.custom
          ? { bg: "#5b2c8e", dark: "#3d1b61" }
          : DECK_COLORS[item.id] || { bg: "#888", dark: "#555" };
        entry.backgroundColor = c.bg;
        entry.labelColor = "#fff";
      }
      return entry;
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const setup = () => {
      const wheelItems = buildWheelItems(items, mode);
      if (cancelled) return;

      if (wheelRef.current) {
        try {
          wheelRef.current.remove();
        } catch (e) {}
        wheelRef.current = null;
      }

      containerRef.current.innerHTML = "";

      const props = {
        items: wheelItems,
        itemLabelFont: "m6x11plus, Courier New, monospace",
        itemLabelFontSizeMax: Math.min(32, Math.floor(480 / items.length)),
        itemLabelRadius: 0.82,
        itemLabelRadiusMax: 0.45,
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
        isInteractive: false,
        pixelRatio: 0,
        onCurrentIndexChange: () => {
          const el = pointerRef.current;
          if (!el) return;
          el.classList.remove("tick-punch");
          void el.offsetWidth;
          el.classList.add("tick-punch");
        },
        onRest: (e) => {
          spinningRef.current = false;
          setSpinningState(false);

          // Play win sound
          if (musicEnabledRef.current && winAudioRef.current) {
            winAudioRef.current.currentTime = 0;
            winAudioRef.current.play().catch(() => {});
          }

          const idx = e.currentIndex;
          const ci = itemsRef.current;
          const item = ci && ci[idx];
          if (item) {
            const color = getItemColor(item, mode);
            fireConfetti(color);
            setFlashColor(color);
            if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
            flashTimeoutRef.current = setTimeout(() => setFlashColor(null), 700);
            onResultRef.current(item);
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
      // Reset spinning state if wheel gets destroyed mid-spin
      if (spinningRef.current) {
        spinningRef.current = false;
        setSpinningState(false);
        stopSpinAudio();
      }
    };
  }, [items, mode, buildWheelItems, stopSpinAudio, fireConfetti]);

  const spin = useCallback(() => {
    if (spinningRef.current) return;
    const wheel = wheelRef.current;
    const count = itemsRef.current.length;
    if (!wheel || count < 2) return;

    spinningRef.current = true;
    setSpinningState(true);

    const duration = 4000 + Math.random() * 2000;
    const revolutions = 6 + Math.floor(Math.random() * 4);

    // Play spin music with fade-out timed to duration
    if (musicEnabledRef.current) {
      playSpinAudio(duration);
    }

    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const targetIdx = arr[0] % count;

    wheel.spinToItem(targetIdx, duration, false, revolutions, 1, easeCubicOut);
  }, [playSpinAudio]);

  const count = items.length;
  const glowColor = mode === "stakes" ? "231,76,60" : "52,152,219";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 480,
          height: 480,
          maxWidth: "85vw",
          maxHeight: "55vh",
          aspectRatio: "1 / 1",
          animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        {/* Ambient glow behind the wheel, colored by mode */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "92%",
            height: "92%",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${glowColor},0.55) 0%, rgba(${glowColor},0.15) 55%, transparent 75%)`,
              filter: "blur(6px)",
              animation: "wheelGlowPulse 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* Dark rim housing so the marquee lights read clearly against the busy background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "16px solid rgba(15, 12, 10, 0.6)",
            boxShadow:
              "inset 0 0 24px rgba(0,0,0,0.65), 0 4px 18px rgba(0,0,0,0.5)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Marquee light bulbs ringing the wheel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            pointerEvents: "none",
          }}
        >
          {BULB_ANGLES.map((angle, i) => (
            <div
              key={i}
              style={{ position: "absolute", inset: 0, transform: `rotate(${angle}deg)` }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  className="wheel-bulb"
                  style={{
                    width: 11,
                    height: 11,
                    background: i % 2 === 0 ? "#f9e79f" : "#f1c40f",
                    boxShadow: `0 0 10px 3px ${
                      i % 2 === 0 ? "rgba(249,231,159,0.9)" : "rgba(241,196,15,0.9)"
                    }`,
                    animationDelay: `${i * 0.09}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Wheel canvas mount */}
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            inset: "8%",
            zIndex: 4,
            filter: "drop-shadow(0 0 30px rgba(0,0,0,0.55))",
          }}
        />

        {/* Center hub cap */}
        <div
          className="wheel-hub"
          style={{
            width: "17%",
            height: "17%",
            background:
              "radial-gradient(circle at 35% 30%, #fff6d0 0%, #f1c40f 35%, #b8860b 75%, #7a5c08 100%)",
            boxShadow:
              "0 3px 10px rgba(0,0,0,0.55), inset 0 2px 3px rgba(255,255,255,0.6), inset 0 -3px 6px rgba(0,0,0,0.4), 0 0 0 3px rgba(0,0,0,0.5)",
          }}
        >
          <img
            src="/sprites/mlb-logo.png"
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              imageRendering: "pixelated",
            }}
          />
        </div>

        {/* Pointer */}
        <div
          style={{
            position: "absolute",
            top: -22,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))",
          }}
        >
          <div ref={pointerRef} className="pointer-gem" />
        </div>
      </div>

      <button
        onClick={spin}
        disabled={spinning || count < 2}
        className={`balatro-btn${!spinning && count >= 2 ? " balatro-btn--pulse" : ""}`}
        style={{
          "--btn-color": "var(--accent-red)",
          "--btn-shadow": "var(--accent-red-dark)",
          marginTop: 28,
          padding: "14px 56px",
          fontSize: 24,
          fontFamily: "var(--font-balatro)",
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        {spinning ? "Spinning..." : count < 2 ? "Need 2+ Items" : "SPIN!"}
      </button>

      {/* Full-screen color flash on result */}
      {flashColor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            pointerEvents: "none",
            background: `radial-gradient(circle at 50% 45%, ${flashColor} 0%, transparent 70%)`,
            animation: "resultFlash 0.7s ease-out forwards",
            mixBlendMode: "screen",
          }}
        />
      )}
    </div>
  );
}
