export const DECK_SPRITE_W = 128;
export const DECK_SPRITE_H = 178;
export const DECK_COLS = 8;

export const DECKS = [
  { id: "red", name: "Red Deck", spriteX: 0, spriteY: 0 },
  { id: "blue", name: "Blue Deck", spriteX: 0, spriteY: 2 },
  { id: "yellow", name: "Yellow Deck", spriteX: 1, spriteY: 2 },
  { id: "green", name: "Green Deck", spriteX: 2, spriteY: 2 },
  { id: "black", name: "Black Deck", spriteX: 3, spriteY: 2 },
  { id: "magic", name: "Magic Deck", spriteX: 5, spriteY: 0 },
  { id: "nebula", name: "Nebula Deck", spriteX: 3, spriteY: 0 },
  { id: "ghost", name: "Ghost Deck", spriteX: 4, spriteY: 0 },
  { id: "abandoned", name: "Abandoned Deck", spriteX: 5, spriteY: 0 },
  { id: "checkered", name: "Checkered Deck", spriteX: 6, spriteY: 0 },
  { id: "zodiac", name: "Zodiac Deck", spriteX: 7, spriteY: 0 },
  { id: "painted", name: "Painted Deck", spriteX: 4, spriteY: 2 },
  { id: "anaglyph", name: "Anaglyph Deck", spriteX: 5, spriteY: 2 },
  { id: "plasma", name: "Plasma Deck", spriteX: 6, spriteY: 2 },
  { id: "erratic", name: "Erratic Deck", spriteX: 7, spriteY: 2 },
  { id: "challenge", name: "Challenge Deck", spriteX: 3, spriteY: 3 },
];

// Chip sprite positions (chips.png): single row, each chip ~73x73
// Order from Image 2: white, red, green, blue, black, purple, orange, gold, (special1), (special2)
export const CHIP_SPRITE_W = 73;
export const CHIP_SPRITE_H = 73;

export const STAKES = [
  { id: "white", name: "White Stake", chipX: 0 },
  { id: "red", name: "Red Stake", chipX: 1 },
  { id: "green", name: "Green Stake", chipX: 2 },
  { id: "black", name: "Black Stake", chipX: 4 },
  { id: "blue", name: "Blue Stake", chipX: 3 },
  { id: "purple", name: "Purple Stake", chipX: 5 },
  { id: "orange", name: "Orange Stake", chipX: 6 },
  { id: "gold", name: "Gold Stake", chipX: 7 },
];

// Colors for fallback / wheel slices
export const STAKE_COLORS = {
  white: { bg: "#e8e8e8", dark: "#c0c0c0", text: "#333" },
  red: { bg: "#e74c3c", dark: "#a93226", text: "#fff" },
  green: { bg: "#27ae60", dark: "#1a7a42", text: "#fff" },
  black: { bg: "#2c3e50", dark: "#1a252f", text: "#fff" },
  blue: { bg: "#3498db", dark: "#2176ad", text: "#fff" },
  purple: { bg: "#9b59b6", dark: "#76448a", text: "#fff" },
  orange: { bg: "#e67e22", dark: "#b8641a", text: "#fff" },
  gold: { bg: "#f1c40f", dark: "#c9a40b", text: "#333" },
};

export const DECK_COLORS = {
  red: { bg: "#c0392b", dark: "#922b21" },
  blue: { bg: "#2980b9", dark: "#1f6f99" },
  yellow: { bg: "#f39c12", dark: "#c87f0a" },
  green: { bg: "#27ae60", dark: "#1a7a42" },
  black: { bg: "#2c3e50", dark: "#1a252f" },
  magic: { bg: "#1a1a3e", dark: "#0f0f28" },
  nebula: { bg: "#1e3a5f", dark: "#0f1d30" },
  ghost: { bg: "#95a5a6", dark: "#717d7e" },
  abandoned: { bg: "#566573", dark: "#3d4a54" },
  checkered: { bg: "#c0392b", dark: "#922b21" },
  zodiac: { bg: "#f5cba7", dark: "#d4a56a" },
  painted: { bg: "#e74c3c", dark: "#a93226" },
  anaglyph: { bg: "#8e44ad", dark: "#6c3483" },
  plasma: { bg: "#1a1a3e", dark: "#0f0f28" },
  erratic: { bg: "#2d3436", dark: "#1a1c1d" },
  challenge: { bg: "#6c5ce7", dark: "#5241b0" },
};
