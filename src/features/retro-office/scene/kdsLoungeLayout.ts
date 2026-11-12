// Tata letak lounge / ruang istirahat Lantai 2 (KAN-9). Koordinat lokal ruko (satuan, 1 m = 58),
// sama dengan kdsLantai2.tsx / kdsKamarLayout.ts / kdsMakanLayout.ts. Data murni agar bisa diuji
// tanpa render 3D. Tinggi memakai skala vertikal yang sama dengan KAN-7/KAN-8 (Z_PER_M).
//
// Zona Z12: x 0..348, y 1400..1740 (y=1740 = fasad kaca menghadap jalan). BASE_TV di dinding timur,
// sofa L di dinding barat menghadap +x (ke BASE_TV). Jalur sirkulasi utara (y 1400..1500, lebar penuh)
// dari ruang makan/koridor dijaga bebas dari furnitur lantai.

import { SLAB_TOP, Z_PER_M } from "@/features/retro-office/scene/kdsKamarLayout";

export const LOUNGE_X0 = 0;
export const LOUNGE_Y0 = 1400;
export const LOUNGE_W = 348;
export const LOUNGE_D = 340; // sampai y 1740 (as fasad kaca)
export const LOUNGE_GLASS_Y = 1734; // sisi dalam kaca depan (D - 6)
export const LOUNGE_WALL_X1 = 348;
export const UNITS_PER_METER = 58;
export const MIN_CLEARANCE = UNITS_PER_METER; // lebar jalur minimal 1 m
export const WALL_TOP = 1.05;
// Dinding barat/timur lounge setinggi lantai penuh (3,0 m). TV, AC, dan speaker yang menempel di
// dinding memakai skala tinggi nyata (1 m = 58 x 0,018 satuan dunia), bukan skala perabot Z_PER_M.
export const FULL_WALL_TOP = 3.0 * 58 * 0.018;
const fm = (meters: number) => meters * 58 * 0.018;

// Kaca fasad depan Lantai 2: gelap (luminansi rendah), cukup buram agar tidak tembus pandang berlebihan.
export const FACADE_GLASS = { color: "#0e1a22", opacity: 0.72 } as const;

export type LoungePiece = {
  id: string;
  x: number;
  y: number;
  w: number;
  d: number;
  z0: number; // di atas slab
  h: number;
  color: string;
  emissive?: string;
  /** Jejak lantai utama (uji tabrakan/jalur); dekor di atasnya tidak. */
  fp?: boolean;
  group: "sofa" | "table" | "tv" | "beanbag" | "shelf" | "plant" | "deco";
};

const NAVY = "#0b1f3a";
const TEAL = "#16a596";
const BLUE = "#2563eb";
const WOOD = "#b58a5a";
const m = (v: number) => v * Z_PER_M;

// Jalur sirkulasi utara: dari ruang makan/koridor masuk ke lounge, lebar penuh, 1,72 m.
export const LANE_NORTH = { x: 0, y: 1400, w: 348, d: 100 };

// Sofa L: bagian utama menempel dinding barat (menghadap timur), chaise memanjang ke timur di utara.
const BASE_SOFA_MAIN = { x: 0, y: 1552, w: 52, d: 138 };
const BASE_SOFA_CHAISE = { x: 0, y: 1500, w: 150, d: 52 };
const BASE_SOFA_FACING = { x: 1, y: 0 }; // arah hadap sofa (vektor satuan)
const BASE_COFFEE = { x: 100, y: 1604, w: 64, d: 35 }; // meja kopi 1,1 x 0,6 m
const BASE_CARPET = { x: 80, y: 1560, w: 180, d: 120 };
// BASE_TV menempel dinding timur di atas konsol; pusat BASE_TV dipakai uji arah hadap.
const BASE_CONSOLE = { x: 325, y: 1530, w: 23, d: 120 }; // konsol 2,07 x 0,4 m
const BASE_TV = { x: 344, y: 1530, w: 4, d: 120, z0: fm(0.75), h: fm(1.17) }; // layar 2,07 x 1,17 m (±95 inci, 16:9), digantung di dinding
const BASE_BEANBAGS = [
  { x: 108, y: 1676 },
  { x: 158, y: 1676 },
  { x: 208, y: 1676 },
  { x: 258, y: 1676 },
];
export const BEANBAG_SIZE = 46; // 0,8 m
const BASE_SHELF = { x: 331, y: 1672, w: 17, d: 58 }; // rak buku 1,0 x 0,3 m, dinding timur
const BASE_PLANTS = [
  { x: 296, y: 1505 }, // di samping speaker tower kiri
  { x: 4, y: 1700 }, // sudut barat depan
  { x: 306, y: 1704 }, // sudut timur depan, di sebelah rak
];
export const PLANT_SIZE = 24;

function basePieces(): LoungePiece[] {
  const seat = m(0.42);
  const s = BASE_SOFA_MAIN;
  const c = BASE_SOFA_CHAISE;
  const out: LoungePiece[] = [
    // Sofa L (dudukan + sandaran + lengan).
    { id: "sofa-main", ...s, z0: 0, h: seat, color: NAVY, fp: true, group: "sofa" },
    { id: "sofa-chaise", x: c.x + s.w, y: c.y, w: c.w - s.w, d: c.d, z0: 0, h: seat, color: NAVY, fp: true, group: "sofa" },
    { id: "sofa-back-main", x: 0, y: s.y, w: 14, d: s.d, z0: seat, h: m(0.45), color: NAVY, group: "sofa" },
    { id: "sofa-back-corner", x: 0, y: c.y, w: 14, d: c.d, z0: seat, h: m(0.45), color: NAVY, group: "sofa" },
    { id: "sofa-arm-south", x: 0, y: s.y + s.d - 8, w: s.w, d: 8, z0: seat, h: m(0.2), color: NAVY, group: "sofa" },
    { id: "sofa-arm-chaise", x: c.x + c.w - 8, y: c.y, w: 8, d: c.d, z0: seat, h: m(0.2), color: NAVY, group: "sofa" },
    { id: "sofa-cushion-1", x: 16, y: s.y + 12, w: 32, d: 56, z0: seat, h: 0.02, color: TEAL, group: "sofa" },
    { id: "sofa-cushion-2", x: 16, y: s.y + 74, w: 32, d: 52, z0: seat, h: 0.02, color: BLUE, group: "sofa" },
    // Karpet (dekor tipis) + meja kopi.
    { id: "carpet", ...BASE_CARPET, z0: 0, h: 0.006, color: "#c9d6e2", group: "deco" },
    { id: "coffee-top", ...BASE_COFFEE, z0: m(0.4) - 0.02, h: 0.02, color: "#d9c3a0", fp: true, group: "table" },
    ...[
      [BASE_COFFEE.x + 3, BASE_COFFEE.y + 3],
      [BASE_COFFEE.x + BASE_COFFEE.w - 7, BASE_COFFEE.y + 3],
      [BASE_COFFEE.x + 3, BASE_COFFEE.y + BASE_COFFEE.d - 7],
      [BASE_COFFEE.x + BASE_COFFEE.w - 7, BASE_COFFEE.y + BASE_COFFEE.d - 7],
    ].map(([x, y], i) => ({ id: `coffee-leg-${i}`, x, y, w: 4, d: 4, z0: 0, h: m(0.4) - 0.02, color: WOOD, group: "table" as const })),
    // Konsol BASE_TV + BASE_TV di dinding (layar gelap, bezel navy).
    { id: "tv-console", ...BASE_CONSOLE, z0: 0, h: m(0.5), color: WOOD, fp: true, group: "tv" },
    { id: "tv-bezel", x: BASE_TV.x + 1, y: BASE_TV.y - 3, w: 3, d: BASE_TV.d + 6, z0: BASE_TV.z0 - 0.012, h: BASE_TV.h + 0.024, color: "#0b0f14", group: "tv" },
    { id: "tv-screen", ...BASE_TV, color: "#05080c", emissive: "#12304a", group: "tv" },
    // Home theater: soundbar, AV receiver (+ layar status), 2 speaker tower, subwoofer, 2 surround dinding.
    { id: "ht-soundbar", x: 340, y: 1545, w: 8, d: 90, z0: fm(0.6), h: fm(0.09), color: "#1f2937", group: "tv" },
    { id: "ht-receiver", x: 330, y: 1532, w: 16, d: 16, z0: m(0.5) + 0.002, h: m(0.15), color: "#111827", group: "tv" },
    { id: "ht-receiver-display", x: 329, y: 1536, w: 1, d: 8, z0: m(0.5) + m(0.07), h: m(0.04), color: "#0ea5e9", emissive: "#38bdf8", group: "tv" },
    { id: "ht-tower-l", x: 328, y: 1506, w: 18, d: 18, z0: 0, h: fm(1.1), color: "#1f2937", group: "tv" },
    { id: "ht-tower-l-cone", x: 327, y: 1510, w: 1, d: 10, z0: fm(0.55), h: fm(0.3), color: "#475569", group: "tv" },
    { id: "ht-tower-r", x: 328, y: 1652, w: 18, d: 18, z0: 0, h: fm(1.1), color: "#1f2937", group: "tv" },
    { id: "ht-tower-r-cone", x: 327, y: 1656, w: 1, d: 10, z0: fm(0.55), h: fm(0.3), color: "#475569", group: "tv" },
    { id: "ht-subwoofer", x: 302, y: 1652, w: 20, d: 20, z0: 0, h: m(0.42), color: "#111827", group: "tv" },
    { id: "ht-surround-l", x: 0, y: 1560, w: 6, d: 12, z0: fm(1.8), h: fm(0.3), color: "#1f2937", group: "tv" },
    { id: "ht-surround-r", x: 0, y: 1676, w: 6, d: 12, z0: fm(1.8), h: fm(0.3), color: "#1f2937", group: "tv" },
    // Rak buku: badan + 3 papan buku berwarna.
    { id: "shelf-body", ...BASE_SHELF, z0: 0, h: m(1.8), color: WOOD, fp: true, group: "shelf" },
    ...[0.45, 0.95, 1.45].flatMap((zh, i) => [
      { id: `shelf-books-${i}`, x: BASE_SHELF.x + 2, y: BASE_SHELF.y + 4, w: 12, d: 50, z0: m(zh), h: m(0.3), color: [TEAL, BLUE, NAVY][i], group: "shelf" as const },
    ]),
  ];
  BASE_BEANBAGS.forEach((b, i) => {
    const col = [TEAL, BLUE, "#e0a84a", TEAL][i];
    out.push(
      { id: `beanbag-${i + 1}`, x: b.x, y: b.y, w: BEANBAG_SIZE, d: BEANBAG_SIZE, z0: 0, h: m(0.45), color: col, fp: true, group: "beanbag" },
      { id: `beanbag-${i + 1}-top`, x: b.x + 6, y: b.y + 6, w: BEANBAG_SIZE - 12, d: BEANBAG_SIZE - 12, z0: m(0.45), h: m(0.1), color: col, group: "beanbag" },
    );
  });
  BASE_PLANTS.forEach((p, i) => {
    const sz = PLANT_SIZE;
    out.push(
      { id: `plant-${i + 1}-pot`, x: p.x, y: p.y, w: sz, d: sz, z0: 0, h: m(0.4), color: "#8b5e3c", fp: true, group: "plant" },
      { id: `plant-${i + 1}-leaf`, x: p.x + 2, y: p.y + 2, w: sz - 4, d: sz - 4, z0: m(0.4), h: m(0.7), color: "#2f8f4e", group: "plant" },
    );
  });
  return out;
}


// --- Tata letak akhir: dicerminkan timur-barat (2026-11-12) ---
// Kamera isometrik melihat dari arah timur-depan, sehingga TV di dinding timur hanya tampak
// punggungnya. Lounge dicerminkan: TV + home theater menempel dinding BARAT (menghadap timur,
// terlihat kamera), sofa L di sisi timur menghadap barat ke TV. Relasi antar-perabot tetap sama.
const MX = LOUNGE_W;
function mir<T extends { x: number; w: number }>(r: T): T {
  return { ...r, x: MX - r.x - r.w };
}
export const SOFA_MAIN = mir(BASE_SOFA_MAIN);
export const SOFA_CHAISE = mir(BASE_SOFA_CHAISE);
export const SOFA_FACING = { x: -BASE_SOFA_FACING.x, y: BASE_SOFA_FACING.y };
export const COFFEE = mir(BASE_COFFEE);
export const CARPET = mir(BASE_CARPET);
export const CONSOLE = mir(BASE_CONSOLE);
export const TV = mir(BASE_TV);
export const BEANBAGS = BASE_BEANBAGS.map((b) => ({ x: MX - b.x - BEANBAG_SIZE, y: b.y }));
export const SHELF = mir(BASE_SHELF);
export const PLANTS = BASE_PLANTS.map((pl) => ({ x: MX - pl.x - PLANT_SIZE, y: pl.y }));

export function loungePieces(): LoungePiece[] {
  return [
    ...basePieces().map((pc) => mir(pc)),
    // AC dinding lounge di dinding barat setinggi ±2,2 m (di samping atas TV): badan putih + kisi + LED.
    { id: "ac-lounge", x: 0, y: 1662, w: 14, d: 56, z0: fm(2.2), h: fm(0.3), color: "#cfd8e3", group: "deco" },
    { id: "ac-lounge-vent", x: 14, y: 1666, w: 1, d: 48, z0: fm(2.24), h: fm(0.06), color: "#475569", group: "deco" },
    { id: "ac-lounge-led", x: 14, y: 1710, w: 1, d: 3, z0: fm(2.44), h: fm(0.03), color: "#38bdf8", emissive: "#38bdf8", group: "deco" },
  ];
}

// Signage lounge (z relatif slab=0 di grup L2).
export const LOUNGE_SIGNS = [{ id: "ruang-istirahat", text: "RUANG ISTIRAHAT", x: 174, y: 1410, z: 0.82, height: 0.34 }] as const;

export function signWidth(chars: number, size = 0.22, scale = 0.018) {
  return Math.round((chars * 0.75 * size + 0.18) / scale);
}
export { SLAB_TOP };
