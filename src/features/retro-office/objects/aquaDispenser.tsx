"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Dispenser air + galon 19 L bermerek AQUA (permintaan pemilik, mengacu foto galon AQUA):
// badan dispenser putih dengan kran panas (merah) & dingin (biru), tatakan tetes, galon biru bening
// terbalik dengan cincin pegangan dan label biru "AQUA" bergambar gunung hijau.
// Satuan dunia; titik asal = tengah alas di lantai; muka depan menghadap +z.
// Tinggi total ±0,87 satuan dunia (±1,4 m dalam skala karakter), lebih tinggi dari versi lama.

function useAquaLabelTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const w = 256;
    const h = 220;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0b4fb3");
    g.addColorStop(1, "#1d7fe0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    // Gunung hijau + kabut putih
    ctx.fillStyle = "#1f9d55";
    ctx.beginPath();
    ctx.moveTo(20, 175);
    ctx.lineTo(85, 120);
    ctx.lineTo(120, 150);
    ctx.lineTo(170, 105);
    ctx.lineTo(236, 175);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(20, 168, 216, 10);
    // Tulisan AQUA putih tebal bergaris tepi biru tua
    ctx.font = "bold 78px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#0a3d8f";
    ctx.strokeText("AQUA", w / 2, 72);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("AQUA", w / 2, 72);
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText("19 L", 18, 200);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);
}

export function AquaDispenser({ scale = 1 }: { scale?: number }) {
  const label = useAquaLabelTexture();
  const bodyW = 0.26;
  const bodyH = 0.55;
  const bottleR = 0.125;
  const bottleH = 0.3;
  const bottleY = bodyH + 0.05 + bottleH / 2;
  return (
    <group scale={scale}>
      {/* Badan dispenser */}
      <mesh position={[0, bodyH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[bodyW, bodyH, bodyW]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
      {/* Panel depan abu-abu gelap + tatakan tetes */}
      <mesh position={[0, bodyH * 0.62, bodyW / 2 + 0.002]}>
        <boxGeometry args={[bodyW * 0.7, bodyH * 0.38, 0.006]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[0, bodyH * 0.38, bodyW / 2 + 0.03]}>
        <boxGeometry args={[bodyW * 0.62, 0.02, 0.06]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {/* Kran panas (merah) & dingin (biru) */}
      <mesh position={[-0.05, bodyH * 0.6, bodyW / 2 + 0.02]}>
        <boxGeometry args={[0.035, 0.035, 0.04]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} />
      </mesh>
      <mesh position={[0.05, bodyH * 0.6, bodyW / 2 + 0.02]}>
        <boxGeometry args={[0.035, 0.035, 0.04]} />
        <meshStandardMaterial color="#2563eb" roughness={0.4} />
      </mesh>
      {/* Lampu indikator */}
      <mesh position={[0, bodyH * 0.8, bodyW / 2 + 0.006]}>
        <boxGeometry args={[0.05, 0.012, 0.004]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>
      {/* Dudukan galon */}
      <mesh position={[0, bodyH + 0.02, 0]}>
        <cylinderGeometry args={[bottleR * 0.7, bottleR * 0.75, 0.04, 20]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      {/* Galon AQUA terbalik: leher + badan biru bening + cincin pegangan */}
      <mesh position={[0, bodyH + 0.055, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.05, 16]} />
        <meshStandardMaterial color="#1e40af" roughness={0.4} />
      </mesh>
      <mesh position={[0, bottleY, 0]} castShadow>
        <cylinderGeometry args={[bottleR, bottleR, bottleH, 28]} />
        <meshPhysicalMaterial color="#bfe3ff" roughness={0.15} transmission={0.4} transparent opacity={0.78} />
      </mesh>
      <mesh position={[0, bottleY + bottleH / 2, 0]}>
        <sphereGeometry args={[bottleR, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#cfeaff" roughness={0.15} transparent opacity={0.8} />
      </mesh>
      {[-0.08, 0, 0.08].map((dy) => (
        <mesh key={dy} position={[0, bottleY + dy, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[bottleR + 0.004, 0.008, 8, 28]} />
          <meshStandardMaterial color="#a5d3fb" roughness={0.2} />
        </mesh>
      ))}
      {/* Label AQUA di muka depan galon */}
      {label ? (
        <mesh position={[0, bottleY + 0.02, bottleR + 0.004]}>
          <planeGeometry args={[0.15, 0.13]} />
          <meshBasicMaterial map={label} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}
