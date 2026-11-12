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
// Tinggi dinding cutaway tampilan LT.1 (skala vertikal stilisasi Claw3D). Jangan diubah:
// tampilan Lantai 1 harus identik.
export const KDS_STORY = 1.05;
const STORY = KDS_STORY;
// Tinggi satu lantai nyata ruko (3,0 m) dalam satuan dunia, skala horizontal yang sama
// (1 m = KDS_UNITS_PER_METER × SCALE). Dipakai saat LT.2: pelat Lantai 2 berada di ketinggian
// ini dan cangkang luar Lantai 1 tampil setinggi satu lantai penuh.
export const KDS_FLOOR_HEIGHT_M = 3.0;
export const KDS_FLOOR_HEIGHT = KDS_FLOOR_HEIGHT_M * KDS_UNITS_PER_METER * SCALE;
const FLOOR_H = KDS_FLOOR_HEIGHT;
// Proporsi fasad saat tampil setinggi satu lantai penuh (LT.2).
const TALL_STORE_H = 2.0; // tinggi kaca etalase/pintu lipat
const TALL_SIGN_Z = 2.35; // dasar papan nama, papan berakhir ±0,5 di atasnya (di bawah pelat L2)

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

type LogoKind = "kds" | "ainichat" | "kencang";

// Tekstur logo (canvas). KDS: assets/img/logo.svg (gradasi #2563eb -> #06b6d4, simbol </>).
// AiniChat: ainichat.com/icon.svg (gradasi biru, gelembung chat + pin). kencang.in: apple-touch-icon
// (gradasi oranye -> ungu, petir putih + garis kecepatan).
function drawLogo(ctx: CanvasRenderingContext2D, size: number, kind: LogoKind) {
  if (kind === "ainichat") {
    const k = size / 512;
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, "#4b9bff");
    g.addColorStop(1, "#2f80ed");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 112 * k);
    ctx.fill();
    ctx.save();
    ctx.scale(k, k);
    ctx.fillStyle = "#ffffff";
    ctx.fill(new Path2D("M256 112c-88 0-152 56-152 128 0 40 20 75 52 98l-14 60 66-34c15 4 31 6 48 6 88 0 152-56 152-130s-64-128-152-128z"));
    ctx.fillStyle = "#2f80ed";
    ctx.fill(new Path2D("M256 196c-26 0-46 20-46 45 0 36 46 74 46 74s46-38 46-74c0-25-20-45-46-45z"));
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(256, 241, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (kind === "kencang") {
    const k = size / 180;
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, "#f45b45");
    g.addColorStop(0.55, "#c14a8f");
    g.addColorStop(1, "#7343e3");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 34 * k);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineCap = "round";
    ctx.lineWidth = 7 * k;
    for (const [y0, x1] of [[62, 46], [90, 40], [118, 46]] as const) {
      ctx.beginPath();
      ctx.moveTo(12 * k, y0 * k);
      ctx.lineTo(x1 * k, y0 * k);
      ctx.stroke();
    }
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    const bolt: [number, number][] = [[106, 16], [60, 96], [94, 96], [76, 164], [136, 70], [101, 70], [106, 16]];
    bolt.forEach(([px, py], i) => (i ? ctx.lineTo(px * k, py * k) : ctx.moveTo(px * k, py * k)));
    ctx.fill();
    return;
  }
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
  ctx.globalAlpha = 1;
}

function useLogoTexture(kind: LogoKind) {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    drawLogo(ctx, size, kind);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, [kind]);
}

const LOGO_BODY: Record<LogoKind, { color: string; emissive: string }> = {
  kds: { color: "#2563eb", emissive: "#1d4ed8" },
  ainichat: { color: "#2f80ed", emissive: "#1f6fd8" },
  kencang: { color: "#a64aa8", emissive: "#7343e3" },
};

// Ikon logo akrilik tebal (huruf timbul) dengan muka logo; face = arah hadap muka logo.
export function LogoIcon({
  x,
  y,
  z,
  size,
  face = "south",
  kind,
}: {
  x: number;
  y: number;
  z: number;
  size: number;
  face?: "south" | "east" | "west";
  kind: LogoKind;
}) {
  const texture = useLogoTexture(kind);
  const [wx, , wz] = toWorld(x, y);
  const depth = Math.max(0.025, size * 0.12);
  const rotY = face === "east" ? Math.PI / 2 : face === "west" ? -Math.PI / 2 : 0;
  const body = LOGO_BODY[kind];
  return (
    <group position={[wx, z, wz]} rotation={[0, rotY, 0]}>
      <RoundedBox args={[size, size, depth]} radius={size * 0.22} smoothness={4}>
        <meshStandardMaterial color={body.color} emissive={body.emissive} emissiveIntensity={0.35} roughness={0.4} />
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

export function KdsLogoIcon(props: { x: number; y: number; z: number; size: number; face?: "south" | "east" | "west" }) {
  return <LogoIcon {...props} kind="kds" />;
}

// Tulisan timbul (huruf akrilik tebal): beberapa lapis teks bertumpuk ke arah jalan (y) sehingga
// tepi huruf tampak tebal dari kamera isometrik; lapisan depan putih dengan garis tepi tipis.
function EmbossedLabel({
  x,
  y,
  z,
  text,
  size,
  depthUnits = 5,
  face = "#ffffff",
  side = "#9db8e8",
}: {
  x: number;
  y: number;
  z: number;
  text: string;
  size: number;
  depthUnits?: number;
  face?: string;
  side?: string;
}) {
  const layers: ReactNode[] = [];
  for (let i = 0; i < depthUnits; i += 1) {
    const [wx, , wz] = toWorld(x, y - depthUnits + i);
    layers.push(
      <Text key={`emb${i}`} position={[wx, z, wz]} fontSize={size} color={side} anchorX="left" anchorY="middle">
        {text}
      </Text>,
    );
  }
  const [fx, , fz] = toWorld(x, y);
  return (
    <group>
      {layers}
      <Text position={[fx, z, fz]} fontSize={size} color={face} anchorX="left" anchorY="middle" outlineWidth={size * 0.03} outlineColor="#dbe7ff">
        {text}
      </Text>
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

// Tetangga timur No. 34 sesuai Street View (Agu 2026): fasad biru penuh, papan nama biru besar
// "CV. DUA BERSAUDARA", etalase kaca kiri, pintu tengah, tembok rendah biru kanan, bendera merah putih.
function DuaBersaudaraFront({ x, tall }: { x: number; tall: boolean }) {
  const w = NEIGHBOR_W;
  const H = tall ? FLOOR_H : STORY;
  const k = tall ? TALL_STORE_H / 0.82 : 1;
  const signZ = tall ? TALL_SIGN_Z - 0.35 : 0.62;
  const signH = tall ? 0.85 : 0.4;
  const BLUE_FACADE = "#1f45d6";
  return (
    <group>
      {/* Kelongsong biru seluruh muka bangunan */}
      <Box x={x} y={D} w={w} d={3} h={H} color={BLUE_FACADE} />
      {/* Papan nama biru besar dengan huruf putih */}
      <Box x={x + 6} y={D + 3} w={w - 12} d={4} z0={signZ} h={signH} color="#1a3bbf" />
      <Label x={x + w / 2} y={D + 8} z={signZ + signH * 0.78} text="CV. DUA BERSAUDARA" size={tall ? 0.15 : 0.075} color="#e6ebf5" />
      <Label x={x + w / 2} y={D + 8} z={signZ + signH * 0.5} text="Pusat: PERLENGKAPAN TNI · POLRI · POL. PP" size={tall ? 0.07 : 0.035} color="#e6ebf5" />
      <Label x={x + w / 2} y={D + 8} z={signZ + signH * 0.25} text="SECURITY · LINMAS · PRAMUKA & UMUM" size={tall ? 0.07 : 0.035} color="#e6ebf5" />
      {/* Spanduk kecil warna-warni di atas pintu */}
      <Box x={x + 14} y={D + 3} w={120} d={3} z0={signZ - 0.12} h={0.1} color="#7a3b1e" />
      {/* Etalase kaca berisi rak (kiri) */}
      <Box x={x + 14} y={D + 4} w={60} d={20} z0={0.04} h={0.62 * k} color="#cfe3ea" opacity={0.55} />
      {[0.18, 0.34, 0.5].map((z) => (
        <Box key={`rak${z}`} x={x + 16} y={D + 6} w={56} d={16} z0={z * k} h={0.015} color="#8d6e63" />
      ))}
      {/* Pintu gelap (tengah) */}
      <Box x={x + 80} y={D + 3} w={70} d={2} z0={0.04} h={0.7 * k} color="#20262c" />
      {/* Tembok rendah biru (kanan) */}
      <Box x={x + 156} y={D + 3} w={w - 160} d={10} z0={0} h={0.3 * k} color={BLUE_FACADE} />
      {/* Bendera merah putih di sisi kiri */}
      <Box x={x + 6} y={D + 26} w={2} d={2} h={0.95 * k} color="#d7d7d7" />
      <Box x={x + 8} y={D + 26} w={2} d={22} z0={0.95 * k - 0.16} h={0.08} color="#d32f2f" />
      <Box x={x + 8} y={D + 26} w={2} d={22} z0={0.95 * k - 0.24} h={0.08} color="#f5f5f5" />
      {/* Nomor rumah */}
      <Label x={x + 152} y={D + 6} z={0.5 * k} text="34" size={0.05} />
    </group>
  );
}

// Tetangga berikutnya sesuai Street View: bangunan putih beraksen oranye, kanopi seng menjorok,
// spanduk oranye "RM SUDI MAMPIR", etalase lauk, gerobak putih, AC outdoor di dinding atas.
function SudiMampirFront({ x, tall }: { x: number; tall: boolean }) {
  const w = NEIGHBOR_W;
  const H = tall ? FLOOR_H : STORY;
  const k = tall ? TALL_STORE_H / 0.82 : 1;
  const awningZ = tall ? 2.05 : 0.86;
  const ORANGE = "#ec7a2c";
  return (
    <group>
      {/* Muka bangunan putih + lis vertikal oranye */}
      <Box x={x} y={D} w={w} d={3} h={H} color="#f3f1ec" />
      <Box x={x} y={D + 1} w={26} d={3} h={H} color={ORANGE} />
      {/* Pintu masuk berbingkai oranye */}
      <Box x={x + 30} y={D + 3} w={66} d={2} z0={0.04} h={0.7 * k} color="#3b2a22" />
      <Box x={x + 28} y={D + 3} w={70} d={3} z0={0.7 * k + 0.04} h={0.05} color={ORANGE} />
      {/* Kanopi seng menjorok ±1,2 m + tiang depan */}
      <Box x={x + 4} y={D} w={w - 8} d={70} z0={awningZ} h={0.03} color="#8c939a" />
      <Box x={x + 10} y={D + 66} w={4} d={4} h={awningZ} color="#6d7378" />
      <Box x={x + w - 14} y={D + 66} w={4} d={4} h={awningZ} color="#6d7378" />
      {/* Spanduk oranye di tepi depan kanopi */}
      <Box x={x + 70} y={D + 68} w={w - 80} d={3} z0={awningZ - (tall ? 0.42 : 0.24)} h={tall ? 0.42 : 0.24} color={ORANGE} />
      <Label x={x + 70 + (w - 80) / 2} y={D + 72} z={awningZ - (tall ? 0.2 : 0.12)} text="RM SUDI MAMPIR" size={tall ? 0.13 : 0.07} color="#1d2a6b" />
      {/* Etalase lauk (kaca, dasar kayu gelap) */}
      <Box x={x + 120} y={D + 8} w={90} d={30} z0={0} h={0.28 * k} color="#4a2f22" />
      <Box x={x + 120} y={D + 8} w={90} d={30} z0={0.28 * k} h={0.22 * k} color="#d9e7ee" opacity={0.6} />
      {/* Gerobak putih */}
      <Box x={x + 100} y={D + 44} w={36} d={22} z0={0.06} h={0.5 * k} color="#f5f5f5" />
      {/* AC outdoor di dinding atas (hanya terlihat saat tinggi penuh) */}
      {tall ? (
        <>
          <Box x={x + 40} y={D + 3} w={40} d={14} z0={2.55} h={0.22} color="#e6e6e6" />
          <Box x={x + 90} y={D + 3} w={40} d={14} z0={2.55} h={0.22} color="#e6e6e6" />
        </>
      ) : null}
    </group>
  );
}

// Tetangga barat persis (Street View): Secret Beauty Salon — muka putih, spanduk besar putih berlogo
// pink, 3 AC outdoor, pintu kaca berbingkai baja + panel kayu, undakan teraso merah marun + ramp, kursi plastik.
function SecretBeautyFront({ x, tall }: { x: number; tall: boolean }) {
  const w = NEIGHBOR_W;
  const H = tall ? FLOOR_H : STORY;
  const k = tall ? TALL_STORE_H / 0.82 : 1;
  const bannerZ = tall ? 2.25 : 0.72;
  const bannerH = tall ? 0.85 : 0.3;
  const MAROON = "#7d2f2a";
  return (
    <group>
      <Box x={x} y={D} w={w} d={3} h={H} color="#f4f3f0" />
      {/* Spanduk putih besar + lingkaran logo pink */}
      <Box x={x + 10} y={D + 3} w={w - 20} d={2} z0={bannerZ} h={bannerH} color="#fbfbfb" />
      <Box x={x + w / 2 - 28} y={D + 5} w={56} d={1} z0={bannerZ + bannerH * 0.18} h={bannerH * 0.64} color="#f2d5e3" />
      <Label x={x + w / 2} y={D + 7} z={bannerZ + bannerH * 0.55} text="SECRET BEAUTY" size={tall ? 0.11 : 0.05} color="#5b4a52" />
      <Label x={x + w / 2} y={D + 7} z={bannerZ + bannerH * 0.33} text="Salon" size={tall ? 0.08 : 0.04} color="#c2185b" />
      {/* 3 AC outdoor di bawah spanduk */}
      {tall
        ? [30, 96, 162].map((ax) => <Box key={`ac${ax}`} x={x + ax} y={D + 3} w={40} d={12} z0={1.75} h={0.26} color="#e9e9e9" />)
        : null}
      {/* Pintu kaca berbingkai baja (tengah) diapit panel kayu */}
      <Box x={x + 50} y={D + 3} w={10} d={3} z0={0.12} h={0.62 * k} color="#8a5a3c" />
      <Box x={x + 60} y={D + 3} w={110} d={2} z0={0.12} h={0.62 * k} color="#b9cdd6" opacity={0.6} />
      <Box x={x + 170} y={D + 3} w={10} d={3} z0={0.12} h={0.62 * k} color="#8a5a3c" />
      <Box x={x + 60} y={D + 3} w={110} d={3} z0={0.12 + 0.62 * k} h={0.03} color="#9ea7ad" />
      {/* Undakan teraso merah marun + ramp beton di tengah */}
      <Box x={x + 20} y={D} w={w - 40} d={40} h={0.12} color={MAROON} />
      <Box x={x + 20} y={D + 40} w={w - 40} d={30} h={0.06} color={MAROON} />
      <Box x={x + 92} y={D} w={40} d={70} z0={0.001} h={0.125} color="#c9bfb4" />
      {/* Kursi plastik merah & hitam di teras */}
      <Box x={x + 150} y={D + 10} w={18} d={18} z0={0.12} h={0.22} color="#9b1c2c" />
      <Box x={x + 172} y={D + 10} w={18} d={18} z0={0.12} h={0.22} color="#2b2b2b" />
    </group>
  );
}

// Tetangga barat kedua: ruko pink — jendela lengkung di atas, pintu lipat kayu cokelat, lis atap.
function PinkArchFront({ x, tall }: { x: number; tall: boolean }) {
  const w = NEIGHBOR_W;
  const H = tall ? FLOOR_H : STORY;
  const k = tall ? TALL_STORE_H / 0.82 : 1;
  return (
    <group>
      <Box x={x} y={D} w={w} d={3} h={H} color="#e98c96" />
      {/* Pintu lipat kayu cokelat (dua bukaan) */}
      {[16, 124].map((px) => (
        <group key={`pl${px}`}>
          <Box x={x + px} y={D + 3} w={92} d={3} z0={0.04} h={0.66 * k} color="#5d3a25" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Box key={i} x={x + px + 8 + i * 14} y={D + 6} w={2} d={1} z0={0.06} h={0.62 * k} color="#3f2617" />
          ))}
        </group>
      ))}
      {/* Lis seng di atas pintu */}
      <Box x={x} y={D} w={w} d={24} z0={0.66 * k + 0.08} h={0.03} color="#b56a55" />
      {/* Jendela lengkung berjeruji di lantai atas (hanya saat tinggi penuh) */}
      {tall
        ? [30, 92, 154].map((wx) => (
            <group key={`jl${wx}`}>
              <Box x={x + wx} y={D + 3} w={46} d={2} z0={2.15} h={0.62} color="#3d4a52" />
              <Box x={x + wx - 3} y={D + 3} w={52} d={3} z0={2.77} h={0.08} color="#c96b78" />
            </group>
          ))
        : null}
    </group>
  );
}

// Ruko tetangga lebar 4 m. Tetangga dekat KDS memakai fasad khusus sesuai Street View.
function RukoNeighbor({
  x,
  baseColor,
  accent,
  sign,
  shopfront,
  terrace,
  tall = false,
  style,
}: {
  x: number;
  baseColor: string;
  accent: string;
  sign: string;
  shopfront: "glass" | "rolling";
  terrace?: string;
  tall?: boolean;
  style?: "duaBersaudara" | "sudiMampir" | "secretBeauty" | "pinkArch";
}) {
  const w = NEIGHBOR_W;
  if (style) {
    return (
      <group>
        <Box x={x} y={0} w={w} d={D} h={tall ? FLOOR_H : STORY} color={baseColor} />
        {style === "duaBersaudara" ? <DuaBersaudaraFront x={x} tall={tall} /> : null}
        {style === "sudiMampir" ? <SudiMampirFront x={x} tall={tall} /> : null}
        {style === "secretBeauty" ? <SecretBeautyFront x={x} tall={tall} /> : null}
        {style === "pinkArch" ? <PinkArchFront x={x} tall={tall} /> : null}
        {terrace ? <Box x={x} y={D} w={w} d={60} h={0.09} color={terrace} /> : null}
      </group>
    );
  }
  // tall (LT.2): tetangga setinggi satu lantai penuh agar sejajar cangkang ruko KDS.
  const k = tall ? TALL_STORE_H / 0.82 : 1;
  const storeH = 0.82 * k;
  const signZ = tall ? TALL_SIGN_Z : 0.92;
  return (
    <group>
      <Box x={x} y={0} w={w} d={D} h={tall ? FLOOR_H : STORY} color={baseColor} />
      {shopfront === "glass" ? (
        <Box x={x + 20} y={D} w={w - 40} d={5} z0={0.06} h={storeH} color="#9fc3d1" opacity={0.6} />
      ) : (
        <>
          <Box x={x + 20} y={D} w={w - 40} d={5} z0={0.06} h={storeH} color="#8d8f91" />
          {[0.2, 0.35, 0.5, 0.65].map((z) => (
            <Box key={z} x={x + 20} y={D + 5} w={w - 40} d={1} z0={z * k} h={0.01} color="#6f7173" />
          ))}
        </>
      )}
      <Box x={x + 10} y={D + 2} w={w - 20} d={8} z0={signZ} h={0.3} color={accent} />
      <Label x={x + w / 2} y={D + 11} z={signZ + 0.15} text={sign} size={0.12} />
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

// Cangkang luar L1: lantai dasar + tangga ke L2 + dinding keliling (badan bangunan).
// Tetap tampil saat LT.2 agar Lantai 2 tampak berdiri di atas ruko.
// tall (LT.2): dinding keliling setinggi satu lantai penuh (3,0 m) dan tangga naik sampai pelat L2.
function L1Shell({ tall = false }: { tall?: boolean }) {
  const wallH = tall ? FLOOR_H : STORY;
  const rise = tall ? FLOOR_H / 9 : 0.11;
  const stairs: ReactNode[] = [];
  for (let i = 0; i < 9; i += 1) {
    stairs.push(
      <Box key={`st${i}`} x={240} y={330 - (i + 1) * 34} w={102} d={34} h={(i + 1) * rise} color={i % 2 ? "#cfc6b8" : "#c3b9a9"} />,
    );
  }
  return (
    <group>
      <Box x={0} y={0} w={W} d={D} z0={-0.02} h={0.02} color="#eee8dc" />
      {stairs}
      <Box x={-8} y={-8} w={W + 16} d={8} h={wallH} color="#f4f1ea" />
      <Box x={-8} y={0} w={8} d={D} h={wallH} color="#f4f1ea" />
      <Box x={W} y={0} w={8} d={D} h={wallH} color="#f4f1ea" />
    </group>
  );
}

function Interior() {
  const tiles: ReactNode[] = [];
  for (let gx = M; gx < W; gx += M) {
    tiles.push(<Box key={`tx${gx}`} x={gx - 1} y={400} w={2} d={D - 400} z0={0.001} h={0.002} color="#d6cdbd" />);
  }
  for (let gy = 400 + M; gy < D; gy += M) {
    tiles.push(<Box key={`ty${gy}`} x={0} y={gy - 1} w={W} d={2} z0={0.001} h={0.002} color="#d6cdbd" />);
  }
  return (
    <group>
      {tiles}
      <Box x={0} y={0} w={108} d={115} z0={0.001} h={0.003} color="#dfe6ea" />
      <Box x={116} y={0} w={110} d={115} z0={0.001} h={0.003} color="#3b4652" />
      <Box x={0} y={123} w={226} d={277} z0={0.001} h={0.003} color="#f6f1e7" />
      <Box x={234} y={0} w={114} d={400} z0={0.001} h={0.003} color="#c9c2b6" />
      <Box x={124} y={1178} w={224} d={252} z0={0.001} h={0.003} color="#e3e9ee" />
      <Box x={0} y={1438} w={W} d={92} z0={0.001} h={0.003} color="#ebe3d4" />
      <Box x={0} y={1538} w={W} d={202} z0={0.001} h={0.003} color="#efe6d6" />
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

    </group>
  );
}

// tall (LT.2): fasad setinggi satu lantai penuh — etalase/pintu ±2 m, papan nama tepat di bawah
// pelat Lantai 2, dinding depan ditutup sampai KDS_FLOOR_HEIGHT. Default = tampilan LT.1 (tidak berubah).
function Facade({ tall = false }: { tall?: boolean }) {
  const storeH = tall ? TALL_STORE_H : 0.92;
  const SZ = tall ? TALL_SIGN_Z : STORY;
  const mullions: ReactNode[] = [];
  for (let mx = 0; mx <= W; mx += M) {
    if (mx > 125 && mx < 220) continue;
    mullions.push(<Box key={`m${mx}`} x={Math.min(mx, W - 6)} y={D - 2} w={6} d={10} z0={0.05} h={storeH} color={TEAL} />);
  }
  return (
    <group>
      <Box x={0} y={D - 4} w={W} d={12} h={0.06} color="#d7ccc8" />
      <Box x={0} y={D} w={140} d={4} z0={0.05} h={storeH} color="#24343d" opacity={0.42} />
      <Box x={208} y={D} w={140} d={4} z0={0.05} h={storeH} color="#24343d" opacity={0.42} />
      {mullions}
      <Box x={0} y={D - 2} w={W} d={10} z0={storeH + 0.03} h={0.06} color={TEAL_DARK} />
      {/* Dinding depan di atas etalase sampai pelat L2 (hanya tampilan LT.2). */}
      {tall ? <Box x={0} y={D - 6} w={W} d={6} z0={storeH + 0.09} h={FLOOR_H - storeH - 0.09} color="#f4f1ea" /> : null}
      {/* Pintu lipat hijau-teal (ciri ruko KDS) terlipat di kedua sisi pintu kaca */}
      {[124, 132, 208, 216].map((px, i) => (
        <Box key={`f${px}`} x={px} y={D + 2} w={8} d={14} z0={0.05} h={storeH} color={i % 2 ? TEAL_DARK : TEAL} />
      ))}
      <Box x={140} y={D + 2} w={68} d={3} z0={0.05} h={storeH} color="#bfe3df" opacity={0.25} />

      {/* Papan nama: panel ACP navy + huruf timbul akrilik backlit LED */}
      <Box x={0} y={D} w={W} d={14} z0={SZ} h={0.5} color="#f7f7f2" />
      <Box x={8} y={D + 14} w={W - 16} d={5} z0={SZ + 0.04} h={0.42} color={NAVY} />
      {/* Logo KDS + tulisan timbul KodeSolusindo rapat di sebelahnya */}
      <KdsLogoIcon x={34} y={D + 21} z={SZ + 0.25} size={0.36} />
      <EmbossedLabel x={50} y={D + 25} z={SZ + 0.3} text="KodeSolusindo" size={0.2} />
      <Text position={toWorld(51, D + 25).map((v, i) => (i === 1 ? SZ + 0.12 : v)) as [number, number, number]} fontSize={0.045} color="#60a5fa" anchorX="left" anchorY="middle">
        PT KODE DIGITAL SOLUSINDO · SOFTWARE HOUSE
      </Text>
      {/* Produk KDS di sisi kanan papan: AiniChat & kencang.in */}
      <LogoIcon kind="ainichat" x={222} y={D + 21} z={SZ + 0.28} size={0.28} />
      <Label x={222} y={D + 22} z={SZ + 0.09} text="AiniChat" size={0.045} color="#bfdbfe" />
      <LogoIcon kind="kencang" x={268} y={D + 21} z={SZ + 0.28} size={0.28} />
      <Label x={268} y={D + 22} z={SZ + 0.09} text="kencang.in" size={0.045} color="#fbcfe8" />

      {/* Neon box vertikal (blade sign) di sisi kanan fasad */}
      <Box x={W - 10} y={D + 10} w={12} d={66} z0={SZ + 0.55} h={0.95} color={BLUE} emissive={BLUE} />
      <KdsLogoIcon x={W + 4} y={D + 43} z={SZ + 1.22} size={0.42} face="east" />
      <KdsLogoIcon x={W - 12} y={D + 43} z={SZ + 1.22} size={0.42} face="west" />
      <Label x={W + 3} y={D + 43} z={SZ + 0.94} rotY={Math.PI / 2} text="KODE" size={0.09} />
      <Label x={W + 3} y={D + 43} z={SZ + 0.8} rotY={Math.PI / 2} text="SOLUSINDO" size={0.06} />
      <Label x={W - 11} y={D + 43} z={SZ + 0.94} rotY={-Math.PI / 2} text="KODE" size={0.09} />

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
      <Box x={14} y={D + 4} w={44} d={18} z0={SZ + 0.52} h={0.22} color="#f2f2f2" />
      <Box x={270} y={D + 4} w={44} d={18} z0={SZ + 0.52} h={0.22} color="#f2f2f2" />
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
      <Motorbike x={-150} y={yApron + 70} color="#ad1457" />

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

      {/* Halte biru-merah + rambu STOP: di antara KDS dan CV. Dua Bersaudara, lebih banyak di depan CV (HX = sisi kiri halte). */}
      <group>
        <Box x={300} y={yApron + 20} w={160} d={60} z0={1.25} h={0.06} color="#1e5bb8" />
        {/* Halte menghadap jalan: dinding belakang & sandaran bangku di sisi bangunan, list atap merah +
            papan BUS MEBIDANG di sisi jalan. Tiang biru berdiri di depan dinding belakang dan di belakang
            papan bus (tidak menembus keduanya). */}
        <Box x={300} y={yApron + 76} w={160} d={4} z0={1.18} h={0.1} color="#d32f2f" />
        {[304, 450].map((hx) =>
          [yApron + 25, yApron + 68].map((hy) => <Box key={`h${hx}${hy}`} x={hx} y={hy} w={6} d={6} h={1.25} color="#1e5bb8" />),
        )}
        <Box x={300} y={yApron + 19} w={160} d={5} z0={0.1} h={1.08} color="#d32f2f" opacity={0.85} />
        <Box x={320} y={yApron + 28} w={120} d={18} z0={0.28} h={0.05} color="#9e9e9e" />
        <Box x={320} y={yApron + 25} w={120} d={3} z0={0.33} h={0.18} color="#9e9e9e" />
        {/* Papan BUS MEBIDANG di atas list atap sisi jalan, menghadap jalan */}
        <Box x={318} y={yApron + 77} w={124} d={4} z0={1.31} h={0.24} color="#0d3b8c" />
        <Box x={318} y={yApron + 77} w={124} d={4} z0={1.31} h={0.035} color="#d32f2f" />
        <Label x={380} y={yApron + 82} z={1.44} text="BUS MEBIDANG" size={0.11} />
        {/* Rambu halte: tiang di BELAKANG papan (sisi bangunan) agar tulisan STOP/HALTE tidak terpotong tiang */}
        <Pole x={491} y={yApron + 82} h={1.7} r={0.025} color="#2b6cd4" />
        <Box x={475} y={yApron + 85} w={32} d={3} z0={1.48} h={0.24} color="#1e5bb8" />
        <Label x={491} y={yApron + 89} z={1.6} text="STOP" size={0.07} />
        <Box x={475} y={yApron + 85} w={32} d={3} z0={1.3} h={0.14} color="#f2f2f2" />
        <Label x={491} y={yApron + 89} z={1.37} text="HALTE" size={0.05} color={NAVY} />
      </group>

      {/* Pohon peneduh (tiang listrik & kabel dihapus atas permintaan pemilik, 2026-11-12) */}
      <Tree x={-380} y={yApron + 120} scale={1.1} />
      <Tree x={1000} y={yApron + 125} scale={1.2} />
      <Tree x={-900} y={yApron + 125} />
    </group>
  );
}

export const KdsRukoScene = memo(function KdsRukoScene({
  showInterior = true,
}: {
  showInterior?: boolean;
}) {
  // Saat LT.2 (interior L1 disembunyikan) bangunan tampil setinggi satu lantai nyata (3,0 m)
  // dengan Lantai 2 di atasnya. Saat LT.1 semua elemen memakai ukuran cutaway lama (identik).
  const tall = !showInterior;
  return (
    <group position={[KDS_ORIGIN_X * SCALE, 0, KDS_ORIGIN_Y * SCALE]}>
      <Street />
      <L1Shell tall={tall} />
      {showInterior ? <Interior /> : null}
      <Facade tall={tall} />
      {/* Kucing bebas naik-turun tangga; tampil sesuai lantai yang sedang dilihat. */}
      <KdsCats view={tall ? 2 : 1} floorH={FLOOR_H + 0.04} rise={tall ? FLOOR_H / 9 : 0.11} />
      {/* Tata, resepsionis penerima tamu, standby di belakang meja depan menghadap pintu masuk */}
      {showInterior ? <KdsReceptionist x={205} y={1466} name="Tata" /> : null}
      <RukoNeighbor x={-8 - NEIGHBOR_W} baseColor="#f4f3f0" accent="#d81b60" sign="SECRET BEAUTY SALON" shopfront="glass" tall={tall} style="secretBeauty" />
      <RukoNeighbor x={-16 - NEIGHBOR_W * 2} baseColor="#e98c96" accent="#6d4c41" sign="TOKO" shopfront="rolling" terrace="#a99f93" tall={tall} style="pinkArch" />
      <RukoNeighbor x={-24 - NEIGHBOR_W * 3} baseColor="#f3efe7" accent="#455a64" sign="BENGKEL" shopfront="rolling" tall={tall} />
      <RukoNeighbor x={W + 8} baseColor="#e4e6ea" accent="#1f3fbf" sign="CV. DUA BERSAUDARA" shopfront="glass" terrace="#d9d6cf" tall={tall} style="duaBersaudara" />
      <RukoNeighbor x={W + 16 + NEIGHBOR_W} baseColor="#f3f1ec" accent="#ef6c00" sign="RM SUDI MAMPIR" shopfront="rolling" terrace="#cfccc4" tall={tall} style="sudiMampir" />
      <RukoNeighbor x={W + 24 + NEIGHBOR_W * 2} baseColor="#e3f0e6" accent="#2e7d32" sign="APOTEK" shopfront="glass" tall={tall} />
    </group>
  );
});
