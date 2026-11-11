"use client";

import type { ReactNode } from "react";
import { SCALE } from "@/features/retro-office/core/constants";
import { getItemBaseSize, getItemRotationRadians, toWorld } from "@/features/retro-office/core/geometry";
import type { InteractiveFurnitureModelProps } from "@/features/retro-office/objects/types";

// Front desk minimalis: blok putih glossy (lebih tinggi, kiri) mengunci blok kayu oak muda
// (lebih rendah, kanan, menjorok ke depan) dengan vas bunga di atasnya. Bahan: HPL putih glossy +
// HPL motif oak. Muka depan (sisi tamu) menghadap +z / selatan kanvas.
const WHITE = "#f8f8f6";
const OAK = "#d9c09c";
const OAK_GRAIN = "#c8ab84";

export function ReceptionDeskModel({
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

  const whiteW = w * 0.62;
  const whiteH = 0.95;
  const whiteX = -w / 2 + whiteW / 2;
  const whiteD = d * 0.45;
  const whiteZ = d / 2 - whiteD / 2;
  const oakW = w * 0.55;
  const oakH = 0.78;
  const oakD = d * 0.72;
  const oakX = w / 2 - oakW / 2;
  const oakZ = d / 2 - oakD / 2 + 0.1;

  const grain: ReactNode[] = [];
  for (let gx = -oakW / 2 + 0.1; gx < oakW / 2 - 0.05; gx += 0.13) {
    grain.push(
      <mesh key={gx.toFixed(3)} position={[oakX + gx, oakH / 2, oakZ + oakD / 2 + 0.001]}>
        <boxGeometry args={[0.012, oakH * 0.96, 0.002]} />
        <meshStandardMaterial color={OAK_GRAIN} roughness={0.8} />
      </mesh>,
    );
  }
  const flowers: [number, number, number][] = [
    [0, 0.2, 0],
    [0.035, 0.18, 0.01],
    [-0.03, 0.19, -0.01],
    [0.01, 0.22, 0.025],
    [-0.015, 0.215, -0.025],
  ];
  const highlight = isSelected ? "#fbbf24" : isHovered ? "#93c5fd" : null;

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
      {/* Meja kerja petugas di belakang (setinggi meja biasa) */}
      <mesh position={[0, 0.3, -d / 2 + (d - whiteD) / 2]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.04, 0.6, d - whiteD]} />
        <meshStandardMaterial color={WHITE} roughness={0.3} />
      </mesh>

      {/* Blok putih glossy, lebih tinggi */}
      <mesh position={[whiteX, whiteH / 2, whiteZ]} castShadow receiveShadow>
        <boxGeometry args={[whiteW, whiteH, whiteD]} />
        <meshStandardMaterial color={WHITE} roughness={0.12} metalness={0.05} />
      </mesh>
      <mesh position={[whiteX, whiteH + 0.006, whiteZ]}>
        <boxGeometry args={[whiteW + 0.01, 0.012, whiteD + 0.01]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>

      {/* Blok kayu oak, lebih rendah dan menjorok ke depan */}
      <mesh position={[oakX, oakH / 2, oakZ]} castShadow receiveShadow>
        <boxGeometry args={[oakW, oakH, oakD]} />
        <meshStandardMaterial color={OAK} roughness={0.7} />
      </mesh>
      {grain}
      <mesh position={[oakX, oakH + 0.01, oakZ]} castShadow>
        <boxGeometry args={[oakW + 0.01, 0.02, oakD + 0.01]} />
        <meshStandardMaterial color="#e2cba8" roughness={0.55} />
      </mesh>

      {/* Vas kaca + bunga ungu di atas blok kayu */}
      <group position={[oakX + oakW / 2 - 0.3, oakH + 0.02, oakZ + 0.05]}>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.035, 0.03, 0.14, 16]} />
          <meshStandardMaterial color="#c9d6dc" roughness={0.1} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.12, 6]} />
          <meshStandardMaterial color="#3f6f3a" />
        </mesh>
        {flowers.map(([fx, fy, fz], i) => (
          <mesh key={i} position={[fx, fy, fz]}>
            <sphereGeometry args={[0.03, 10, 8]} />
            <meshStandardMaterial color={i % 2 ? "#4c3fa8" : "#5b4bc4"} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {highlight ? (
        <mesh position={[0, whiteH + 0.04, 0]}>
          <boxGeometry args={[w + 0.08, 0.01, d + 0.2]} />
          <meshBasicMaterial color={highlight} transparent opacity={0.35} />
        </mesh>
      ) : null}
    </group>
  );
}
