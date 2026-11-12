import { describe, expect, it } from "vitest";
import {
  BEANBAGS,
  COFFEE,
  CONSOLE,
  FACADE_GLASS,
  LANE_NORTH,
  LOUNGE_D,
  LOUNGE_GLASS_Y,
  LOUNGE_SIGNS,
  LOUNGE_W,
  LOUNGE_X0,
  LOUNGE_Y0,
  MIN_CLEARANCE,
  PLANTS,
  SOFA_CHAISE,
  SOFA_FACING,
  SOFA_MAIN,
  TV,
  WALL_TOP,
  loungePieces,
  signWidth,
  type LoungePiece,
} from "@/features/retro-office/scene/kdsLoungeLayout";
import { SLAB_TOP } from "@/features/retro-office/scene/kdsKamarLayout";

const pieces = loungePieces();
const fp = pieces.filter((p) => p.fp);
type R = { x: number; y: number; w: number; d: number };
const overlap = (a: R, b: R) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.d && a.y + a.d > b.y;
const gap = (a: R, b: R) => {
  const dx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), 0);
  const dy = Math.max(b.y - (a.y + a.d), a.y - (b.y + b.d), 0);
  return Math.hypot(dx, dy);
};
const group = (g: LoungePiece["group"]) => pieces.filter((p) => p.group === g);

describe("kdsLoungeLayout (KAN-9)", () => {
  it("semua furnitur di dalam zona lounge, di belakang kaca, dan di bawah tinggi dinding", () => {
    for (const p of pieces) {
      expect(p.x, p.id).toBeGreaterThanOrEqual(LOUNGE_X0);
      expect(p.y, p.id).toBeGreaterThanOrEqual(LOUNGE_Y0);
      expect(p.x + p.w, p.id).toBeLessThanOrEqual(LOUNGE_X0 + LOUNGE_W);
      expect(p.y + p.d, p.id).toBeLessThanOrEqual(LOUNGE_Y0 + LOUNGE_D);
      expect(p.y + p.d, p.id).toBeLessThanOrEqual(LOUNGE_GLASS_Y);
      expect(SLAB_TOP + p.z0 + p.h, p.id).toBeLessThan(WALL_TOP);
    }
  });

  it("kelengkapan: sofa L, TV, 4 bean bag, rak buku, tanaman", () => {
    expect(pieces.some((p) => p.id === "sofa-main")).toBe(true);
    expect(pieces.some((p) => p.id === "sofa-chaise")).toBe(true);
    expect(pieces.some((p) => p.id === "tv-screen")).toBe(true);
    expect(BEANBAGS.length).toBeGreaterThanOrEqual(3);
    expect(BEANBAGS.length).toBeLessThanOrEqual(4);
    expect(group("beanbag").filter((p) => p.fp)).toHaveLength(BEANBAGS.length);
    expect(pieces.some((p) => p.id === "shelf-body")).toBe(true);
    expect(PLANTS.length).toBeGreaterThanOrEqual(1);
    expect(group("plant").filter((p) => p.fp)).toHaveLength(PLANTS.length);
  });

  it("sofa membentuk L (dua bagian saling menempel, bukan lurus)", () => {
    expect(SOFA_CHAISE.y + SOFA_CHAISE.d).toBe(SOFA_MAIN.y); // chaise berbatasan dengan sisi utara bagian utama
    expect(SOFA_CHAISE.w).toBeGreaterThan(SOFA_MAIN.w);
    expect(SOFA_MAIN.d).toBeGreaterThan(SOFA_CHAISE.d);
  });

  it("tidak ada tabrakan antar jejak lantai", () => {
    for (let i = 0; i < fp.length; i++) {
      for (let j = i + 1; j < fp.length; j++) {
        expect(overlap(fp[i], fp[j]), `${fp[i].id} x ${fp[j].id}`).toBe(false);
      }
    }
  });

  it("lounge menghadap TV: arah hadap sofa ke pusat TV (selisih sudut < 10 derajat), meja kopi di antaranya", () => {
    const sofa = fp.filter((p) => p.group === "sofa");
    const x0 = Math.min(...sofa.map((p) => p.x));
    const x1 = Math.max(...sofa.map((p) => p.x + p.w));
    const y0 = Math.min(...sofa.map((p) => p.y));
    const y1 = Math.max(...sofa.map((p) => p.y + p.d));
    const c = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
    const t = { x: TV.x + TV.w / 2, y: TV.y + TV.d / 2 };
    const dx = t.x - c.x;
    const dy = t.y - c.y;
    const cos = (dx * SOFA_FACING.x + dy * SOFA_FACING.y) / Math.hypot(dx, dy);
    expect(Math.acos(cos) * (180 / Math.PI)).toBeLessThan(10);
    // Tata letak dicerminkan (2026-11-12): sandaran sofa di timur, TV menempel dinding barat
    // (menghadap timur, terlihat dari kamera isometrik).
    expect(SOFA_MAIN.x + SOFA_MAIN.w).toBe(348);
    expect(TV.x).toBe(0);
    // Meja kopi di antara sofa dan TV, sejajar sumbu.
    expect(COFFEE.x + COFFEE.w).toBeLessThan(SOFA_MAIN.x);
    expect(COFFEE.x).toBeGreaterThan(CONSOLE.x + CONSOLE.w);
    // Konsol TV terpusat pada TV.
    expect(CONSOLE.y + CONSOLE.d / 2).toBe(TV.y + TV.d / 2);
    // TV lebih tinggi dari konsol dan berada di dinding (bukan di lantai).
    expect(TV.z0).toBeGreaterThan(0.18);
  });

  it("sofa tidak menutup jalur sirkulasi: jalur utara bebas >= 1 m dan jarak ke sofa >= 1 m", () => {
    expect(LANE_NORTH.d).toBeGreaterThanOrEqual(MIN_CLEARANCE);
    expect(LANE_NORTH.w).toBe(LOUNGE_W);
    for (const p of fp) expect(overlap(p, LANE_NORTH), p.id).toBe(false);
    // Sofa tidak menonjol ke jalur: sisi utara chaise >= LANE_NORTH batas selatan.
    expect(SOFA_CHAISE.y).toBeGreaterThanOrEqual(LANE_NORTH.y + LANE_NORTH.d);
    // Lebar jalur yang tersisa antara chaise dan tembok/koridor ruang makan = seluruh lebar lounge.
    expect(SOFA_CHAISE.y - LOUNGE_Y0).toBeGreaterThanOrEqual(MIN_CLEARANCE);
  });

  it("jalur ke area tengah antara sofa/meja dan bean bag/konsol tetap lebar (>= 0,5 m, jalan setapak)", () => {
    const min = 0.5 * 58;
    const coffee = fp.find((p) => p.id === "coffee-top")!;
    const sofa = fp.filter((p) => p.group === "sofa");
    for (const s of sofa) expect(gap(coffee, s), `coffee x ${s.id}`).toBeGreaterThanOrEqual(min);
    for (const b of fp.filter((p) => p.group === "beanbag")) {
      expect(gap(coffee, b), `coffee x ${b.id}`).toBeGreaterThanOrEqual(min / 2);
    }
  });

  it("jalur pandang sofa ke TV tidak tertutup furnitur tinggi (bean bag/tanaman/rak di luar pita pandang)", () => {
    const sofaC = SOFA_MAIN.y + SOFA_MAIN.d / 2;
    const band = { x: CONSOLE.x + CONSOLE.w, y: Math.min(sofaC, TV.y), w: SOFA_MAIN.x - (CONSOLE.x + CONSOLE.w), d: TV.d };
    for (const p of pieces.filter((q) => ["beanbag", "plant", "shelf"].includes(q.group))) {
      expect(overlap(p, band), p.id).toBe(false);
    }
  });

  it("tanaman dan bean bag tidak menembus dinding atau furnitur lain", () => {
    for (const p of [...group("plant"), ...group("beanbag")]) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x + p.w).toBeLessThanOrEqual(348);
      expect(p.y + p.d).toBeLessThanOrEqual(LOUNGE_GLASS_Y);
    }
    for (const b of BEANBAGS) expect(b.x).toBeGreaterThanOrEqual(CONSOLE.x + CONSOLE.w);
  });

  it("kaca fasad depan gelap tetapi tidak tembus pandang berlebihan", () => {
    const n = parseInt(FACADE_GLASS.color.slice(1), 16);
    const lum = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
    expect(lum).toBeLessThan(0.15);
    expect(FACADE_GLASS.opacity).toBeGreaterThanOrEqual(0.6);
    expect(FACADE_GLASS.opacity).toBeLessThanOrEqual(0.9);
  });

  it("signage RUANG ISTIRAHAT tidak tertutup furnitur dari arah kamera", () => {
    for (const s of LOUNGE_SIGNS) {
      const w = signWidth(s.text.length);
      const bottom = s.z - s.height / 2;
      const view = { x: s.x - w / 2, y: s.y - 5, w: w + 60, d: 65 };
      for (const p of pieces) {
        if (!overlap(p, view)) continue;
        expect(SLAB_TOP + p.z0 + p.h, `${s.id} <- ${p.id}`).toBeLessThanOrEqual(bottom);
      }
    }
  });
});
