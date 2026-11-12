"use client";

import { Text } from "@react-three/drei";
import { memo, type ReactNode } from "react";
import { SCALE } from "@/features/retro-office/core/constants";
import {
  KDS_ORIGIN_X,
  KDS_ORIGIN_Y,
  KDS_RUKO_DEPTH,
  KDS_RUKO_WIDTH,
  KDS_UNITS_PER_METER,
} from "@/features/retro-office/core/furnitureDefaults";
import { toWorld } from "@/features/retro-office/core/geometry";
import { KDS_STORY } from "@/features/retro-office/scene/kdsRuko";
import {
  KAMAR_STARTS,
  KAMAR_X0,
  SLAB_TOP,
  kamarPieces,
} from "@/features/retro-office/scene/kdsKamarLayout";

// Lantai 2 Kantor AI KDS — scene dasar (KAN-6).
// Zonasi & koordinat mengacu KAN-5 (denah disetujui owner). Semua koordinat lokal ruko
// (x 0..348, y 0..1740; y=0 dinding belakang, y=1740 fasad/jalan), sama seperti kdsRuko.tsx.
// Grup digeser naik sebesar KDS_STORY agar slab L2 berada di z=1.05. Void tangga (x 240..342,
// y 0..330) sengaja dibiarkan terbuka agar tangga L1 tetap terlihat.

const W = KDS_RUKO_WIDTH;
const D = KDS_RUKO_DEPTH;
const M = KDS_UNITS_PER_METER;
const TEAL = "#16a596";
const TEAL_DARK = "#0f7f74";
const NAVY = "#0b1f3a";

// Sudut menghadap kamera isometrik default. Kamera ruko berada pada offset
// DISTRICT_CAMERA_POSITION - DISTRICT_CAMERA_TARGET = (+14 x, +17 z) dari target,
// sehingga papan nama harus menghadap arah (+14, +17) agar terbaca tanpa zoom.
const CAM_YAW = Math.atan2(14, 17);

const WALL = "#f4f1ea";
const SLAB_CORRIDOR = "#e9e2d4";
const SLAB_BATH_LAUNDRY = "#dfe6ea";
const SLAB_HALL = "#eee8dc";
const SLAB_ROOM = "#dfe7ef";
const SLAB_DINING = "#f6f1e7";
const SLAB_LOUNGE = "#e3e9ee";

type BoxProps = {
  x: number;
  y: number;
  w: number;
  d: number;
  z0?: number;
  h: number;
  color: string;
  opacity?: number;
  emissive?: string;
};

// Helper Box lokal (disalin dari kdsRuko.tsx agar file L1 tidak disentuh).
// Semua mesh L2 memakai castShadow={false} supaya tidak menambah biaya shadow L1.
function Box({ x, y, w, d, z0 = 0, h, color, opacity, emissive }: BoxProps) {
  const [wx, , wz] = toWorld(x + w / 2, y + d / 2);
  const transparent = opacity !== undefined && opacity < 1;
  return (
    <mesh position={[wx, z0 + h / 2, wz]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[Math.max(w * SCALE, 0.001), h, Math.max(d * SCALE, 0.001)]} />
      <meshStandardMaterial
        color={color}
        roughness={0.85}
        transparent={transparent}
        opacity={opacity ?? 1}
        depthWrite={!transparent}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissive ? 0.5 : 0}
      />
    </mesh>
  );
}

// Papan nama ruangan besar: border teal + panel navy + teks putih tebal, menghadap kamera
// isometrik default (CAM_YAW) agar terbaca tanpa zoom. Teks mengisi ~60-70% tinggi papan
// dan hampir selebar papan; ketebalan "bold" dibuat lewat outline putih senada.
function Sign({
  x,
  y,
  z,
  text,
  size = 0.22,
  width = 60,
  height = 0.34,
}: {
  x: number;
  y: number;
  z: number;
  text: string;
  size?: number;
  width?: number;
  height?: number;
}) {
  const [wx, , wz] = toWorld(x, y);
  return (
    <group position={[wx, z, wz]} rotation={[0, CAM_YAW, 0]}>
      {/* Border teal (lebih lebar dari panel navy). */}
      <mesh castShadow={false} receiveShadow={false}>
        <boxGeometry args={[width * SCALE + 0.06, height + 0.06, 0.06]} />
        <meshStandardMaterial color={TEAL} roughness={0.5} />
      </mesh>
      {/* Panel navy. */}
      <mesh castShadow={false} receiveShadow={false} position={[0, 0, 0.015]}>
        <boxGeometry args={[width * SCALE, height, 0.05]} />
        <meshStandardMaterial color={NAVY} roughness={0.6} />
      </mesh>
      {/* Teks satu baris (tanpa maxWidth agar tidak membungkus), sedikit di depan panel. */}
      <Text
        position={[0, 0, 0.05]}
        fontSize={size}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={size * 0.09}
        outlineColor="#ffffff"
      >
        {text}
      </Text>
    </group>
  );
}

// Lebar panel (satuan lokal) = perkiraan lebar teks + padding kiri-kanan.
// charW ≈ 0.75 × fontSize (cukup longgar untuk huruf kapital + outline bold);
// padding 0.18 m total (0.09 m per sisi) agar teks tidak keluar dari papan.
function panelWidth(chars: number, size = 0.22) {
  return Math.round((chars * 0.75 * size + 0.18) / SCALE);
}

// Pelat lantai per zona (bukan satu slab) — void tangga x240..342, y0..330 wajib terbuka.
function L2Slabs() {
  const slabs: Array<[number, number, number, number, string]> = [
    [0, 0, 116, 330, SLAB_BATH_LAUNDRY], // Z4+Z5: KM + laundry
    [124, 0, 110, 330, SLAB_HALL], // Z2: hall servis
    [342, 0, 6, 330, SLAB_HALL], // strip tipis dekat dinding kanan
    [0, 330, 348, 90, SLAB_HALL], // Z3: hall penghubung
    [0, 420, 116, 622, SLAB_CORRIDOR], // Z1: koridor
    [122, 420, 226, 151, SLAB_ROOM], // Z7: kamar 1
    [122, 577, 226, 151, SLAB_ROOM], // Z8: kamar 2
    [122, 734, 226, 151, SLAB_ROOM], // Z9: kamar 3
    [122, 891, 226, 151, SLAB_ROOM], // Z10: kamar 4
    [0, 1048, 348, 352, SLAB_DINING], // Z11: ruang makan + pantry
    [0, 1400, 348, 340, SLAB_LOUNGE], // Z12: lounge
  ];
  return (
    <group>
      {slabs.map(([x, y, w, d, color], i) => (
        <Box key={`l2-slab-${i}`} x={x} y={y} w={w} d={d} z0={0} h={0.04} color={color} />
      ))}
    </group>
  );
}

function L2Walls() {
  const mullions: ReactNode[] = [];
  for (let mx = 8; mx <= W - 8; mx += M) {
    mullions.push(
      <Box key={`l2-mullion-${mx}`} x={mx} y={D - 6} w={6} d={10} z0={0.05} h={0.95} color={TEAL} />,
    );
  }
  return (
    <group>
      {/* Perimeter — belakang, kiri, kanan (8 satuan). */}
      <Box x={-8} y={-8} w={W + 16} d={8} h={1.05} color={WALL} />
      <Box x={-8} y={0} w={8} d={D} h={1.05} color={WALL} />
      <Box x={W} y={0} w={8} d={D} h={1.05} color={WALL} />

      {/* Fasad depan — kaca gelap + mullion teal (y=1740) untuk lounge. */}
      <Box x={8} y={D - 4} w={W - 16} d={4} z0={0.05} h={0.95} color="#24343d" opacity={0.5} />
      {mullions}
      <Box x={0} y={D - 6} w={W} d={10} z0={1.0} h={0.05} color={TEAL_DARK} />

      {/* Partisi KM <-> laundry. */}
      <Box x={0} y={192} w={116} d={8} h={1.05} color={WALL} />

      {/* Partisi KM/laundry <-> hall (x 116..124) + bukaan pintu KM & laundry. */}
      <Box x={116} y={0} w={8} d={96} h={1.05} color={WALL} />
      <Box x={116} y={142} w={8} d={104} h={1.05} color={WALL} />
      <Box x={116} y={292} w={8} d={38} h={1.05} color={WALL} />

      {/* Partisi hall <-> tangga (x 234..240) + bukaan landing y 0..70. */}
      <Box x={234} y={70} w={6} d={260} h={1.05} color={WALL} />

      {/* Partisi belakang <-> hall penghubung (y 330) + bukaan hall. */}
      <Box x={0} y={330} w={124} d={6} h={1.05} color={WALL} />
      <Box x={234} y={330} w={114} d={6} h={1.05} color={WALL} />

      {/* Partisi hall penghubung <-> koridor/kamar (y 420) + bukaan koridor. */}
      <Box x={122} y={420} w={226} d={6} h={1.05} color={WALL} />

      {/* Partisi koridor <-> kamar (x 116..122) + 4 bukaan pintu. */}
      <Box x={116} y={420} w={6} d={12} h={1.05} color={WALL} />
      <Box x={116} y={478} w={6} d={111} h={1.05} color={WALL} />
      <Box x={116} y={635} w={6} d={111} h={1.05} color={WALL} />
      <Box x={116} y={792} w={6} d={111} h={1.05} color={WALL} />
      <Box x={116} y={949} w={6} d={93} h={1.05} color={WALL} />

      {/* Partisi antar kamar. */}
      <Box x={122} y={571} w={226} d={6} h={1.05} color={WALL} />
      <Box x={122} y={728} w={226} d={6} h={1.05} color={WALL} />
      <Box x={122} y={885} w={226} d={6} h={1.05} color={WALL} />

      {/* Partisi koridor/kamar <-> ruang makan (y 1042) + bukaan koridor. */}
      <Box x={122} y={1042} w={226} d={6} h={1.05} color={WALL} />

      {/* Balok pemisah ruang makan <-> lounge (y 1400). */}
      <Box x={0} y={1397} w={W} d={6} z0={0.92} h={0.13} color={WALL} />
    </group>
  );
}

function L2Stairs() {
  return (
    <group>
      {/* Ambang (threshold) di bukaan landing barat — 70 (y) x 6 (x). */}
      <Box x={234} y={0} w={6} d={70} z0={0} h={0.08} color="#cfc6b8" />

      {/* Railing tepi barat void (x 240..242, y 70..330). */}
      <Box x={240} y={70} w={2} d={260} z0={0.04} h={0.95} color={NAVY} />

      {/* Railing tepi selatan void (y 330..332, x 240..342). */}
      <Box x={240} y={330} w={102} d={2} z0={0.04} h={0.95} color={NAVY} />
    </group>
  );
}

function L2BathLaundry() {
  // KAN-6: KM & laundry hanya struktur (dinding/lantai sudah di L2Slabs/L2Walls).
  // Detail interior (WC, shower, mesin cuci, dst.) menyusul di KAN-8.
  return null;
}

// Furnitur Kamar 1-4 (KAN-7): geometri kotak sederhana, tanpa bayangan.
const KAMAR_BLANKETS = ["#2563eb", "#16a596", "#2563eb", "#16a596"];
function L2Kamar() {
  return (
    <group>
      {KAMAR_STARTS.map((y0, i) =>
        kamarPieces(KAMAR_BLANKETS[i]).map((p) => (
          <Box
            key={`kamar-${i + 1}-${p.id}`}
            x={KAMAR_X0 + p.lx}
            y={y0 + p.ly}
            w={p.w}
            d={p.d}
            z0={SLAB_TOP + p.z0}
            h={p.h}
            color={p.color}
            emissive={p.emissive}
          />
        )),
      )}
    </group>
  );
}

// Signage KAMAR 1-4 diletakkan di sisi koridor (x=96) dan di atas puncak dinding partisi (z 1.3)
// supaya seluruh teks terlihat dari kamera isometrik (tidak tertutup dinding x 116..122).
function L2Signage() {
  return (
    <group>
      <Sign x={96} y={455} z={1.3} text="KAMAR 1" width={panelWidth(7)} />
      <Sign x={96} y={612} z={1.3} text="KAMAR 2" width={panelWidth(7)} />
      <Sign x={96} y={769} z={1.3} text="KAMAR 3" width={panelWidth(7)} />
      <Sign x={96} y={926} z={1.3} text="KAMAR 4" width={panelWidth(7)} />
      <Sign x={118} y={119} z={0.62} text="KAMAR MANDI" width={panelWidth(11)} />
      <Sign x={118} y={269} z={0.62} text="LAUNDRY" width={panelWidth(7)} />
      <Sign x={58} y={1060} z={0.7} text="RUANG MAKAN" width={panelWidth(11)} />
      <Sign x={174} y={1410} z={0.82} text="RUANG ISTIRAHAT" width={panelWidth(15)} />
      <Sign x={237} y={35} z={0.75} text="TANGGA KE LANTAI 1" size={0.16} height={0.24} width={panelWidth(18, 0.16)} />
      <Sign x={237} y={90} z={0.75} text="LANTAI 2" width={panelWidth(8)} />
    </group>
  );
}

function L2Lights() {
  const [kx, , kz] = toWorld(58, 720);
  const [dx, , dz] = toWorld(167, 1179);
  const [lx, , lz] = toWorld(174, 1560);
  return (
    <group>
      {/* Maks 3 pointLight non-shadow (koridor, ruang makan, lounge). */}
      <pointLight position={[kx, 0.95, kz]} intensity={0.35} distance={3} castShadow={false} color="#fff4d6" />
      <pointLight position={[dx, 0.95, dz]} intensity={0.35} distance={3} castShadow={false} color="#fff4d6" />
      <pointLight position={[lx, 0.95, lz]} intensity={0.35} distance={3} castShadow={false} color="#fff4d6" />

      {/* Panel emissive koridor. */}
      {[480, 620, 760, 900, 1020].map((py) => (
        <Box key={`l2-panel-${py}`} x={58 - 17} y={py - 17} w={35} d={35} z0={0.99} h={0.02} color="#ffffff" emissive="#fff7d6" />
      ))}

      {/* Panel emissive hall servis. */}
      <Box x={179 - 17} y={120 - 17} w={35} d={35} z0={0.99} h={0.02} color="#ffffff" emissive="#fff7d6" />
      <Box x={179 - 17} y={260 - 17} w={35} d={35} z0={0.99} h={0.02} color="#ffffff" emissive="#fff7d6" />

      {/* Panel emissive ruang makan (di atas meja). */}
      <Box x={117 - 17} y={1179 - 17} w={35} d={35} z0={0.99} h={0.02} color="#ffffff" emissive="#fff7d6" />
      <Box x={167 - 17} y={1179 - 17} w={35} d={35} z0={0.99} h={0.02} color="#ffffff" emissive="#fff7d6" />
      <Box x={217 - 17} y={1179 - 17} w={35} d={35} z0={0.99} h={0.02} color="#ffffff" emissive="#fff7d6" />
    </group>
  );
}

export const KdsLantai2Scene = memo(function KdsLantai2Scene() {
  return (
    <group position={[KDS_ORIGIN_X * SCALE, KDS_STORY, KDS_ORIGIN_Y * SCALE]}>
      <L2Slabs />
      <L2Walls />
      <L2Stairs />
      <L2BathLaundry />
      <L2Kamar />
      <L2Signage />
      <L2Lights />
    </group>
  );
});

