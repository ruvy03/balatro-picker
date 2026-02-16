"use client";
import { DECK_COLS, DECK_SPRITE_H, DECK_SPRITE_W } from "../data/items";

/*
  Renders a card back from the decks.png sprite sheet.
  spriteX = column index, spriteY = row index in the sheet.
  The sheet is 8 columns wide, each cell 128x178 px.
  For wildcard/custom: uses the question mark sprite (row 3, col 6 or 7).
*/
export default function DeckSprite({
  spriteX,
  spriteY,
  width = 95,
  isWildcard = false,
}) {
  const col = isWildcard ? 6 : spriteX;
  const row = isWildcard ? 3 : spriteY;
  const h = width * (DECK_SPRITE_H / DECK_SPRITE_W);

  // Total sheet dimensions
  const sheetCols = DECK_COLS;
  const sheetRows = 6; // approximate rows visible in Image 1

  return (
    <div
      style={{
        width: width,
        height: h,
        flexShrink: 0,
        backgroundImage: "url(/sprites/decks.png)",
        backgroundSize: `${sheetCols * width}px ${sheetRows * h}px`,
        backgroundPosition: `-${col * width}px -${row * h}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        borderRadius: 6,
      }}
    />
  );
}
