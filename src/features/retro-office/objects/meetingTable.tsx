"use client";

import { SCALE } from "@/features/retro-office/core/constants";
import { getItemBaseSize, getItemRotationRadians, toWorld } from "@/features/retro-office/core/geometry";
import type { InteractiveFurnitureModelProps } from "@/features/retro-office/objects/types";

// Meja meeting persegi panjang (HPL walnut, kaki panel besi hitam) untuk 10 orang.
// Sumbu panjang mengikuti tinggi item (canvas y). Di tengah ada cable box + conference phone.
const WALNUT = "#6b4a33";
const WALNUT_EDGE = "#4e3424";
const STEEL = "#1f2328";

export function MeetingTableModel({
  item,
  isSelected,
  isHovered,
  editMode,
  onPointerDown,
  onPointerOver,
  onPointerOut,
}: InteractiveFurnitureModelProps) {
  const { width, height } = getItemBaseSize(item);
  const w = width * SCALE;
  const d = height * SCALE;
  const [wx, , wz] = toWorld(item.x + width / 2, item.y + height / 2);
  const rotY = getItemRotationRadians(item);
  const topY = 0.5;
  const top = 0.035;
  const highlight = isSelected ? "#fbbf24" : isHovered && editMode ? "#93c5fd" : null;

  return (
    <group
      position={[wx, 0, wz]}
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
    >
      {/* Daun meja + list tepi */}
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, top, d]} />
        <meshStandardMaterial color={WALNUT} roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh position={[0, topY - top / 2 - 0.006, 0]}>
        <boxGeometry args={[w - 0.02, 0.012, d - 0.02]} />
        <meshStandardMaterial color={WALNUT_EDGE} roughness={0.6} />
      </mesh>

      {/* Kaki panel besi di kedua ujung + balok penghubung */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, (topY - top / 2) / 2, side * (d / 2 - 0.12)]} castShadow>
          <boxGeometry args={[w * 0.82, topY - top / 2, 0.04]} />
          <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, topY * 0.55, 0]}>
        <boxGeometry args={[0.05, 0.05, d - 0.3]} />
        <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Cable box (stop kontak + HDMI) dan conference phone di tengah meja */}
      <mesh position={[0, topY + top / 2 + 0.008, -d * 0.12]}>
        <boxGeometry args={[0.16, 0.016, 0.34]} />
        <meshStandardMaterial color="#2b2f36" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, topY + top / 2 + 0.012, d * 0.12]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.024, 3]} />
        <meshStandardMaterial color="#111317" roughness={0.35} />
      </mesh>

      {highlight ? (
        <mesh position={[0, topY + 0.04, 0]}>
          <boxGeometry args={[w + 0.08, 0.01, d + 0.08]} />
          <meshBasicMaterial color={highlight} transparent opacity={0.35} />
        </mesh>
      ) : null}
    </group>
  );
}
