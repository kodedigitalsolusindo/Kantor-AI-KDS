// Tata letak furnitur Kamar 1-4 Lantai 2 (KAN-7). Koordinat lokal ruko (satuan, 1 m = 58),
// sama dengan kdsLantai2.tsx. Data murni agar bisa diuji tanpa render 3D.
//
// Skala vertikal: tinggi antar lantai KDS_STORY = 1.05 untuk +-2,9 m nyata, jadi tinggi furnitur
// dikompres 0,36 unit dunia per meter nyata (bunk bed 1,7 m -> 0,61; lemari 2,0 m -> 0,72).
// Dimensi horizontal memakai ukuran nyata. Semua furnitur lebih rendah dari dinding (1,05).

export const KAMAR_STARTS = [420, 577, 734, 891] as const; // y0 kamar 1..4 (Z7..Z10)
export const KAMAR_X0 = 122;
export const KAMAR_W = 226;
export const KAMAR_D = 151;
export const KAMAR_WALL_MARGIN = 8; // dinding tepi/partisi
export const DOOR_Y0 = 12; // bukaan pintu relatif y0 kamar (y0+12 .. y0+58), di dinding x 116..122
export const DOOR_Y1 = 58;
export const Z_PER_M = 0.36;
export const SLAB_TOP = 0.04;

export type KamarPiece = {
  id: string;
  lx: number; // relatif KAMAR_X0
  ly: number; // relatif y0 kamar
  w: number;
  d: number;
  z0: number; // di atas slab
  h: number;
  color: string;
  emissive?: string;
};

const WOOD = "#b58a5a";
const MATTRESS = "#e8eef7";
const m = (v: number) => v * Z_PER_M;
// Skala tinggi nyata (1 m = 58 x 0,018 satuan dunia) untuk benda yang menempel di dinding penuh.
const fm = (meters: number) => meters * 58 * 0.018;

// Bunk bed 2,0 x 1,0 m (116 x 58), rapat dinding timur + utara kamar.
const BX = 102;
const BY = 8;
const BL = 116;
const BW = 58;

export function kamarPieces(blanket: string): KamarPiece[] {
  const post = 4;
  const posts: KamarPiece[] = [
    [BX, BY],
    [BX + BL - post, BY],
    [BX, BY + BW - post],
    [BX + BL - post, BY + BW - post],
  ].map(([x, y], i) => ({ id: `bunk-post-${i}`, lx: x, ly: y, w: post, d: post, z0: 0, h: m(1.7), color: WOOD }));
  return [
    ...posts,
    { id: "bunk-frame-low", lx: BX, ly: BY, w: BL, d: BW, z0: m(0.3), h: 0.03, color: WOOD },
    { id: "bunk-mattress-low", lx: BX + 4, ly: BY + 4, w: BL - 8, d: BW - 8, z0: m(0.3) + 0.03, h: m(0.18), color: MATTRESS },
    { id: "bunk-blanket-low", lx: BX + 40, ly: BY + 3, w: BL - 44, d: BW - 6, z0: m(0.3) + 0.03 + m(0.18), h: 0.015, color: blanket },
    { id: "bunk-frame-high", lx: BX, ly: BY, w: BL, d: BW, z0: m(1.15), h: 0.03, color: WOOD },
    { id: "bunk-mattress-high", lx: BX + 4, ly: BY + 4, w: BL - 8, d: BW - 8, z0: m(1.15) + 0.03, h: m(0.18), color: MATTRESS },
    { id: "bunk-blanket-high", lx: BX + 40, ly: BY + 3, w: BL - 44, d: BW - 6, z0: m(1.15) + 0.03 + m(0.18), h: 0.015, color: blanket },
    { id: "bunk-rail-high", lx: BX, ly: BY + BW - 3, w: BL, d: 3, z0: m(1.15) + 0.03, h: m(0.3), color: WOOD },
    { id: "bunk-ladder", lx: BX - 6, ly: BY + 18, w: 6, d: 22, z0: 0, h: m(1.4), color: WOOD },
    // Lemari pakaian 1,2 x 0,55 x 2,0 m, rapat dinding selatan.
    { id: "wardrobe", lx: 140, ly: 112, w: 70, d: 32, z0: 0, h: m(2.0), color: "#cbb89a" },
    { id: "wardrobe-seam", lx: 174, ly: 111, w: 2, d: 1, z0: 0.02, h: m(1.9), color: "#0b1f3a" },
    // Meja kecil 1,0 x 0,5 x 0,75 m + kursi 0,4 x 0,4 m + lampu baca.
    { id: "desk", lx: 62, ly: 117, w: 58, d: 29, z0: m(0.68), h: 0.02, color: "#d9c3a0" },
    { id: "desk-leg-l", lx: 63, ly: 118, w: 3, d: 3, z0: 0, h: m(0.68), color: WOOD },
    { id: "desk-leg-r", lx: 115, ly: 118, w: 3, d: 3, z0: 0, h: m(0.68), color: WOOD },
    { id: "desk-leg-bl", lx: 63, ly: 141, w: 3, d: 3, z0: 0, h: m(0.68), color: WOOD },
    { id: "desk-leg-br", lx: 115, ly: 141, w: 3, d: 3, z0: 0, h: m(0.68), color: WOOD },
    { id: "chair-seat", lx: 79, ly: 92, w: 23, d: 23, z0: m(0.42), h: 0.02, color: "#0b1f3a" },
    { id: "chair-back", lx: 79, ly: 92, w: 23, d: 3, z0: m(0.42), h: m(0.4), color: "#0b1f3a" },
    { id: "chair-leg", lx: 88, ly: 101, w: 5, d: 5, z0: 0, h: m(0.42), color: "#333a44" },
    { id: "desk-lamp", lx: 68, ly: 120, w: 6, d: 6, z0: m(0.68) + 0.02, h: m(0.28), color: "#fff7d6", emissive: "#fff7d6" },
    // AC dinding 0,9 x 0,28 m pada ±1,65 m (skala nyata) di dinding utara kamar (menghadap kamera),
    // tetap di bawah puncak dinding kamar (ROOM_WALL_H 2,2 di kdsLantai2.tsx). Kisi & LED menghadap ke dalam kamar.
    { id: "ac", lx: 40, ly: 6, w: 52, d: 12, z0: fm(1.65), h: fm(0.28), color: "#cfd8e3" },
    { id: "ac-vent", lx: 44, ly: 18, w: 44, d: 1, z0: fm(1.69), h: fm(0.06), color: "#475569" },
    { id: "ac-led", lx: 84, ly: 18, w: 3, d: 1, z0: fm(1.86), h: fm(0.03), color: "#38bdf8", emissive: "#38bdf8" },
  ];
}

// Area bebas di depan pintu (ayunan/sirkulasi): relatif kamar.
export const DOOR_CLEARANCE = { lx: 0, ly: DOOR_Y0 - 4, w: 56, d: DOOR_Y1 - DOOR_Y0 + 8 };
// Furnitur di bawah ketinggian ini dianggap menghalangi lantai.
export const FLOOR_BLOCK_Z = 0.5;
