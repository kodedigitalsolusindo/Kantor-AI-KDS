"use client";

import { RoundedBox, Text } from "@react-three/drei";
import { memo, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { SCALE } from "@/features/retro-office/core/constants";
import {
  KDS_DESK_COLUMNS,
  KDS_DESK_ROWS,
  KDS_ORIGIN_X,
  KDS_ORIGIN_Y,
  KDS_RUKO_DEPTH,
  KDS_RUKO_WIDTH,
  KDS_UNITS_PER_METER,
} from "@/features/retro-office/core/furnitureDefaults";
import { toWorld } from "@/features/retro-office/core/geometry";
import { KdsCats } from "@/features/retro-office/scene/kdsCats";
import { KdsReceptionist } from "@/features/retro-office/scene/kdsReceptionist";

// Ruko PT Kode Digital Solusindo, Jl. Gatot Subroto KM 4 No. 36 Medan, ukuran asli 6 x 30 m,
// diapit ruko lebar 4 m. Mengacu Street View: fasad putih + pintu lipat hijau-teal, teras terakota,
// plataran beton dengan motor, jalan lebar, pagar proyek bergaris di median, halte, pohon, kabel listrik.
// Semua koordinat di file ini lokal terhadap pojok bangunan (KDS_ORIGIN).

const W = KDS_RUKO_WIDTH;
const D = KDS_RUKO_DEPTH;
const M = KDS_UNITS_PER_METER;
const NEIGHBOR_W = 4 * M;
const TEAL = "#16a596";
const TEAL_DARK = "#0f7f74";
const NAVY = "#0b1f3a";
const BLUE = "#2563eb";
export const KDS_STORY = 1.05;
const STORY = KDS_STORY;

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

function Box({ x, y, w, d, z0 = 0, h, color, opacity, emissive }: BoxProps) {
  const [wx, , wz] = toWorld(x + w / 2, y + d / 2);
  const transparent = opacity !== undefined && opacity < 1;
  return (
    <mesh position={[wx, z0 + h / 2, wz]} castShadow={!transparent} receiveShadow>
      <boxGeometry args={[Math.max(w * SCALE, 0.001), h, Math.max(d * SCALE, 0.001)]} />
      <meshStandardMaterial
        color={color}
        roughness={0.85}
        transparent={transparent}
        opacity={opacity ?? 1}
        depthWrite={!transparent}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissive ? 0.4 : 0}
      />
    </mesh>
  );
}

function Label({
  x,
  y,
  z,
  text,
  size = 0.1,
  color = "#ffffff",
  rotY = 0,
  maxWidth,
}: {
  x: number;
  y: number;
  z: number;
  text: string;
  size?: number;
  color?: string;
  rotY?: number;
  maxWidth?: number;
}) {
  const [wx, , wz] = toWorld(x, y);
  return (
    <Text
      position={[wx, z, wz]}
      rotation={[0, rotY, 0]}
      fontSize={size}
      color={color}
      anchorX="center"
      anchorY="middle"
      maxWidth={maxWidth}
      textAlign="center"
    >
      {text}
    </Text>
  );
}

// Logo KDS asli (assets/img/logo.svg): kotak sudut membulat, gradasi #2563eb -> #06b6d4, simbol </> putih.
function useKdsLogoTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const k = size / 64;
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#2563eb");
    gradient.addColorStop(1, "#06b6d4");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 16 * k);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const stroke = (points: [number, number][], width: number, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width * k;
      ctx.beginPath();
      points.forEach(([px, py], i) => (i ? ctx.lineTo(px * k, py * k) : ctx.moveTo(px * k, py * k)));
      ctx.stroke();
    };
    stroke([[24, 20], [13, 32], [24, 44]], 5, 1);
    stroke([[40, 20], [51, 32], [40, 44]], 5, 0.75);
    stroke([[36, 17], [28, 47]], 4.5, 1);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);
}

// Ikon logo akrilik tebal (huruf timbul) dengan muka logo; face = arah hadap muka logo.
export function KdsLogoIcon({
  x,
  y,
  z,
  size,
  face = "south",
}: {
  x: number;
  y: number;
  z: number;
  size: number;
  face?: "south" | "east" | "west";
}) {
  const texture = useKdsLogoTexture();
  const [wx, , wz] = toWorld(x, y);
  const depth = Math.max(0.025, size * 0.12);
  const rotY = face === "east" ? Math.PI / 2 : face === "west" ? -Math.PI / 2 : 0;
  return (
    <group position={[wx, z, wz]} rotation={[0, rotY, 0]}>
      <RoundedBox args={[size, size, depth]} radius={size * 0.22} smoothness={4}>
        <meshStandardMaterial color="#2563eb" emissive="#1d4ed8" emissiveIntensity={0.35} roughness={0.4} />
      </RoundedBox>
      {texture ? (
        <mesh position={[0, 0, depth / 2 + 0.002]}>
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function Pole({ x, y, h, r, color }: { x: number; y: number; h: number; r: number; color: string }) {
  const [wx, , wz] = toWorld(x, y);
  return (
    <mesh position={[wx, h / 2, wz]} castShadow>
      <cylinderGeometry args={[r, r * 1.08, h, 12]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const [wx, , wz] = toWorld(x, y);
  const blobs: [number, number, number, number, string][] = [
    [0, 2.5, 0, 1.05, "#3f7d3a"],
    [0.7, 2.3, 0.3, 0.8, "#4f8f45"],
    [-0.65, 2.35, -0.2, 0.85, "#356e32"],
    [0.1, 2.95, -0.35, 0.75, "#5a9a4c"],
  ];
  return (
    <group position={[wx, 0, wz]} scale={scale}>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.9, 10]} />
        <meshStandardMaterial color="#5b4636" roughness={0.95} />
      </mesh>
      {blobs.map(([bx, by, bz, r, c], i) => (
        <mesh key={i} position={[bx, by, bz]} castShadow>
          <sphereGeometry args={[r, 14, 12]} />
          <meshStandardMaterial color={c} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Motor bebek/matic ±1,9 m.
function Motorbike({ x, y, color }: { x: number; y: number; color: string }) {
  const [wx, , wz] = toWorld(x, y);
  return (
    <group position={[wx, 0, wz]} scale={2}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.16, 0.2, 0.55]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.36, 0.06]}>
        <boxGeometry args={[0.14, 0.05, 0.3]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.42, -0.24]}>
        <boxGeometry args={[0.36, 0.03, 0.03]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {[-0.22, 0.24].map((off) => (
        <mesh key={off} position={[0, 0.11, off]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.06, 16]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function worldPoint(cx: number, cy: number, height: number): [number, number, number] {
  const [wx, , wz] = toWorld(cx, cy);
  return [wx, height, wz];
}

function Cable({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.hypot(dx, dy, dz);
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 - 0.05, (from[2] + to[2]) / 2];
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.atan2(dy, Math.hypot(dx, dz));
  return (
    <mesh position={mid} rotation={[Math.PI / 2 - pitch, yaw, 0, "YXZ"]}>
      <cylinderGeometry args={[0.008, 0.008, length, 4]} />
      <meshStandardMaterial color="#151515" />
    </mesh>
  );
}

function PowerPole({ x, y }: { x: number; y: number }) {
  return (
    <group>
      <Pole x={x} y={y} h={3.4} r={0.07} color="#9e9e9e" />
      <Box x={x - 40} y={y - 2} w={80} d={4} z0={3.15} h={0.05} color="#7d7d7d" />
      <Box x={x - 8} y={y - 8} w={16} d={10} z0={2.55} h={0.28} color="#5f6b73" />
    </group>
  );
}

// Ruko tetangga lebar 4 m; papan nama generik (tidak memakai merek usaha asli).
function RukoNeighbor({
  x,
  baseColor,
  accent,
  sign,
  shopfront,
  terrace,
}: {
  x: number;
  baseColor: string;
  accent: string;
  sign: string;
  shopfront: "glass" | "rolling";
  terrace?: string;
}) {
  const w = NEIGHBOR_W;
  return (
    <group>
      <Box x={x} y={0} w={w} d={D} h={STORY} color={baseColor} />
      {shopfront === "glass" ? (
        <Box x={x + 20} y={D} w={w - 40} d={5} z0={0.06} h={0.82} color="#9fc3d1" opacity={0.6} />
      ) : (
        <>
          <Box x={x + 20} y={D} w={w - 40} d={5} z0={0.06} h={0.82} color="#8d8f91" />
          {[0.2, 0.35, 0.5, 0.65].map((z) => (
            <Box key={z} x={x + 20} y={D + 5} w={w - 40} d={1} z0={z} h={0.01} color="#6f7173" />
          ))}
        </>
      )}
      <Box x={x + 10} y={D + 2} w={w - 20} d={8} z0={0.92} h={0.3} color={accent} />
      <Label x={x + w / 2} y={D + 11} z={1.07} text={sign} size={0.12} />
      {terrace ? <Box x={x} y={D} w={w} d={60} h={0.09} color={terrace} /> : null}
    </group>
  );
}

const TEAM_BY_ROW = [
  { short: "MOBILE", rug: "#d5e7f8", accent: "#1e88e5" },
  { short: "MOBILE", rug: "#d5e7f8", accent: "#1e88e5" },
  { short: "WEB & BACKEND", rug: "#d2ede8", accent: "#00897b" },
  { short: "WEB & BACKEND", rug: "#d2ede8", accent: "#00897b" },
  { short: "QA & UI/UX", rug: "#e9dcf1", accent: "#8e24aa" },
  { short: "SEO & DIGITAL MARKETING", rug: "#fbe0d4", accent: "#f4511e" },
  { short: "SEO & DIGITAL MARKETING", rug: "#fbe0d4", accent: "#f4511e" },
];

function Interior() {
  const tiles: ReactNode[] = [];
  for (let gx = M; gx < W; gx += M) {
    tiles.push(<Box key={`tx${gx}`} x={gx - 1} y={400} w={2} d={D - 400} z0={0.001} h={0.002} color="#d6cdbd" />);
  }
  for (let gy = 400 + M; gy < D; gy += M) {
    tiles.push(<Box key={`ty${gy}`} x={0} y={gy - 1} w={W} d={2} z0={0.001} h={0.002} color="#d6cdbd" />);
  }
  const stairs: ReactNode[] = [];
  for (let i = 0; i < 9; i += 1) {
    stairs.push(
      <Box key={`st${i}`} x={240} y={330 - (i + 1) * 34} w={102} d={34} h={(i + 1) * 0.11} color={i % 2 ? "#cfc6b8" : "#c3b9a9"} />,
    );
  }
  return (
    <group>
      <Box x={0} y={0} w={W} d={D} z0={-0.02} h={0.02} color="#eee8dc" />
      {tiles}
      <Box x={0} y={0} w={108} d={115} z0={0.001} h={0.003} color="#dfe6ea" />
      <Box x={116} y={0} w={110} d={115} z0={0.001} h={0.003} color="#3b4652" />
      <Box x={0} y={123} w={226} d={277} z0={0.001} h={0.003} color="#f6f1e7" />
      <Box x={234} y={0} w={114} d={400} z0={0.001} h={0.003} color="#c9c2b6" />
      <Box x={124} y={1178} w={224} d={252} z0={0.001} h={0.003} color="#e3e9ee" />
      <Box x={0} y={1438} w={W} d={92} z0={0.001} h={0.003} color="#ebe3d4" />
      <Box x={0} y={1538} w={W} d={202} z0={0.001} h={0.003} color="#efe6d6" />
      {stairs}
      <Box x={342} y={10} w={4} d={320} z0={0.9} h={0.04} color="#8d6e63" />

      <Label x={50} y={124} z={1.12} text="TOILET" size={0.08} color={NAVY} />
      <Label x={171} y={124} z={1.12} text="SERVER" size={0.08} color={NAVY} />
      <Label x={291} y={410} z={1.15} text="TANGGA KE LANTAI 2" size={0.07} color={NAVY} />
      <Label x={110} y={410} z={0.95} text="PANTRY" size={0.08} color={NAVY} />

      {KDS_DESK_ROWS.map((rowY, i) => (
        <group key={rowY}>
          <Box x={0} y={rowY - 24} w={W} d={90} z0={0.002} h={0.003} color={TEAM_BY_ROW[i].rug} />
          <Box x={0} y={rowY - 24} w={5} d={90} z0={0.003} h={0.004} color={TEAM_BY_ROW[i].accent} />
          {/* Papan tim di dinding kiri, menghadap ke dalam ruangan */}
          <Box x={0} y={rowY - 18} w={3} d={78} z0={0.55} h={0.22} color={TEAM_BY_ROW[i].accent} />
          <Label
            x={4}
            y={rowY + 21}
            z={0.66}
            rotY={Math.PI / 2}
            text={`TIM ${TEAM_BY_ROW[i].short}`}
            size={0.045}
            maxWidth={1.3}
          />
        </group>
      ))}

      {/* Ruang meeting: papan nama di sisi LUAR dinding (menghadap koridor), di samping pintu */}
      <Box x={112} y={1322} w={3} d={84} z0={0.4} h={0.2} color="#e8f3f2" />
      <Box x={111} y={1322} w={1} d={6} z0={0.4} h={0.2} color={TEAL} />
      <Label x={110} y={1366} z={0.5} rotY={-Math.PI / 2} text="RUANG MEETING" size={0.05} color={NAVY} />
      {/* Papan nama gantung dua sisi di koridor, tegak lurus dinding, tepat sebelum pintu */}
      <Box x={56} y={1259} w={60} d={1} z0={0.84} h={0.012} color="#9ca3af" />
      <Box x={58} y={1258} w={56} d={3} z0={0.62} h={0.2} color={NAVY} />
      <Box x={58} y={1257.6} w={5} d={3.8} z0={0.62} h={0.2} color={TEAL} />
      <Label x={88} y={1261.2} z={0.75} text="RUANG MEETING" size={0.044} />
      <Label x={88} y={1261.2} z={0.67} text="Meeting Room" size={0.026} color="#93c5fd" />
      <Label x={88} y={1256.8} z={0.75} rotY={Math.PI} text="RUANG MEETING" size={0.044} />
      <Label x={88} y={1256.8} z={0.67} rotY={Math.PI} text="Meeting Room" size={0.026} color="#93c5fd" />

      {/* Layar proyektor tarik di dinding belakang ruang meeting + proyektor gantung di plafon */}
      <Box x={168} y={1178} w={128} d={3} z0={0.92} h={0.035} color="#2b2f36" />
      <Box x={172} y={1180} w={120} d={1} z0={0.42} h={0.5} color="#f7f7f5" />
      <Box x={180} y={1181} w={104} d={1} z0={0.47} h={0.4} color="#0b1f3a" emissive="#1e3a8a" />
      <KdsLogoIcon x={204} y={1182.5} z={0.67} size={0.14} />
      <Label x={244} y={1182.5} z={0.71} text="KDS Weekly Sync" size={0.04} />
      <Label x={244} y={1182.5} z={0.64} text="Sprint review · Roadmap" size={0.022} color="#93c5fd" />
      <Box x={230} y={1299} w={4} d={4} z0={0.86} h={0.16} color="#9ca3af" />
      <Box x={220} y={1290} w={24} d={18} z0={0.81} h={0.05} color="#e5e7eb" />
      <Box x={228} y={1288} w={8} d={2} z0={0.82} h={0.03} color="#111827" emissive="#60a5fa" />

      {/* Backdrop resepsionis: panel HPL abu-putih bergaris diapit kolom kayu oak,
          logo akrilik di atas + nama PT huruf timbul hitam */}
      <Box x={14} y={1438} w={52} d={4} z0={0.02} h={0.98} color="#d9c09c" />
      <Box x={39} y={1442} w={2} d={1} z0={0.04} h={0.94} color="#b89a72" />
      <Box x={282} y={1438} w={52} d={4} z0={0.02} h={0.98} color="#d9c09c" />
      <Box x={307} y={1442} w={2} d={1} z0={0.04} h={0.94} color="#b89a72" />
      <Box x={66} y={1438} w={216} d={3} z0={0.02} h={0.98} color="#eceeef" />
      <Box x={173} y={1441} w={2} d={1} z0={0.02} h={0.98} color="#c7c9cc" />
      <Box x={66} y={1441} w={216} d={1} z0={0.25} h={0.006} color="#c7c9cc" />
      <Box x={66} y={1441} w={216} d={1} z0={0.5} h={0.006} color="#c7c9cc" />
      <Box x={66} y={1441} w={216} d={1} z0={0.75} h={0.006} color="#c7c9cc" />
      <KdsLogoIcon x={174} y={1443} z={0.88} size={0.18} />
      <Label x={174} y={1444} z={0.7} text="PT KODE DIGITAL SOLUSINDO" size={0.06} color="#141414" />
      <Label x={174} y={1444} z={0.63} text="Software House · Medan" size={0.026} color="#5b5f66" />

      {/* Sekat 1 sisi kanan: panel logo kecil menghadap ruang tunggu */}
      <Box x={268} y={1538} w={72} d={3} z0={0.3} h={0.62} color={NAVY} />
      <KdsLogoIcon x={304} y={1542} z={0.72} size={0.24} />
      <Label x={304} y={1546} z={0.5} text="KodeSolusindo" size={0.05} />
      <Label x={304} y={1546} z={0.41} text="Software House" size={0.028} color="#9fd8d1" />

      {/* Dinding keliling: belakang dan dinding bersama tetangga */}
      <Box x={-8} y={-8} w={W + 16} d={8} h={STORY} color="#f4f1ea" />
      <Box x={-8} y={0} w={8} d={D} h={STORY} color="#f4f1ea" />
      <Box x={W} y={0} w={8} d={D} h={STORY} color="#f4f1ea" />
    </group>
  );
}

function Facade() {
  const mullions: ReactNode[] = [];
  for (let mx = 0; mx <= W; mx += M) {
    if (mx > 125 && mx < 220) continue;
    mullions.push(<Box key={`m${mx}`} x={Math.min(mx, W - 6)} y={D - 2} w={6} d={10} z0={0.05} h={0.92} color={TEAL} />);
  }
  return (
    <group>
      <Box x={0} y={D - 4} w={W} d={12} h={0.06} color="#d7ccc8" />
      <Box x={0} y={D} w={140} d={4} z0={0.05} h={0.92} color="#24343d" opacity={0.42} />
      <Box x={208} y={D} w={140} d={4} z0={0.05} h={0.92} color="#24343d" opacity={0.42} />
      {mullions}
      <Box x={0} y={D - 2} w={W} d={10} z0={0.95} h={0.06} color={TEAL_DARK} />
      {/* Pintu lipat hijau-teal (ciri ruko KDS) terlipat di kedua sisi pintu kaca */}
      {[124, 132, 208, 216].map((px, i) => (
        <Box key={`f${px}`} x={px} y={D + 2} w={8} d={14} z0={0.05} h={0.92} color={i % 2 ? TEAL_DARK : TEAL} />
      ))}
      <Box x={140} y={D + 2} w={68} d={3} z0={0.05} h={0.92} color="#bfe3df" opacity={0.25} />

      {/* Papan nama: panel ACP navy + huruf timbul akrilik backlit LED */}
      <Box x={0} y={D} w={W} d={14} z0={STORY} h={0.5} color="#f7f7f2" />
      <Box x={8} y={D + 14} w={W - 16} d={5} z0={STORY + 0.04} h={0.42} color={NAVY} />
      <KdsLogoIcon x={34} y={D + 21} z={STORY + 0.25} size={0.36} />
      <Label x={200} y={D + 24} z={STORY + 0.3} text="KodeSolusindo" size={0.2} />
      <Label x={200} y={D + 24} z={STORY + 0.12} text="PT KODE DIGITAL SOLUSINDO · SOFTWARE HOUSE" size={0.05} color="#60a5fa" />

      {/* Neon box vertikal (blade sign) di sisi kanan fasad */}
      <Box x={W - 10} y={D + 10} w={12} d={66} z0={STORY + 0.55} h={0.95} color={BLUE} emissive={BLUE} />
      <KdsLogoIcon x={W + 4} y={D + 43} z={STORY + 1.22} size={0.42} face="east" />
      <KdsLogoIcon x={W - 12} y={D + 43} z={STORY + 1.22} size={0.42} face="west" />
      <Label x={W + 3} y={D + 43} z={STORY + 0.94} rotY={Math.PI / 2} text="KODE" size={0.09} />
      <Label x={W + 3} y={D + 43} z={STORY + 0.8} rotY={Math.PI / 2} text="SOLUSINDO" size={0.06} />
      <Label x={W - 11} y={D + 43} z={STORY + 0.94} rotY={-Math.PI / 2} text="KODE" size={0.09} />

      {/* Stiker sandblast kaca etalase, jam buka di pintu, nomor rumah */}
      <Box x={10} y={D + 5} w={120} d={2} z0={0.42} h={0.22} color="#e8f3f2" opacity={0.8} />
      <Label x={70} y={D + 7} z={0.57} text="Aplikasi Android · iOS" size={0.035} color={NAVY} />
      <Label x={70} y={D + 7} z={0.49} text="HarmonyOS · Web" size={0.035} color={NAVY} />
      <Box x={218} y={D + 5} w={120} d={2} z0={0.42} h={0.22} color="#e8f3f2" opacity={0.8} />
      <Label x={278} y={D + 7} z={0.57} text="SEO · Digital Marketing" size={0.035} color={NAVY} />
      <Label x={278} y={D + 7} z={0.49} text="Digital Ads · 0819-830-448" size={0.032} color={NAVY} />
      <Box x={150} y={D + 5} w={48} d={2} z0={0.5} h={0.16} color="#ffffff" opacity={0.85} />
      <Label x={174} y={D + 7} z={0.61} text="BUKA" size={0.035} color={TEAL_DARK} />
      <Label x={174} y={D + 7} z={0.54} text="Sen–Jum 09–17" size={0.022} color={NAVY} />
      <Box x={300} y={D + 14} w={30} d={3} z0={0.72} h={0.12} color="#1d2a33" />
      <Label x={315} y={D + 18} z={0.78} text="36" size={0.07} />

      {/* Unit AC outdoor di atas papan nama */}
      <Box x={14} y={D + 4} w={44} d={18} z0={STORY + 0.52} h={0.22} color="#f2f2f2" />
      <Box x={270} y={D + 4} w={44} d={18} z0={STORY + 0.52} h={0.22} color="#f2f2f2" />
    </group>
  );
}

function Street() {
  const grout: ReactNode[] = [];
  for (let gx = 0; gx <= W; gx += 29) {
    grout.push(<Box key={`g${gx}`} x={gx} y={D + 4} w={2} d={66} z0={0.1} h={0.004} color="#8f3d2c" />);
  }
  const dashes: ReactNode[] = [];
  for (let dx = -1500; dx < 1900; dx += 230) {
    dashes.push(<Box key={`d${dx}`} x={dx} y={D + 410} w={120} d={7} z0={0.003} h={0.004} color="#f4f4f4" />);
    dashes.push(<Box key={`e${dx}`} x={dx + 100} y={D + 600} w={120} d={7} z0={0.003} h={0.004} color="#f4f4f4" />);
  }
  const yApron = D + 70;
  const yCurb = D + 210;
  const yRoad = yCurb + 8;
  const yMedian = yRoad + 580;
  return (
    <group>
      <Box x={-1700} y={-800} w={3800} d={D + 1900} z0={-0.06} h={0.04} color="#7c8078" />

      {/* Teras terakota (±1,2 m) + undakan + ramp beton */}
      <Box x={0} y={D + 4} w={W} d={66} h={0.1} color="#b4533c" />
      {grout}
      <Box x={128} y={yApron} w={92} d={18} h={0.066} color="#a84a35" />
      <Box x={128} y={yApron + 18} w={92} d={14} h={0.033} color="#9c4532" />
      <Box x={150} y={yApron} w={48} d={40} h={0.05} color="#a9a59d" />

      {/* Plataran beton + parkir motor */}
      <Box x={-1700} y={yApron} w={3800} d={140} z0={-0.01} h={0.012} color="#a7a39b" />
      <Box x={20} y={yApron + 60} w={90} d={40} z0={0.003} h={0.003} color="#958f85" />
      <Box x={-180} y={yApron + 40} w={120} d={50} z0={0.003} h={0.003} color="#958f85" />
      <Motorbike x={40} y={yApron + 70} color="#c62828" />
      <Motorbike x={85} y={yApron + 72} color="#1565c0" />
      <Motorbike x={270} y={yApron + 70} color="#212121" />
      <Motorbike x={315} y={yApron + 72} color="#f9a825" />
      <Motorbike x={-150} y={yApron + 70} color="#ad1457" />
      <Motorbike x={430} y={yApron + 74} color="#455a64" />

      {/* Jalan Gatot Subroto */}
      <Box x={-1700} y={yCurb} w={3800} d={8} h={0.04} color="#cfcac0" />
      <Box x={-1700} y={yRoad} w={3800} d={580} z0={-0.01} h={0.012} color="#3d4044" />
      <Box x={-1700} y={yRoad + 12} w={3800} d={5} z0={0.003} h={0.004} color="#e8e8e8" />
      <Box x={-1700} y={yMedian - 16} w={3800} d={5} z0={0.003} h={0.004} color="#e8e8e8" />
      {dashes}

      {/* Pagar proyek di median: panel putih bergaris merah-biru-hijau */}
      <Box x={-1700} y={yMedian} w={3800} d={10} h={0.6} color="#f1f1ee" />
      <Box x={-1700} y={yMedian - 2} w={3800} d={14} z0={0.43} h={0.035} color="#d32f2f" />
      <Box x={-1700} y={yMedian - 2} w={3800} d={14} z0={0.39} h={0.035} color="#1565c0" />
      <Box x={-1700} y={yMedian - 2} w={3800} d={14} z0={0.35} h={0.035} color="#2e7d32" />
      <Box x={-1700} y={yMedian + 10} w={3800} d={300} z0={-0.01} h={0.012} color="#45484c" />

      {/* Halte biru-merah + rambu STOP (sisi kanan, seperti di Street View) */}
      <group>
        <Box x={650} y={yApron + 20} w={160} d={60} z0={1.25} h={0.06} color="#1e5bb8" />
        {/* Halte menghadap jalan: dinding belakang di sisi trotoar/bangunan, list atap merah di sisi jalan */}
        <Box x={650} y={yApron + 76} w={160} d={4} z0={1.18} h={0.1} color="#d32f2f" />
        {[654, 800].map((hx) =>
          [yApron + 22, yApron + 72].map((hy) => <Box key={`h${hx}${hy}`} x={hx} y={hy} w={6} d={6} h={1.25} color="#1e5bb8" />),
        )}
        <Box x={650} y={yApron + 19} w={160} d={5} z0={0.1} h={1.08} color="#d32f2f" opacity={0.85} />
        <Box x={670} y={yApron + 28} w={120} d={18} z0={0.28} h={0.05} color="#9e9e9e" />
        <Box x={670} y={yApron + 25} w={120} d={3} z0={0.33} h={0.18} color="#9e9e9e" />
        <Pole x={840} y={yApron + 86} h={1.7} r={0.025} color="#2b6cd4" />
        <Box x={825} y={yApron + 82} w={32} d={3} z0={1.48} h={0.24} color="#1e5bb8" />
        <Label x={841} y={yApron + 85} z={1.6} text="STOP" size={0.07} />
        <Box x={825} y={yApron + 82} w={32} d={3} z0={1.3} h={0.14} color="#f2f2f2" />
        <Label x={841} y={yApron + 85} z={1.37} text="HALTE" size={0.05} color={NAVY} />
      </group>

      {/* Pohon peneduh & tiang listrik dengan kabel */}
      <Tree x={-380} y={yApron + 120} scale={1.1} />
      <Tree x={1000} y={yApron + 125} scale={1.2} />
      <Tree x={-900} y={yApron + 125} />
      <PowerPole x={-70} y={yCurb - 6} />
      <PowerPole x={420} y={yCurb - 6} />
      <PowerPole x={1100} y={yCurb - 6} />
      <Cable from={worldPoint(-70, yCurb - 6, 3.18)} to={worldPoint(420, yCurb - 6, 3.18)} />
      <Cable from={worldPoint(-70, yCurb - 6, 3.05)} to={worldPoint(420, yCurb - 6, 3.05)} />
      <Cable from={worldPoint(420, yCurb - 6, 3.18)} to={worldPoint(1100, yCurb - 6, 3.18)} />
      <Cable from={worldPoint(420, yCurb - 6, 3.05)} to={worldPoint(1100, yCurb - 6, 3.05)} />
      <Cable from={worldPoint(420, yCurb - 6, 2.7)} to={worldPoint(292, D + 12, 1.75)} />
      <Cable from={worldPoint(-70, yCurb - 6, 2.7)} to={worldPoint(36, D + 12, 1.75)} />
    </group>
  );
}

export const KdsRukoScene = memo(function KdsRukoScene() {
  return (
    <group position={[KDS_ORIGIN_X * SCALE, 0, KDS_ORIGIN_Y * SCALE]}>
      <Street />
      <Interior />
      <Facade />
      <KdsCats />
      {/* Tata, resepsionis penerima tamu, standby di belakang meja depan menghadap pintu masuk */}
      <KdsReceptionist x={205} y={1466} name="Tata" />
      <RukoNeighbor x={-8 - NEIGHBOR_W} baseColor="#ece8e1" accent="#d81b60" sign="SALON" shopfront="glass" terrace="#b4533c" />
      <RukoNeighbor x={-16 - NEIGHBOR_W * 2} baseColor="#e7a1a6" accent="#6d4c41" sign="TOKO" shopfront="rolling" />
      <RukoNeighbor x={-24 - NEIGHBOR_W * 3} baseColor="#f3efe7" accent="#455a64" sign="BENGKEL" shopfront="rolling" />
      <RukoNeighbor x={W + 8} baseColor="#eef0f4" accent="#1f3fbf" sign="TOKO PERLENGKAPAN" shopfront="glass" />
      <RukoNeighbor x={W + 16 + NEIGHBOR_W} baseColor="#f1e6d6" accent="#ef6c00" sign="RUMAH MAKAN" shopfront="rolling" />
      <RukoNeighbor x={W + 24 + NEIGHBOR_W * 2} baseColor="#e3f0e6" accent="#2e7d32" sign="APOTEK" shopfront="glass" />
    </group>
  );
});
