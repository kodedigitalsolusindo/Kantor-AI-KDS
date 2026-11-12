// Tata letak ruang makan + pantry Lantai 2 (KAN-8). Koordinat lokal ruko (satuan, 1 m = 58),
// sama dengan kdsLantai2.tsx / kdsKamarLayout.ts. Data murni agar bisa diuji tanpa render 3D.
//
// Dimensi horizontal memakai ukuran nyata. Tinggi memakai skala vertikal yang sama dengan KAN-7
// (Z_PER_M = 0,36 unit dunia per meter nyata; KDS_STORY = 1,05 untuk +-2,9 m). Posisi z0 relatif
// terhadap permukaan slab (SLAB_TOP). Geometri kotak sederhana, tanpa bayangan.

import { SLAB_TOP, Z_PER_M } from "@/features/retro-office/scene/kdsKamarLayout";

export const MAKAN_X0 = 0;
export const MAKAN_Y0 = 1048; // Z11: x 0..348, y 1048..1400
export const MAKAN_W = 348;
export const MAKAN_D = 352;
export const MAKAN_WALL_X1 = 348; // dinding timur (sisi dalam)
export const UNITS_PER_METER = 58;
export const MIN_CLEARANCE = UNITS_PER_METER; // ruang gerak minimal 1 m
export const WALL_TOP = 1.05;

export type MakanPiece = {
  id: string;
  x: number; // koordinat lokal ruko (absolut)
  y: number;
  w: number;
  d: number;
  z0: number; // di atas slab
  h: number;
  color: string;
  emissive?: string;
  /** Jejak lantai utama (dipakai uji tabrakan/ruang gerak); dekor di atasnya tidak. */
  fp?: boolean;
  group: "table" | "chair" | "kitchen" | "other";
};

const NAVY = "#0b1f3a";
const TEAL = "#16a596";
const BLUE = "#2563eb";
const WOOD = "#b58a5a";
const m = (v: number) => v * Z_PER_M;

// Meja makan 2,6 x 1,0 m (151 x 58), tinggi 0,75 m, panjang timur-barat.
export const TABLE = { x: 90, y: 1150, w: 151, d: 58 };
// Kursi 0,45 x 0,45 m (26 x 26), 5 di sisi utara + 5 di sisi selatan, simetris terhadap meja.
export const CHAIR_SIZE = 26;
export const CHAIR_XS = [93, 123, 153, 183, 213];
export const CHAIR_Y_NORTH = 1120; // menghadap selatan (ke meja)
export const CHAIR_Y_SOUTH = 1212; // menghadap utara (ke meja)

// Kitchen set menempel dinding timur: kedalaman 0,6 m (35), panjang 3,0 m (174).
export const COUNTER = { x: 313, y: 1070, w: 35, d: 174 };
export const UPPER = { x: 328, y: 1070, w: 20, d: 174 }; // kabinet atas 0,35 m
export const FRIDGE = { x: 307, y: 1246, w: 41, d: 41 }; // 0,71 x 0,71 m, menempel dinding timur

function chair(id: string, x: number, y: number, south: boolean): MakanPiece[] {
  const s = CHAIR_SIZE;
  const seatZ = m(0.45);
  const backY = south ? y + s - 3 : y; // sandaran di sisi jauh dari meja
  return [
    { id: `${id}-seat`, x, y, w: s, d: s, z0: seatZ, h: 0.02, color: TEAL, fp: true, group: "chair" },
    { id: `${id}-back`, x, y: backY, w: s, d: 3, z0: seatZ + 0.02, h: m(0.45), color: NAVY, group: "chair" },
    { id: `${id}-leg`, x: x + 10, y: y + 10, w: 6, d: 6, z0: 0, h: seatZ, color: "#333a44", group: "chair" },
  ];
}

export function makanPieces(): MakanPiece[] {
  const t = TABLE;
  const top = m(0.75);
  const out: MakanPiece[] = [
    { id: "table-top", ...t, z0: top - 0.03, h: 0.03, color: "#d9c3a0", fp: true, group: "table" },
    { id: "table-runner", x: t.x + 20, y: t.y + 22, w: t.w - 40, d: 14, z0: top, h: 0.004, color: BLUE, group: "table" },
    ...[
      [t.x + 3, t.y + 3],
      [t.x + t.w - 7, t.y + 3],
      [t.x + 3, t.y + t.d - 7],
      [t.x + t.w - 7, t.y + t.d - 7],
    ].map(([x, y], i) => ({ id: `table-leg-${i}`, x, y, w: 4, d: 4, z0: 0, h: top - 0.03, color: WOOD, group: "table" as const })),
  ];
  CHAIR_XS.forEach((x, i) => {
    out.push(...chair(`chair-n${i + 1}`, x, CHAIR_Y_NORTH, false));
    out.push(...chair(`chair-s${i + 1}`, x, CHAIR_Y_SOUTH, true));
  });

  const c = COUNTER;
  const ct = m(0.85);
  out.push(
    { id: "counter", ...c, z0: 0, h: ct, color: "#f6f1e7", fp: true, group: "kitchen" },
    { id: "counter-top", ...c, z0: ct, h: 0.015, color: "#3a4652", group: "kitchen" },
    // Sink: bak + keran.
    { id: "sink-basin", x: 318, y: 1082, w: 25, d: 32, z0: ct + 0.015, h: 0.006, color: "#8fa3b3", group: "kitchen" },
    { id: "sink-faucet-post", x: 340, y: 1096, w: 3, d: 3, z0: ct + 0.015, h: m(0.3), color: "#c9d2da", group: "kitchen" },
    { id: "sink-faucet-arm", x: 331, y: 1096, w: 12, d: 3, z0: ct + 0.015 + m(0.3), h: 0.01, color: "#c9d2da", group: "kitchen" },
    // Kompor 4 tungku (y 1160..1214).
    { id: "stove-plate", x: 316, y: 1160, w: 29, d: 54, z0: ct + 0.015, h: 0.004, color: "#1c232b", group: "kitchen" },
    ...[
      [318, 1164],
      [332, 1164],
      [318, 1190],
      [332, 1190],
    ].map(([x, y], i) => ({ id: `stove-burner-${i}`, x, y, w: 11, d: 11, z0: ct + 0.019, h: 0.006, color: "#5b6672", group: "kitchen" as const })),
    // Kabinet atas (teal) + garis pintu.
    { id: "upper-cabinet", ...UPPER, z0: m(1.45), h: m(0.6), color: TEAL, group: "kitchen" },
    ...[1124, 1160, 1214].map((y, i) => ({ id: `upper-seam-${i}`, x: UPPER.x - 1, y, w: 1, d: 1, z0: m(1.45) + 0.01, h: m(0.58), color: NAVY, group: "kitchen" as const })),
    ...[1124, 1156, 1214].map((y, i) => ({ id: `base-seam-${i}`, x: c.x - 1, y, w: 1, d: 1, z0: 0.01, h: ct - 0.02, color: NAVY, group: "kitchen" as const })),
    // Kulkas 2 pintu menempel dinding timur, rapat dengan counter.
    { id: "fridge", ...FRIDGE, z0: 0, h: m(1.7), color: "#dfe6ea", fp: true, group: "kitchen" },
    { id: "fridge-seam", x: FRIDGE.x - 1, y: FRIDGE.y, w: 1, d: FRIDGE.d, z0: m(1.1), h: 0.01, color: NAVY, group: "kitchen" },
    { id: "fridge-handle-top", x: FRIDGE.x - 2, y: FRIDGE.y + 4, w: 2, d: 3, z0: m(1.25), h: m(0.3), color: BLUE, group: "kitchen" },
    { id: "fridge-handle-bottom", x: FRIDGE.x - 2, y: FRIDGE.y + 4, w: 2, d: 3, z0: m(0.6), h: m(0.3), color: BLUE, group: "kitchen" },
    // Dispenser air 0,34 m menempel dinding barat + galon.
    { id: "dispenser", x: 0, y: 1330, w: 20, d: 20, z0: 0, h: m(1.1), color: "#e8eef7", fp: true, group: "other" },
    { id: "dispenser-bottle", x: 4, y: 1334, w: 12, d: 12, z0: m(1.1), h: m(0.45), color: "#7fb2ff", group: "other" },
    { id: "dispenser-tap", x: 8, y: 1350, w: 4, d: 2, z0: m(0.8), h: 0.02, color: BLUE, group: "other" },
    // Tempat sampah terpisah (organik/anorganik) menempel dinding timur.
    { id: "bin-organic", x: 332, y: 1320, w: 16, d: 16, z0: 0, h: m(0.5), color: TEAL, fp: true, group: "other" },
    { id: "bin-inorganic", x: 332, y: 1340, w: 16, d: 16, z0: 0, h: m(0.5), color: NAVY, fp: true, group: "other" },
  );
  return out;
}

// Signage ruang makan/pantry (z relatif slab=0 di grup L2; tinggi papan = height).
export const MAKAN_SIGNS = [
  { id: "ruang-makan", text: "RUANG MAKAN", x: 58, y: 1060, z: 0.7, height: 0.34 },
  { id: "pantry", text: "PANTRY", x: 300, y: 1062, z: 0.98, height: 0.34 },
] as const;

export function signWidth(chars: number, size = 0.22, scale = 0.018) {
  return Math.round((chars * 0.75 * size + 0.18) / scale);
}
export { SLAB_TOP };
