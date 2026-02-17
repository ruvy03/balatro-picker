"use client";
import {
  DECK_SHEET_COLS,
  DECK_SHEET_ROWS,
  DECK_SPRITE_H,
  DECK_SPRITE_W,
} from "../data/items";

/*
  Renders a card back from the decks.png sprite sheet.
  spriteX = column index, spriteY = row index in the sheet.
  The sheet is 7 columns × 5 rows, each cell 142×190 px.
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

  return (
    <div
      style={{
        width: width,
        height: h,
        flexShrink: 0,
        backgroundImage: "url(/sprites/decks.png)",
        backgroundSize: `${DECK_SHEET_COLS * width}px ${DECK_SHEET_ROWS * h}px`,
        backgroundPosition: `-${col * width}px -${row * h}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        borderRadius: 6,
      }}
    />
  );
}
