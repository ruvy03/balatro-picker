"use client";
import { CHIP_SPRITE_H, CHIP_SPRITE_W } from "../data/items";

/*
  Renders a single poker chip from the chips.png sprite sheet.
  chipX = column index in the single-row sprite strip.
  For custom/wildcard entries, pass chipX={8} (the 9th chip - special one).
*/
export default function ChipSprite({ chipX, size = 73, isWildcard = false }) {
  // Wildcard: use the last special chip (index 9)
  const col = isWildcard ? 9 : chipX;

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        backgroundImage: "url(/sprites/chips.png)",
        backgroundSize: `${((CHIP_SPRITE_W * 10) / CHIP_SPRITE_W) * size}px ${size}px`,
        backgroundPosition: `-${col * size}px 0px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    />
  );
}
