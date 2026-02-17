"use client";
import {
  CHIP_SHEET_COLS,
  CHIP_SHEET_ROWS,
  CHIP_SPRITE_H,
  CHIP_SPRITE_W,
} from "../data/items";

/*
  Renders a single poker chip from the chips.png sprite sheet.
  chipX = column index, chipY = row index.
  Sheet is 5 columns × 2 rows, each cell 58×58 px.
*/
export default function ChipSprite({
  chipX,
  chipY = 0,
  size = 58,
  isWildcard = false,
}) {
  const col = isWildcard ? 4 : chipX;
  const row = isWildcard ? 1 : chipY;

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        backgroundImage: "url(/sprites/chips.png)",
        backgroundSize: `${CHIP_SHEET_COLS * size}px ${CHIP_SHEET_ROWS * size}px`,
        backgroundPosition: `-${col * size}px -${row * size}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    />
  );
}
