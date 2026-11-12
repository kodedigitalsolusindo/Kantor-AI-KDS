import { describe, expect, it } from "vitest";
import {
  CHAIR_SIZE,
  CHAIR_XS,
  COUNTER,
  FRIDGE,
  MAKAN_D,
  MAKAN_SIGNS,
  MAKAN_W,
  MAKAN_WALL_X1,
  MAKAN_X0,
  MAKAN_Y0,
  MIN_CLEARANCE,
  TABLE,
  WALL_TOP,
  makanPieces,
  signWidth,
  type MakanPiece,
} from "@/features/retro-office/scene/kdsMakanLayout";
import { SLAB_TOP } from "@/features/retro-office/scene/kdsKamarLayout";

const pieces = makanPieces();
const fp = pieces.filter((p) => p.fp);
const chairs = fp.filter((p) => p.group === "chair");

const overlap = (a: MakanPiece, b: MakanPiece) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.d && a.y + a.d > b.y;
const gap = (a: { x: number; y: number; w: number; d: number }, b: { x: number; y: number; w: number; d: number }) => {
  const dx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), 0);
  const dy = Math.max(b.y - (a.y + a.d), a.y - (b.y + b.d), 0);
  return Math.hypot(dx, dy);
};

describe("kdsMakanLayout (KAN-8)", () => {
  it("semua furnitur di dalam zona ruang makan dan di bawah tinggi dinding", () => {
    for (const p of pieces) {
      expect(p.x, p.id).toBeGreaterThanOrEqual(MAKAN_X0);
      expect(p.y, p.id).toBeGreaterThanOrEqual(MAKAN_Y0);
      expect(p.x + p.w, p.id).toBeLessThanOrEqual(MAKAN_X0 + MAKAN_W);
      expect(p.y + p.d, p.id).toBeLessThanOrEqual(MAKAN_Y0 + MAKAN_D);
      expect(SLAB_TOP + p.z0 + p.h, p.id).toBeLessThan(WALL_TOP);
    }
  });

  it("meja 2,6 x 1,0 m dan tepat 10 kursi 0,45 m (5 utara + 5 selatan)", () => {
    expect(TABLE.w).toBe(151);
    expect(TABLE.d).toBe(58);
    expect(CHAIR_SIZE).toBe(26);
    expect(chairs).toHaveLength(10);
    expect(CHAIR_XS).toHaveLength(5);
    const midTable = TABLE.y + TABLE.d / 2;
    expect(chairs.filter((c) => c.y + c.d / 2 < midTable)).toHaveLength(5);
    expect(chairs.filter((c) => c.y + c.d / 2 > midTable)).toHaveLength(5);
  });

  it("tidak ada tabrakan antar jejak lantai (meja, kursi, kitchen set, kulkas, dll.)", () => {
    for (let i = 0; i < fp.length; i++) {
      for (let j = i + 1; j < fp.length; j++) {
        expect(overlap(fp[i], fp[j]), `${fp[i].id} x ${fp[j].id}`).toBe(false);
      }
    }
  });

  it("kursi tidak menembus meja dan sandaran berada di sisi jauh dari meja", () => {
    const midTable = TABLE.y + TABLE.d / 2;
    for (const c of chairs) {
      expect(c.x).toBeGreaterThanOrEqual(TABLE.x);
      expect(c.x + c.w).toBeLessThanOrEqual(TABLE.x + TABLE.w);
      const back = pieces.find((p) => p.id === c.id.replace("-seat", "-back"))!;
      const north = c.y < midTable;
      if (north) expect(back.y).toBe(c.y);
      else expect(back.y + back.d).toBe(c.y + c.d);
    }
  });

  it("ruang gerak minimal 1 m di sekeliling meja + kursi", () => {
    const set = [...fp.filter((p) => p.group === "table" || p.group === "chair")];
    const x0 = Math.min(...set.map((p) => p.x));
    const x1 = Math.max(...set.map((p) => p.x + p.w));
    const y0 = Math.min(...set.map((p) => p.y));
    const y1 = Math.max(...set.map((p) => p.y + p.d));
    const box = { x: x0, y: y0, w: x1 - x0, d: y1 - y0 };
    // Dinding barat, utara, dan timur ruang makan.
    expect(x0 - MAKAN_X0).toBeGreaterThanOrEqual(MIN_CLEARANCE);
    expect(y0 - MAKAN_Y0).toBeGreaterThanOrEqual(MIN_CLEARANCE);
    expect(MAKAN_WALL_X1 - x1).toBeGreaterThanOrEqual(MIN_CLEARANCE);
    // Furnitur lain (kitchen set, kulkas, dispenser, sampah) — diukur dari set meja+kursi.
    for (const p of fp.filter((q) => q.group !== "table" && q.group !== "chair")) {
      expect(gap(box, p), p.id).toBeGreaterThanOrEqual(MIN_CLEARANCE);
    }
  });

  it("kitchen set menempel dinding timur (counter, kabinet atas, kulkas, sampah)", () => {
    expect(COUNTER.x + COUNTER.w).toBe(MAKAN_WALL_X1);
    expect(FRIDGE.x + FRIDGE.w).toBe(MAKAN_WALL_X1);
    for (const id of ["upper-cabinet", "bin-organic", "bin-inorganic"]) {
      const p = pieces.find((q) => q.id === id)!;
      expect(p.x + p.w, id).toBe(MAKAN_WALL_X1);
    }
    // Kitchen set mencakup kompor, sink, kulkas, kabinet.
    for (const id of ["stove-plate", "sink-basin", "fridge", "upper-cabinet"]) {
      expect(pieces.some((p) => p.id === id), id).toBe(true);
    }
  });

  it("kitchen set tidak menutup jalur koridor (koridor x 0..116)", () => {
    for (const p of pieces.filter((q) => q.group === "kitchen")) {
      expect(p.x, p.id).toBeGreaterThan(116);
    }
  });

  it("signage ruang makan & pantry tidak tertutup furnitur dari arah kamera", () => {
    for (const s of MAKAN_SIGNS) {
      const w = signWidth(s.text.length);
      const bottom = s.z - s.height / 2;
      // Area antara papan dan kamera (arah +x/+y lokal, 60 satuan).
      const view = { x: s.x - w / 2, y: s.y - 5, w: w + 60, d: 65 };
      for (const p of pieces) {
        if (!overlap({ ...p } as MakanPiece, { ...p, ...view } as MakanPiece)) continue;
        expect(SLAB_TOP + p.z0 + p.h, `${s.id} <- ${p.id}`).toBeLessThanOrEqual(bottom);
      }
    }
  });
});
