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
import { KDS_FLOOR_HEIGHT } from "@/features/retro-office/scene/kdsRuko";
import {
  KAMAR_STARTS,
  KAMAR_X0,
  SLAB_TOP,
  kamarPieces,
} from "@/features/retro-office/scene/kdsKamarLayout";
import { makanPieces } from "@/features/retro-office/scene/kdsMakanLayout";
import { KdsOffDutyStaff } from "@/features/retro-office/scene/kdsOffDuty";
import { AquaDispenser } from "@/features/retro-office/objects/aquaDispenser";
import { FACADE_GLASS, loungePieces } from "@/features/retro-office/scene/kdsLoungeLayout";

// Lantai 2 Kantor AI KDS — scene dasar (KAN-6).
// Zonasi & koordinat mengacu KAN-5 (denah disetujui owner). Semua koordinat lokal ruko
// (x 0..348, y 0..1740; y=0 dinding belakang, y=1740 fasad/jalan), sama seperti kdsRuko.tsx.
// Grup digeser naik sebesar KDS_FLOOR_HEIGHT (tinggi lantai nyata 3,0 m) sehingga pelat L2 berada
// di atas cangkang L1 setinggi satu lantai penuh. Dinding dalam L2 tetap rendah (cutaway) agar isi
// ruangan terlihat dari kamera isometrik. Void tangga (x 240..342, y 0..330) dibiarkan terbuka.

const W = KDS_RUKO_WIDTH;
const D = KDS_RUKO_DEPTH;
const M = KDS_UNITS_PER_METER;
const TEAL = "#16a596";
const TEAL_DARK = "#0f7f74";
const NAVY = "#0b1f3a";

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

// Plakat nama ruangan minimalis yang menempel rata di dinding (bukan papan melayang).
// face "south" = menempel di muka dinding yang menghadap +y (ke arah jalan/kamera);
// face "east" = menempel di muka dinding yang menghadap +x. Teks putih kecil di panel navy
// dengan aksen teal tipis di kiri.
const PLAQUE_H = 0.11;
const PLAQUE_FONT = 0.055;
function plaqueWidth(text: string) {
  return text.length * PLAQUE_FONT * 0.68 + 0.08;
}
function WallPlaque({
  x,
  y,
  z,
  text,
  face = "south",
}: {
  x: number;
  y: number;
  z: number;
  text: string;
  face?: "south" | "east";
}) {
  const [wx, , wz] = face === "south" ? toWorld(x, y + 0.4) : toWorld(x + 0.4, y);
  const w = plaqueWidth(text);
  return (
    <group position={[wx, z, wz]} rotation={[0, face === "east" ? Math.PI / 2 : 0, 0]}>
      <mesh position={[0, 0, 0.004]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[w, PLAQUE_H, 0.008]} />
        <meshStandardMaterial color={NAVY} roughness={0.6} />
      </mesh>
      <mesh position={[-w / 2 + 0.008, 0, 0.009]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[0.016, PLAQUE_H, 0.002]} />
        <meshStandardMaterial color={TEAL} roughness={0.5} />
      </mesh>
      <Text position={[0.006, 0, 0.011]} fontSize={PLAQUE_FONT} color="#ffffff" anchorX="center" anchorY="middle" letterSpacing={0.04}>
        {text}
      </Text>
    </group>
  );
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

// Dinding luar Lantai 2 setinggi satu lantai penuh (sama dengan cangkang Lantai 1 saat LT.2).
// Dinding timur (sisi kamera) dibuat tembus pandang agar isi kamar tetap terlihat; sekat dalam
// tetap rendah (cutaway 1.05).
const L2_WALL_H = KDS_FLOOR_HEIGHT;
// Dinding kamar tidur, kamar mandi & laundry lebih tinggi (±2,1 m nyata) — permintaan pemilik;
// dinding hall/tangga/ruang makan tetap rendah (cutaway) agar isi lantai terlihat.
const ROOM_WALL_H = 2.2;
// Skala tinggi nyata untuk benda yang menempel/berdiri di dinding (1 m = 58 x 0,018 satuan dunia).
const fm = (meters: number) => meters * M * SCALE;
// Dinding kamar mandi/toilet yang menghadap kamera: tembok bawah ±1 m + kaca buram di atasnya sampai
// ROOM_WALL_H, sehingga tetap setinggi dinding kamar tetapi isi (kloset, bak mandi, shower) terlihat.
function GlassTopWall({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  return (
    <group>
      <Box x={x} y={y} w={w} d={d} h={1.05} color={WALL} />
      <Box x={x} y={y} w={w} d={d} z0={1.05} h={ROOM_WALL_H - 1.05} color="#dbeafe" opacity={0.28} />
      <Box x={x} y={y} w={w} d={d} z0={ROOM_WALL_H - 0.03} h={0.03} color="#cbd5e1" />
    </group>
  );
}

function L2Walls() {
  const mullions: ReactNode[] = [];
  for (let mx = 8; mx <= W - 8; mx += M) {
    mullions.push(
      <Box key={`l2-mullion-${mx}`} x={mx} y={D - 6} w={6} d={10} z0={0.05} h={L2_WALL_H - 0.1} color={TEAL} />,
    );
  }
  return (
    <group>
      {/* Perimeter — belakang & barat padat setinggi penuh; timur (menghadap kamera) tembus pandang. */}
      <Box x={-8} y={-8} w={W + 16} d={8} h={L2_WALL_H} color={WALL} />
      <Box x={-8} y={0} w={8} d={D} h={L2_WALL_H} color={WALL} />
      <Box x={W} y={0} w={8} d={D} h={L2_WALL_H} color={WALL} opacity={0.16} />
      <Box x={W} y={0} w={8} d={D} h={1.05} color={WALL} />

      {/* Fasad depan — kaca gelap setinggi penuh + mullion teal (y=1740) untuk lounge. */}
      <Box x={8} y={D - 4} w={W - 16} d={4} z0={0.05} h={L2_WALL_H - 0.1} color={FACADE_GLASS.color} opacity={0.4} />
      {mullions}
      <Box x={0} y={D - 6} w={W} d={10} z0={L2_WALL_H - 0.05} h={0.05} color={TEAL_DARK} />
      {/* List atap (parapet) keliling setinggi penuh agar tinggi Lantai 2 terbaca sama dengan Lantai 1. */}
      <Box x={-8} y={D - 6} w={W + 16} d={6} z0={L2_WALL_H - 0.12} h={0.12} color={WALL} />

      {/* Partisi KM <-> laundry. */}
      <GlassTopWall x={0} y={192} w={116} d={8} />

      {/* Partisi KM/laundry <-> hall (x 116..124) + bukaan pintu KM & laundry. */}
      <GlassTopWall x={116} y={0} w={8} d={96} />
      <GlassTopWall x={116} y={142} w={8} d={104} />
      <GlassTopWall x={116} y={292} w={8} d={38} />

      {/* Partisi hall <-> tangga (x 234..240) + bukaan landing y 0..70. */}
      <Box x={234} y={70} w={6} d={260} h={1.05} color={WALL} />

      {/* Partisi belakang <-> hall penghubung (y 330) + bukaan hall. */}
      <GlassTopWall x={0} y={330} w={124} d={6} />
      <Box x={234} y={330} w={114} d={6} h={1.05} color={WALL} />

      {/* Partisi hall penghubung <-> koridor/kamar (y 420) + bukaan koridor. */}
      <Box x={122} y={420} w={226} d={6} h={ROOM_WALL_H} color={WALL} />

      {/* Partisi koridor <-> kamar (x 116..122) + 4 bukaan pintu. */}
      <Box x={116} y={420} w={6} d={12} h={ROOM_WALL_H} color={WALL} />
      <Box x={116} y={478} w={6} d={111} h={ROOM_WALL_H} color={WALL} />
      <Box x={116} y={635} w={6} d={111} h={ROOM_WALL_H} color={WALL} />
      <Box x={116} y={792} w={6} d={111} h={ROOM_WALL_H} color={WALL} />
      <Box x={116} y={949} w={6} d={93} h={ROOM_WALL_H} color={WALL} />

      {/* Partisi antar kamar. */}
      <Box x={122} y={571} w={226} d={6} h={ROOM_WALL_H} color={WALL} />
      <Box x={122} y={728} w={226} d={6} h={ROOM_WALL_H} color={WALL} />
      <Box x={122} y={885} w={226} d={6} h={ROOM_WALL_H} color={WALL} />

      {/* Partisi koridor/kamar <-> ruang makan (y 1042) + bukaan koridor. */}
      <Box x={122} y={1042} w={226} d={6} h={ROOM_WALL_H} color={WALL} />

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

// Kamar mandi (x 0..116, y 0..192; pintu di x 116..124, y 96..142) + wastafel di hall luar pintu.
// Perlengkapan lantai (bak mandi, toilet, wastafel) memakai skala perabot Z_PER_M seperti kasur/meja;
// kaca shower, kepala shower & cermin menempel dinding memakai skala nyata (fm) dan tetap di bawah
// tinggi dinding kamar mandi (ROOM_WALL_H).
const mz = (meters: number) => meters * 0.36;
function L2BathLaundry() {
  const T = SLAB_TOP;
  const WHITE = "#f8fafc";
  const GLASS = "#bae6fd";
  return (
    <group>
      {/* Lantai keramik kamar mandi */}
      <Box x={0} y={0} w={116} d={192} z0={T} h={0.003} color="#cfe3ee" />
      {/* Shower sudut belakang-barat: tray, 2 panel kaca, pipa + kepala shower, saluran air */}
      <Box x={4} y={4} w={58} d={58} z0={T} h={0.03} color="#e5e7eb" />
      <Box x={27} y={27} w={8} d={8} z0={T + 0.031} h={0.003} color="#64748b" />
      <Box x={62} y={4} w={2} d={60} z0={T} h={fm(1.9)} color={GLASS} opacity={0.35} />
      <Box x={4} y={62} w={58} d={2} z0={T} h={fm(1.9)} color={GLASS} opacity={0.35} />
      <Box x={0} y={30} w={3} d={3} z0={T + fm(1.0)} h={fm(0.95)} color="#cbd5e1" />
      <Box x={0} y={24} w={10} d={15} z0={T + fm(1.95)} h={0.03} color="#94a3b8" />
      <Box x={0} y={28} w={4} d={6} z0={T + fm(1.1)} h={0.05} color="#94a3b8" />
      {/* Bak mandi keramik biru + air + gayung */}
      <Box x={4} y={112} w={48} d={44} z0={T} h={mz(0.8)} color="#3b82f6" />
      <Box x={8} y={116} w={40} d={36} z0={T + mz(0.8) - 0.012} h={0.014} color="#7dd3fc" emissive="#7dd3fc" />
      <Box x={40} y={118} w={9} d={9} z0={T + mz(0.8)} h={0.04} color="#f97316" />
      {/* Toilet duduk: tangki di dinding selatan, dudukan + tutup */}
      <Box x={70} y={180} w={24} d={10} z0={T} h={mz(0.8)} color={WHITE} />
      <Box x={72} y={152} w={20} d={28} z0={T} h={mz(0.4)} color={WHITE} />
      <Box x={71} y={151} w={22} d={30} z0={T + mz(0.4)} h={0.015} color="#e2e8f0" />
      {/* Handuk tergantung di dinding barat */}
      <Box x={0} y={78} w={3} d={26} z0={T + fm(1.1)} h={fm(0.5)} color="#f472b6" />

      {/* TOILET (ruang kedua, x 0..116, y 200..330; pintu x 116, y 246..292) — kloset duduk seperti referensi
          pemilik: tangki menempel dinding utara, tisu gulung di atas tangki, tempat sampah & tempat sikat,
          keset oranye di depan kloset, handuk krem tergantung. */}
      <Box x={0} y={200} w={116} d={130} z0={T} h={0.003} color="#eef2f5" />
      <Box x={50} y={200} w={30} d={12} z0={T} h={mz(0.85)} color={WHITE} />
      <Box x={49} y={199} w={32} d={14} z0={T + mz(0.85)} h={0.012} color="#e2e8f0" />
      <Box x={60} y={202} w={10} d={10} z0={T + mz(0.85) + 0.012} h={0.06} color="#ffffff" />
      <Box x={56} y={212} w={18} d={18} z0={T} h={mz(0.38)} color={WHITE} />
      <Box x={53} y={212} w={24} d={30} z0={T + mz(0.38)} h={0.03} color={WHITE} />
      <Box x={54} y={213} w={22} d={28} z0={T + mz(0.38) + 0.03} h={0.012} color="#f1f5f9" />
      <Box x={30} y={206} w={14} d={14} z0={T} h={mz(0.35)} color="#f8fafc" />
      <Box x={86} y={206} w={8} d={8} z0={T} h={mz(0.4)} color="#e5e7eb" />
      <Box x={46} y={250} w={38} d={22} z0={T + 0.004} h={0.006} color="#c97a1e" />
      <Box x={100} y={200} w={14} d={3} z0={T + fm(0.7)} h={fm(0.75)} color="#e6c9a3" />

      {/* Wastafel di hall, di luar pintu kamar mandi (menempel muka timur partisi x 124) */}
      <Box x={124} y={150} w={22} d={38} z0={T} h={mz(0.8)} color="#d6c4a8" />
      <Box x={124} y={150} w={22} d={38} z0={T + mz(0.8)} h={0.015} color="#e5e7eb" />
      <Box x={130} y={157} w={12} d={24} z0={T + mz(0.8) + 0.015} h={0.006} color={WHITE} />
      <Box x={124} y={167} w={5} d={4} z0={T + mz(0.8) + 0.015} h={mz(0.25)} color="#cbd5e1" />
      {/* Cermin di dinding atas wastafel */}
      <Box x={124} y={152} w={1} d={34} z0={T + fm(1.15)} h={fm(0.75)} color="#dbeafe" emissive="#bfdbfe" />
      <Box x={124} y={150} w={1} d={38} z0={T + fm(1.13)} h={0.02} color="#475569" />
    </group>
  );
}

// Pintu kayu terbuka ±70 derajat ke dalam ruangan. Engsel di (hx, hy); daun pintu sepanjang
// bukaan (len, arah +y saat tertutup); open > 0 berayun ke +x, open < 0 berayun ke -x.
function Door({ hx, hy, len, open }: { hx: number; hy: number; len: number; open: number }) {
  const [wx, , wz] = toWorld(hx, hy);
  const h = fm(2.0);
  const L = len * SCALE;
  const dir = Math.sign(open) || 1;
  return (
    <group position={[wx, SLAB_TOP, wz]} rotation={[0, (open * Math.PI) / 180, 0]}>
      <mesh position={[0, h / 2, L / 2]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[0.035, h, L]} />
        <meshStandardMaterial color="#a47148" roughness={0.7} />
      </mesh>
      <mesh position={[dir * 0.03, h * 0.47, L * 0.85]}>
        <boxGeometry args={[0.03, 0.025, 0.06]} />
        <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[-dir * 0.03, h * 0.47, L * 0.85]}>
        <boxGeometry args={[0.03, 0.025, 0.06]} />
        <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function L2Doors() {
  return (
    <group>
      {/* Kamar 1-4: engsel di muka kamar partisi koridor (x 122), terbuka ke dalam kamar */}
      {[432, 589, 746, 903].map((y) => (
        <Door key={`pintu-kamar-${y}`} hx={122} hy={y} len={46} open={70} />
      ))}
      {/* Kamar mandi & laundry: engsel di sisi barat partisi (x 116), terbuka ke dalam ruangan */}
      <Door hx={116} hy={96} len={46} open={-70} />
      <Door hx={116} hy={246} len={46} open={-70} />
    </group>
  );
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

// Plakat ruangan menempel di dinding yang terlihat dari kamera isometrik (muka selatan/timur).
function L2Signage() {
  return (
    <group>
      <WallPlaque x={142} y={426} z={0.78} text="KAMAR 1" />
      <WallPlaque x={142} y={577} z={0.78} text="KAMAR 2" />
      <WallPlaque x={142} y={734} z={0.78} text="KAMAR 3" />
      <WallPlaque x={142} y={891} z={0.78} text="KAMAR 4" />
      <WallPlaque x={124} y={70} z={0.8} text="KAMAR MANDI" face="east" />
      <WallPlaque x={124} y={312} z={0.8} text="TOILET" face="east" />
      <WallPlaque x={240} y={120} z={0.78} text="TANGGA KE LT.1" face="east" />
      <WallPlaque x={240} y={250} z={0.78} text="LANTAI 2" face="east" />
      <WallPlaque x={200} y={1048} z={0.78} text="RUANG MAKAN" />
      <WallPlaque x={298} y={1048} z={0.78} text="PANTRY" />
      <WallPlaque x={174} y={1403} z={0.985} text="RUANG ISTIRAHAT" />
    </group>
  );
}

// Ruang makan + pantry (KAN-8): geometri kotak sederhana, tanpa bayangan.
function L2Makan() {
  return (
    <group>
      {/* Dispenser + galon AQUA menempel dinding barat ruang makan, menghadap timur (ke kamera). */}
      <group position={toWorld(10, 1340).map((v, i) => (i === 1 ? SLAB_TOP : v)) as [number, number, number]} rotation={[0, Math.PI / 2, 0]}>
        <AquaDispenser />
      </group>
      {makanPieces().filter((p) => !p.id.startsWith("dispenser")).map((p) => (
        <Box
          key={`makan-${p.id}`}
          x={p.x}
          y={p.y}
          w={p.w}
          d={p.d}
          z0={SLAB_TOP + p.z0}
          h={p.h}
          color={p.color}
          emissive={p.emissive}
        />
      ))}
    </group>
  );
}

// Lounge / ruang istirahat (KAN-9): geometri kotak sederhana, tanpa bayangan.
function L2Lounge() {
  return (
    <group>
      {loungePieces().map((p) => (
        <Box
          key={`lounge-${p.id}`}
          x={p.x}
          y={p.y}
          w={p.w}
          d={p.d}
          z0={SLAB_TOP + p.z0}
          h={p.h}
          color={p.color}
          emissive={p.emissive}
        />
      ))}
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

      {/* Panel lampu plafon dihapus (tampak melayang karena Lantai 2 tanpa plafon); cahaya tetap dari pointLight. */}
    </group>
  );
}

export const KdsLantai2Scene = memo(function KdsLantai2Scene() {
  return (
    <group position={[KDS_ORIGIN_X * SCALE, KDS_FLOOR_HEIGHT, KDS_ORIGIN_Y * SCALE]}>
      <L2Slabs />
      <L2Walls />
      <L2Stairs />
      <L2BathLaundry />
      <L2Doors />
      <L2Kamar />
      <L2Makan />
      <L2Lounge />
      <L2Signage />
      <L2Lights />
      {/* 8 staf sedang istirahat: tidur, masak, cuci piring, makan, nonton TV, main HP */}
      <KdsOffDutyStaff />
    </group>
  );
});

