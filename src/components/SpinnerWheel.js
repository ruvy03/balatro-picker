"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Wheel } from "spin-wheel";
import { DECK_COLORS, STAKE_COLORS } from "../data/items";

function easeCubicOut(n) {
  return 1 - Math.pow(1 - n, 3);
}

export default function SpinnerWheel({ items, mode, onResult, musicEnabled }) {
  const containerRef = useRef(null);
  const wheelRef = useRef(null);
  const spinningRef = useRef(false);
  const [spinning, setSpinningState] = useState(false);
  const [ready, setReady] = useState(false);

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
      // Reset spinning state if wheel gets destroyed mid-spin
      if (spinningRef.current) {
        spinningRef.current = false;
        setSpinningState(false);
        stopSpinAudio();
      }
    };
  }, [items, mode, buildWheelItems, stopSpinAudio]);

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
          width: 0,
          height: 0,
          borderLeft: "18px solid transparent",
          borderRight: "18px solid transparent",
          borderTop: "30px solid #e74c3c",
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.5))",
          zIndex: 10,
          marginBottom: -4,
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

      <button
        onClick={spin}
        disabled={spinning || count < 2}
        style={{
          marginTop: 24,
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
