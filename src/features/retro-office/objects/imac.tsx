"use client";

import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { getItemRotationRadians, toWorld } from "@/features/retro-office/core/geometry";
import type { InteractiveFurnitureModelProps } from "@/features/retro-office/objects/types";

// Warna resmi iMac 24" (dagu/punggung, layar belakang lebih tua). item.color memilih varian.
const IMAC_VARIANTS: Record<string, { chin: string; back: string; wallpaper: [string, string] }> = {
  blue: { chin: "#7fb0e8", back: "#2f6fc0", wallpaper: ["#1d4ed8", "#38bdf8"] },
  green: { chin: "#8fd0a6", back: "#3f8f5f", wallpaper: ["#15803d", "#5eead4"] },
  purple: { chin: "#b9a3e3", back: "#6f55b5", wallpaper: ["#6d28d9", "#f0abfc"] },
  orange: { chin: "#f6b38a", back: "#e0703a", wallpaper: ["#ea580c", "#fde68a"] },
  pink: { chin: "#f2b3bb", back: "#d9667a", wallpaper: ["#db2777", "#fbcfe8"] },
  yellow: { chin: "#f7dc8a", back: "#e2b32c", wallpaper: ["#ca8a04", "#fef08a"] },
  silver: { chin: "#dfe2e7", back: "#b8bcc4", wallpaper: ["#334155", "#93c5fd"] },
};

const DESK_TOP = 0.61;

// Lencana bulat hitam dengan simbol </> putih (bentuk sama dengan logo KDS) di punggung iMac.
let badgeTexture: THREE.CanvasTexture | null = null;
function getBadgeTexture() {
  if (badgeTexture || typeof document === "undefined") return badgeTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  ctx.fill();
  const k = size / 64;
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
  stroke([[40, 20], [51, 32], [40, 44]], 5, 0.85);
  stroke([[36, 17], [28, 47]], 4.5, 1);
  badgeTexture = new THREE.CanvasTexture(canvas);
  badgeTexture.colorSpace = THREE.SRGBColorSpace;
  badgeTexture.anisotropy = 4;
  return badgeTexture;
}

// iMac 24": panel tipis, bingkai putih, dagu berwarna, kaki aluminium + Magic Keyboard & Mouse.
export function ImacModel({
  item,
  isSelected,
  isHovered,
  editMode,
  onPointerDown,
  onPointerOver,
  onPointerOut,
  onClick,
}: InteractiveFurnitureModelProps) {
  const variant = IMAC_VARIANTS[item.color ?? "silver"] ?? IMAC_VARIANTS.silver;
  const [wx, , wz] = toWorld(item.x + 15, item.y + 10);
  const rotY = getItemRotationRadians(item);
  const panelW = 0.5;
  const screenH = 0.3;
  const chinH = 0.07;
  const panelH = screenH + chinH;
  const panelD = 0.016;
  const standH = 0.11;
  const panelY = standH + panelH / 2;
  const highlight = isSelected ? "#fbbf24" : isHovered ? "#93c5fd" : null;
  const badge = getBadgeTexture();

  return (
    <group
      position={[wx, DESK_TOP + (item.elevation ?? 0), wz]}
      rotation={[0, rotY, 0]}
      onPointerDown={(event) => {
        if (!editMode) return;
        event.stopPropagation();
        onPointerDown(item._uid);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        onPointerOver(item._uid);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        onPointerOut();
      }}
      onClick={(event) => {
        if (editMode) return;
        event.stopPropagation();
        onClick?.(item._uid);
      }}
    >
      {/* Kaki aluminium: alas datar + tiang miring */}
      <mesh position={[0, 0.006, -0.02]} castShadow>
        <boxGeometry args={[0.15, 0.012, 0.13]} />
        <meshStandardMaterial color={variant.back} roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, standH / 2 + 0.01, -0.04]} rotation={[0.18, 0, 0]} castShadow>
        <boxGeometry args={[0.15, standH, 0.012]} />
        <meshStandardMaterial color={variant.back} roughness={0.35} metalness={0.5} />
      </mesh>

      {/* Panel: punggung berwarna */}
      <RoundedBox args={[panelW, panelH, panelD]} radius={0.012} smoothness={3} position={[0, panelY, 0]} castShadow>
        <meshStandardMaterial color={variant.back} roughness={0.4} metalness={0.25} />
      </RoundedBox>
      {/* Punggung: lencana bulat hitam </> */}
      {badge ? (
        <mesh position={[0, panelY + 0.03, -panelD / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.065, 32]} />
          <meshBasicMaterial map={badge} transparent toneMapped={false} />
        </mesh>
      ) : null}
      {/* Muka depan: dagu berwarna + bingkai putih + layar menyala */}
      <mesh position={[0, standH + chinH / 2, panelD / 2 + 0.0015]}>
        <planeGeometry args={[panelW, chinH]} />
        <meshStandardMaterial color={variant.chin} roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh position={[0, standH + chinH + screenH / 2, panelD / 2 + 0.0015]}>
        <planeGeometry args={[panelW, screenH]} />
        <meshStandardMaterial color="#f5f5f7" roughness={0.6} />
      </mesh>
      <mesh position={[0, standH + chinH + screenH / 2, panelD / 2 + 0.003]}>
        <planeGeometry args={[panelW - 0.03, screenH - 0.03]} />
        <meshStandardMaterial
          color={variant.wallpaper[0]}
          emissive={variant.wallpaper[1]}
          emissiveIntensity={0.55}
          roughness={0.3}
        />
      </mesh>
      {highlight ? (
        <mesh position={[0, panelY, panelD / 2 + 0.004]}>
          <planeGeometry args={[panelW + 0.03, panelH + 0.03]} />
          <meshBasicMaterial color={highlight} transparent opacity={0.25} />
        </mesh>
      ) : null}

      {/* Magic Keyboard & Magic Mouse putih di depan layar */}
      <mesh position={[-0.03, 0.006, 0.2]} castShadow>
        <boxGeometry args={[0.28, 0.008, 0.1]} />
        <meshStandardMaterial color="#f2f2f4" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[-0.03, 0.0115, 0.2]}>
        <boxGeometry args={[0.26, 0.003, 0.085]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      <mesh position={[0.18, 0.009, 0.2]} scale={[1, 0.35, 1.6]} castShadow>
        <sphereGeometry args={[0.028, 16, 10]} />
        <meshStandardMaterial color="#f7f7f8" roughness={0.35} />
      </mesh>
    </group>
  );
}
