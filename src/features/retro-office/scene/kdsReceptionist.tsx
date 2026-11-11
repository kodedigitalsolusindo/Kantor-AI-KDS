"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import type * as THREE from "three";
import { AGENT_SCALE } from "@/features/retro-office/core/constants";
import { toWorld } from "@/features/retro-office/core/geometry";

// Resepsionis penerima tamu KDS (NPC, bukan agen): berdiri standby di belakang meja depan,
// menghadap pintu masuk. Gaya sekretaris kantor: rambut hitam disanggul, blazer navy pas badan,
// blus putih, rok pensil hitam selutut, sepatu hak hitam, headset, name tag KDS.
// Proporsi mengikuti karakter agen (lihat objects/agents.tsx) supaya serasi.
const SKIN = "#f7dccb";
const SKIN_SHADE = "#efc9b4";
const HAIR = "#1c1412";
const BLAZER = "#14213d";
const BLOUSE = "#fbfbf9";
const SKIRT = "#111214";
const HEELS = "#0b0b0c";
const LIPS = "#c2374f";
const GOLD = "#d4af37";

function B({
  p,
  s,
  c,
  basic,
}: {
  p: [number, number, number];
  s: [number, number, number];
  c: string;
  basic?: boolean;
}) {
  return (
    <mesh position={p}>
      <boxGeometry args={s} />
      {basic ? <meshBasicMaterial color={c} /> : <meshLambertMaterial color={c} />}
    </mesh>
  );
}

export function KdsReceptionist({
  x,
  y,
  facing = 0,
  name = "Tata",
}: {
  x: number;
  y: number;
  facing?: number;
  name?: string;
}) {
  const [wx, , wz] = toWorld(x, y);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const waveArmRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Siklus 12 detik: diam/bernapas, menoleh pelan, lalu menyapa (membungkuk sedikit + melambai).
    const cycle = t % 12;
    const greet = cycle > 9 ? Math.sin(((cycle - 9) / 3) * Math.PI) : 0;
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 1.6) * 0.008;
      bodyRef.current.rotation.x = greet * 0.12;
    }
    if (headRef.current) {
      headRef.current.rotation.y = cycle < 9 ? Math.sin(t * 0.45) * 0.35 : 0;
      headRef.current.rotation.z = Math.sin(t * 0.9) * 0.03;
    }
    if (waveArmRef.current) {
      waveArmRef.current.rotation.z = greet > 0 ? -2.3 * Math.min(1, greet * 1.6) : -0.12;
      waveArmRef.current.rotation.x = greet > 0 ? Math.sin(t * 9) * 0.25 * greet : 0.35;
    }
  });

  return (
    <group position={[wx, 0, wz]} rotation={[0, (facing * Math.PI) / 180, 0]} scale={AGENT_SCALE}>
      {/* Label nama melayang seperti staf lain */}
      <Billboard position={[0, 0.8, 0]}>
        <mesh position={[0, -0.01, -0.002]}>
          <planeGeometry args={[0.44, 0.17]} />
          <meshBasicMaterial color="#0b1220" transparent opacity={0.88} />
        </mesh>
        <mesh position={[-0.21, -0.01, -0.001]}>
          <planeGeometry args={[0.02, 0.17]} />
          <meshBasicMaterial color="#16a596" />
        </mesh>
        <mesh position={[0.17, 0.025, -0.001]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        <Text position={[-0.01, 0.025, 0]} fontSize={0.085} color="#ffffff" anchorX="center" anchorY="middle">
          {name}
        </Text>
        <Text position={[0, -0.055, 0]} fontSize={0.036} color="#93c5fd" anchorX="center" anchorY="middle">
          Receptionist
        </Text>
      </Billboard>
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.11, 12]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>

      {/* Kaki jenjang + sepatu hak */}
      {[-0.035, 0.035].map((lx) => (
        <group key={lx} position={[lx, 0, 0]}>
          <B p={[0, 0.1, 0]} s={[0.048, 0.15, 0.052]} c={SKIN} />
          <B p={[0, 0.018, 0.018]} s={[0.05, 0.026, 0.08]} c={HEELS} />
          <B p={[0, 0.03, -0.02]} s={[0.016, 0.05, 0.016]} c={HEELS} />
        </group>
      ))}

      <group ref={bodyRef} position={[0, 0.17, 0]}>
        {/* Rok pensil selutut + belahan kecil di belakang */}
        <B p={[0, 0.045, 0]} s={[0.15, 0.11, 0.095]} c={SKIRT} />
        <B p={[0, 0.01, -0.048]} s={[0.012, 0.04, 0.004]} c="#2a2b2f" />
        {/* Pinggang ramping + ikat pinggang tipis */}
        <B p={[0, 0.105, 0]} s={[0.135, 0.02, 0.085]} c="#1f1f22" />
        <B p={[0, 0.105, 0.044]} s={[0.022, 0.014, 0.004]} c={GOLD} />
        {/* Blus putih + blazer navy pas badan (kerah V terbuka) */}
        <B p={[0, 0.18, 0]} s={[0.155, 0.13, 0.088]} c={BLOUSE} />
        <B p={[-0.052, 0.18, 0.002]} s={[0.054, 0.13, 0.09]} c={BLAZER} />
        <B p={[0.052, 0.18, 0.002]} s={[0.054, 0.13, 0.09]} c={BLAZER} />
        <B p={[0, 0.18, -0.003]} s={[0.158, 0.13, 0.084]} c={BLAZER} />
        <B p={[0, 0.2, 0.0445]} s={[0.05, 0.09, 0.003]} c={BLOUSE} />
        <B p={[0, 0.235, 0.046]} s={[0.026, 0.02, 0.003]} c={SKIN} />
        {/* Kancing blazer + name tag KDS */}
        <B p={[0.03, 0.14, 0.047]} s={[0.008, 0.008, 0.004]} c={GOLD} />
        <B p={[-0.05, 0.205, 0.0475]} s={[0.034, 0.014, 0.003]} c={GOLD} />
        <Text
          position={[-0.05, 0.205, 0.0495]}
          fontSize={0.009}
          color="#0b1f3a"
          anchorX="center"
          anchorY="middle"
        >
          {name.toUpperCase()}
        </Text>

        {/* Lengan kiri: tangan bertumpu sopan di depan */}
        <group position={[-0.095, 0.235, 0]} rotation={[0.35, 0, 0.12]}>
          <B p={[0, -0.065, 0]} s={[0.045, 0.13, 0.05]} c={BLAZER} />
          <B p={[0, -0.135, 0]} s={[0.036, 0.03, 0.036]} c={BLOUSE} />
          <B p={[0, -0.16, 0]} s={[0.034, 0.034, 0.034]} c={SKIN} />
        </group>
        {/* Lengan kanan: ikut menyapa/melambai */}
        <group ref={waveArmRef} position={[0.095, 0.235, 0]}>
          <B p={[0, -0.065, 0]} s={[0.045, 0.13, 0.05]} c={BLAZER} />
          <B p={[0, -0.135, 0]} s={[0.036, 0.03, 0.036]} c={BLOUSE} />
          <B p={[0, -0.16, 0]} s={[0.034, 0.034, 0.034]} c={SKIN} />
        </group>

        {/* Leher + kalung tipis */}
        <B p={[0, 0.26, 0]} s={[0.05, 0.04, 0.05]} c={SKIN} />
        <B p={[0, 0.25, 0.026]} s={[0.04, 0.004, 0.003]} c={GOLD} />

        <group ref={headRef} position={[0, 0.34, 0]}>
          {/* Wajah */}
          <B p={[0, 0, 0]} s={[0.145, 0.15, 0.13]} c={SKIN} />
          <B p={[0, -0.06, 0.02]} s={[0.12, 0.03, 0.1]} c={SKIN_SHADE} />
          {/* Rambut hitam: poni samping, penutup kepala, sanggul */}
          <B p={[0, 0.072, -0.005]} s={[0.155, 0.04, 0.145]} c={HAIR} />
          <B p={[-0.03, 0.055, 0.066]} s={[0.09, 0.03, 0.01]} c={HAIR} />
          <B p={[0, 0.01, -0.068]} s={[0.155, 0.13, 0.02]} c={HAIR} />
          <B p={[-0.075, 0.02, -0.01]} s={[0.012, 0.1, 0.12]} c={HAIR} />
          <B p={[0.075, 0.02, -0.01]} s={[0.012, 0.1, 0.12]} c={HAIR} />
          <mesh position={[0, 0.06, -0.1]}>
            <sphereGeometry args={[0.042, 12, 10]} />
            <meshLambertMaterial color={HAIR} />
          </mesh>
          {/* Alis tipis, mata dengan bulu mata, pipi merona, bibir merah */}
          <B p={[-0.036, 0.035, 0.066]} s={[0.034, 0.006, 0.004]} c="#2a1a14" basic />
          <B p={[0.036, 0.035, 0.066]} s={[0.034, 0.006, 0.004]} c="#2a1a14" basic />
          <B p={[-0.036, 0.008, 0.066]} s={[0.026, 0.024, 0.004]} c="#1a1a2e" basic />
          <B p={[0.036, 0.008, 0.066]} s={[0.026, 0.024, 0.004]} c="#1a1a2e" basic />
          <B p={[-0.036, 0.022, 0.067]} s={[0.032, 0.005, 0.004]} c="#000000" basic />
          <B p={[0.036, 0.022, 0.067]} s={[0.032, 0.005, 0.004]} c="#000000" basic />
          <B p={[-0.028, 0.014, 0.068]} s={[0.007, 0.007, 0.003]} c="#ffffff" basic />
          <B p={[0.044, 0.014, 0.068]} s={[0.007, 0.007, 0.003]} c="#ffffff" basic />
          <B p={[-0.055, -0.02, 0.066]} s={[0.022, 0.012, 0.003]} c="#f2a7a7" basic />
          <B p={[0.055, -0.02, 0.066]} s={[0.022, 0.012, 0.003]} c="#f2a7a7" basic />
          <B p={[0, -0.04, 0.066]} s={[0.032, 0.011, 0.004]} c={LIPS} basic />
          {/* Anting mutiara */}
          <mesh position={[-0.075, -0.03, 0.01]}>
            <sphereGeometry args={[0.008, 8, 6]} />
            <meshLambertMaterial color="#f5f5f0" />
          </mesh>
          <mesh position={[0.075, -0.03, 0.01]}>
            <sphereGeometry args={[0.008, 8, 6]} />
            <meshLambertMaterial color="#f5f5f0" />
          </mesh>
          {/* Headset resepsionis satu sisi + mic */}
          <mesh position={[0, 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.083, 0.006, 8, 24, Math.PI]} />
            <meshLambertMaterial color="#2b2f36" />
          </mesh>
          <B p={[0.084, 0.0, 0.0]} s={[0.016, 0.04, 0.026]} c="#2b2f36" />
          <mesh position={[0.07, -0.04, 0.05]} rotation={[0.3, 0.6, -0.5]}>
            <boxGeometry args={[0.006, 0.006, 0.075]} />
            <meshLambertMaterial color="#2b2f36" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
