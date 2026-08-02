"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import BalatroBackground from "../components/BalatroBackground";
import ChipSprite from "../components/ChipSprite";
import DeckSprite from "../components/DeckSprite";
import ResultModal from "../components/ResultModal";
import Sidebar from "../components/Sidebar";
import SpinnerWheel from "../components/SpinnerWheel";
import Toast from "../components/Toast";
import { DECKS, STAKES } from "../data/items";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState("stakes");
  const [disabledStakes, setDisabledStakes] = useState({});
  const [disabledDecks, setDisabledDecks] = useState({});
  const [customStakes, setCustomStakes] = useState([]);
  const [customDecks, setCustomDecks] = useState([]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState("shader");
  const [toastVisible, setToastVisible] = useState(true);
  const [toastClosing, setToastClosing] = useState(false);

  useEffect(() => {
    const closeTimer = setTimeout(() => setToastClosing(true), 3000);
    const removeTimer = setTimeout(() => setToastVisible(false), 3350);
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const toggleStake = useCallback((id) => {
    setDisabledStakes((d) => ({ ...d, [id]: !d[id] }));
  }, []);

  const toggleDeck = useCallback((id) => {
    setDisabledDecks((d) => ({ ...d, [id]: !d[id] }));
  }, []);

  const addCustomStake = useCallback((name) => {
    setCustomStakes((c) => (c.includes(name) ? c : [...c, name]));
  }, []);

  const addCustomDeck = useCallback((name) => {
    setCustomDecks((c) => (c.includes(name) ? c : [...c, name]));
  }, []);

  const removeCustomStake = useCallback((name) => {
    setCustomStakes((c) => c.filter((n) => n !== name));
  }, []);

  const removeCustomDeck = useCallback((name) => {
    setCustomDecks((c) => c.filter((n) => n !== name));
  }, []);

  // Build active items lists — memoized so SpinnerWheel's `items` prop keeps
  // a stable reference across unrelated re-renders (e.g. the toast timer),
  // otherwise its setup effect tears down and rebuilds the wheel mid-spin.
  const activeStakes = useMemo(
    () => [
      ...STAKES.filter((s) => !disabledStakes[s.id]),
      ...customStakes.map((name) => ({
        id: `custom-${name}`,
        name,
        custom: true,
      })),
    ],
    [disabledStakes, customStakes],
  );
  const activeDecks = useMemo(
    () => [
      ...DECKS.filter((d) => !disabledDecks[d.id]),
      ...customDecks.map((name) => ({
        id: `custom-${name}`,
        name,
        custom: true,
      })),
    ],
    [disabledDecks, customDecks],
  );

  const currentItems = mode === "stakes" ? activeStakes : activeDecks;

  const handleResult = useCallback(
    (item) => {
      setResult(item);
      setHistory((h) => [
        { ...item, mode, time: new Date().toLocaleTimeString() },
        ...h.slice(0, 29),
      ]);
    },
    [mode],
  );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <BalatroBackground variant={backgroundStyle} />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        mode={mode}
        setMode={setMode}
        disabledStakes={disabledStakes}
        disabledDecks={disabledDecks}
        toggleStake={toggleStake}
        toggleDeck={toggleDeck}
        customStakes={customStakes}
        customDecks={customDecks}
        addCustomStake={addCustomStake}
        addCustomDeck={addCustomDeck}
        removeCustomStake={removeCustomStake}
        removeCustomDeck={removeCustomDeck}
        history={history}
        activeCount={currentItems.length}
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        backgroundStyle={backgroundStyle}
        setBackgroundStyle={setBackgroundStyle}
      />

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px 40px",
          position: "relative",
          zIndex: 1,
          overflow: "auto",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 16,
            color: "var(--text-muted)",
            letterSpacing: 5,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {mode === "stakes" ? "◆ Stake" : "♠ Deck"} Picker
        </div>
        <h1
          style={{
            fontSize: 40,
            marginBottom: 28,
            letterSpacing: 4,
            background:
              "linear-gradient(135deg, #e74c3c 0%, #ff6b5a 25%, #fff3c4 50%, #3498db 75%, #5dade2 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
            lineHeight: 1.2,
            animation: "shimmer 5s linear infinite",
          }}
        >
          MAJOR LEAGUE BALATRO
        </h1>

        {/* Spinner */}
        {currentItems.length >= 2 ? (
          <SpinnerWheel
            items={currentItems}
            mode={mode}
            onResult={handleResult}
            musicEnabled={musicEnabled}
          />
        ) : (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }}>
              🎰
            </div>
            <div style={{ fontSize: 20 }}>
              Enable at least 2 {mode} to spin!
            </div>
          </div>
        )}

        {/* Last result display */}
        {result && (
          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 28px",
              background: "rgba(0, 0, 0, 0.4)",
              borderRadius: 14,
              border: "1px solid var(--border-light)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
            }}
          >
            {mode === "stakes" ? (
              <ChipSprite
                chipX={result.custom ? 4 : result.chipX}
                chipY={result.custom ? 1 : result.chipY}
                size={48}
                isWildcard={result.custom}
              />
            ) : (
              <DeckSprite
                spriteX={result.custom ? 6 : result.spriteX}
                spriteY={result.custom ? 3 : result.spriteY}
                width={34}
                isWildcard={result.custom}
              />
            )}
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Last Result
              </div>
              <div style={{ fontSize: 22, color: "#fff" }}>{result.name}</div>
            </div>
          </div>
        )}
      </div>

      {/* Result modal */}
      <ResultModal
        result={result}
        mode={mode}
        onClose={() => setResult(null)}
      />

      <Toast visible={toastVisible} closing={toastClosing} />
    </div>
  );
}
