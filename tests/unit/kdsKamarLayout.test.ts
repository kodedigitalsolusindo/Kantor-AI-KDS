import { describe, expect, it } from "vitest";
import {
  DOOR_CLEARANCE,
  FLOOR_BLOCK_Z,
  KAMAR_D,
  KAMAR_W,
  KAMAR_WALL_MARGIN,
  kamarPieces,
} from "@/features/retro-office/scene/kdsKamarLayout";

describe("kdsKamarLayout (KAN-7)", () => {
  const pieces = kamarPieces("#2563eb");
  const wallTop = 1.05;

  it("semua furnitur berada di dalam dinding kamar dan di bawah tinggi dinding", () => {
    for (const p of pieces) {
      expect(p.lx, p.id).toBeGreaterThanOrEqual(0);
      expect(p.ly, p.id).toBeGreaterThanOrEqual(0);
      expect(p.lx + p.w, p.id).toBeLessThanOrEqual(KAMAR_W - 2);
      expect(p.ly + p.d, p.id).toBeLessThanOrEqual(KAMAR_D - 2);
      // AC menempel di dinding luar setinggi lantai penuh (3,0 m).
      expect(0.04 + p.z0 + p.h, p.id).toBeLessThan(p.id.startsWith("ac") ? 3.0 * 58 * 0.018 : wallTop);
    }
    expect(KAMAR_WALL_MARGIN).toBeGreaterThan(0);
  });

  it("bunk bed berukuran sekitar 2 x 1 m (116 x 58 satuan)", () => {
    const f = pieces.find((p) => p.id === "bunk-frame-low")!;
    expect(f.w).toBe(116);
    expect(f.d).toBe(58);
  });

  it("area depan pintu bebas dari furnitur setinggi lantai", () => {
    const c = DOOR_CLEARANCE;
    for (const p of pieces.filter((x) => x.z0 < FLOOR_BLOCK_Z)) {
      const overlap =
        p.lx < c.lx + c.w && p.lx + p.w > c.lx && p.ly < c.ly + c.d && p.ly + p.d > c.ly;
      expect(overlap, p.id).toBe(false);
    }
  });
});
