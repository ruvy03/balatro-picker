/*
  Deck sprite sheet (decks.png): 994 x 950 px
  7 columns, 5 rows
  Each cell: 142 x 190 px (994/7 = 142, 950/5 = 190)
  
  Not all cells are decks — only 15 cells contain card backs.
*/

export const DECK_SPRITE_W = 142;
export const DECK_SPRITE_H = 190;
export const DECK_SHEET_COLS = 7;
export const DECK_SHEET_ROWS = 5;

export const DECKS = [
  { id: "red", name: "Red Deck", spriteX: 0, spriteY: 0 },
  { id: "blue", name: "Blue Deck", spriteX: 0, spriteY: 2 },
  { id: "green", name: "Green Deck", spriteX: 2, spriteY: 2 },
  { id: "yellow", name: "Yellow Deck", spriteX: 1, spriteY: 2 },
  { id: "black", name: "Black Deck", spriteX: 3, spriteY: 2 },
  { id: "erratic", name: "Erratic Deck", spriteX: 2, spriteY: 3 },
  { id: "plasma", name: "Plasma Deck", spriteX: 4, spriteY: 2 },
  { id: "anaglyph", name: "Anaglyph Deck", spriteX: 2, spriteY: 4 },
  { id: "painted", name: "Painted Deck", spriteX: 4, spriteY: 3 },
  { id: "zodiac", name: "Zodiac Deck", spriteX: 3, spriteY: 4 },
  { id: "checkered", name: "Checkered Deck", spriteX: 1, spriteY: 3 },
  { id: "abandoned", name: "Abandoned Deck", spriteX: 3, spriteY: 3 },
  { id: "ghost", name: "Ghost Deck", spriteX: 6, spriteY: 2 },
  { id: "nebula", name: "Nebula Deck", spriteX: 3, spriteY: 0 },
  { id: "magic", name: "Magic Deck", spriteX: 0, spriteY: 3 },
];

// Chip sprite sheet (chips.png): 290 x 116 px
// 5 columns, 2 rows
// Each cell: 58 x 58 px
export const CHIP_SPRITE_W = 58;
export const CHIP_SPRITE_H = 58;
export const CHIP_SHEET_COLS = 5;
export const CHIP_SHEET_ROWS = 2;

export const STAKES = [
  { id: "white", name: "White Stake", chipX: 0, chipY: 0 },
  { id: "red", name: "Red Stake", chipX: 1, chipY: 0 },
  { id: "green", name: "Green Stake", chipX: 2, chipY: 0 },
  { id: "black", name: "Black Stake", chipX: 4, chipY: 0 },
  { id: "blue", name: "Blue Stake", chipX: 3, chipY: 0 },
  { id: "purple", name: "Purple Stake", chipX: 0, chipY: 1 },
  { id: "orange", name: "Orange Stake", chipX: 1, chipY: 1 },
  { id: "gold", name: "Gold Stake", chipX: 2, chipY: 1 },
];

// Colors for wheel slice backgrounds
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
  magic: { bg: "#7d6ca3", dark: "#5b4d80" },
  nebula: { bg: "#1e3a5f", dark: "#0f1d30" },
  ghost: { bg: "#95a5a6", dark: "#717d7e" },
  abandoned: { bg: "#566573", dark: "#3d4a54" },
  checkered: { bg: "#c0392b", dark: "#922b21" },
  zodiac: { bg: "#f5cba7", dark: "#d4a56a" },
  painted: { bg: "#f0dcc0", dark: "#c4a882" },
  anaglyph: { bg: "#6a3d7d", dark: "#4a2b57" },
  plasma: { bg: "#c39bd3", dark: "#a07db8" },
  erratic: { bg: "#1b2631", dark: "#0d1318" },
  challenge: { bg: "#6c5ce7", dark: "#5241b0" },
};
