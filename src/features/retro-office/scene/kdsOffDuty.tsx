"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import type * as THREE from "three";
import { AGENT_SCALE } from "@/features/retro-office/core/constants";
import { toWorld } from "@/features/retro-office/core/geometry";
import { KAMAR_STARTS, KAMAR_X0, SLAB_TOP, Z_PER_M } from "@/features/retro-office/scene/kdsKamarLayout";

// Staf KDS yang sedang tidak bekerja di Lantai 2 (NPC dekoratif, bukan agen OpenClaw):
// tidur di kamar, masak & cuci piring di pantry, makan di meja makan, nonton TV & main HP di lounge.
// Gaya & proporsi mengikuti resepsionis/agen (blok sederhana, AGENT_SCALE) agar serasi dengan Lantai 1.
// Koordinat lokal ruko (sama dengan kdsLantai2.tsx); komponen dirender di dalam grup Lantai 2.

const m = (v: number) => v * Z_PER_M;
const S = AGENT_SCALE;
const SKIN = "#f2d2bd";

type Pose = "lie" | "stand" | "sit" | "recline";
type Action = "sleep" | "stir" | "wash" | "eat" | "watch" | "phone";

type Look = { shirt: string; pants: string; hair: string; skin?: string };

function B({ p, s, c, basic }: { p: [number, number, number]; s: [number, number, number]; c: string; basic?: boolean }) {
  return (
    <mesh position={p}>
      <boxGeometry args={s} />
      {basic ? <meshBasicMaterial color={c} /> : <meshLambertMaterial color={c} />}
    </mesh>
  );
}

function StatusLabel({ name, status, y }: { name: string; status: string; y: number }) {
  return (
    <Billboard position={[0, y, 0]}>
      <mesh position={[0, -0.01, -0.002]}>
        <planeGeometry args={[0.42, 0.16]} />
        <meshBasicMaterial color="#0b1220" transparent opacity={0.85} />
      </mesh>
      <mesh position={[-0.2, -0.01, -0.001]}>
        <planeGeometry args={[0.02, 0.16]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      <Text position={[0, 0.025, 0]} fontSize={0.075} color="#ffffff" anchorX="center" anchorY="middle">
        {name}
      </Text>
      <Text position={[0, -0.05, 0]} fontSize={0.04} color="#fcd34d" anchorX="center" anchorY="middle">
        {status}
      </Text>
    </Billboard>
  );
}

// Badan dasar (satuan model, sebelum AGENT_SCALE). Kaki bawah menyesuaikan pose duduk.
function Body({
  look,
  pose,
  seatH,
  armR,
  armL,
  head,
}: {
  look: Look;
  pose: Pose;
  seatH: number;
  armR: RefObject<THREE.Group | null>;
  armL: RefObject<THREE.Group | null>;
  head: RefObject<THREE.Group | null>;
}) {
  const skin = look.skin ?? SKIN;
  const sitting = pose === "sit" || pose === "recline";
  const hip = sitting ? seatH : 0.17;
  return (
    <group>
      {/* Kaki */}
      {[-0.035, 0.035].map((lx) =>
        sitting ? (
          <group key={lx}>
            <B p={[lx, hip + 0.025, 0.07]} s={[0.05, 0.05, 0.15]} c={look.pants} />
            <B p={[lx, hip / 2, 0.135]} s={[0.048, Math.max(0.02, hip), 0.05]} c={look.pants} />
            <B p={[lx, 0.012, 0.15]} s={[0.05, 0.024, 0.08]} c="#2b2b2b" />
          </group>
        ) : (
          <group key={lx}>
            <B p={[lx, 0.095, 0]} s={[0.05, 0.17, 0.055]} c={look.pants} />
            <B p={[lx, 0.012, 0.018]} s={[0.052, 0.024, 0.08]} c="#2b2b2b" />
          </group>
        ),
      )}
      <group position={[0, hip, 0]} rotation={[pose === "recline" ? -0.45 : 0, 0, 0]}>
        {/* Pinggul + badan (kaos) */}
        <B p={[0, 0.03, 0]} s={[0.15, 0.06, 0.09]} c={look.pants} />
        <B p={[0, 0.13, 0]} s={[0.155, 0.15, 0.09]} c={look.shirt} />
        {/* Lengan */}
        <group ref={armL} position={[-0.098, 0.195, 0]}>
          <B p={[0, -0.065, 0]} s={[0.045, 0.13, 0.05]} c={look.shirt} />
          <B p={[0, -0.145, 0]} s={[0.036, 0.036, 0.036]} c={skin} />
        </group>
        <group ref={armR} position={[0.098, 0.195, 0]}>
          <B p={[0, -0.065, 0]} s={[0.045, 0.13, 0.05]} c={look.shirt} />
          <B p={[0, -0.145, 0]} s={[0.036, 0.036, 0.036]} c={skin} />
        </group>
        {/* Leher + kepala */}
        <B p={[0, 0.22, 0]} s={[0.05, 0.04, 0.05]} c={skin} />
        <group ref={head} position={[0, 0.3, 0]}>
          <B p={[0, 0, 0]} s={[0.145, 0.15, 0.13]} c={skin} />
          <B p={[0, 0.07, -0.005]} s={[0.155, 0.04, 0.145]} c={look.hair} />
          <B p={[0, 0.01, -0.068]} s={[0.155, 0.12, 0.02]} c={look.hair} />
          <B p={[-0.036, 0.008, 0.066]} s={[0.024, 0.022, 0.004]} c="#1a1a2e" basic />
          <B p={[0.036, 0.008, 0.066]} s={[0.024, 0.022, 0.004]} c="#1a1a2e" basic />
          <B p={[0, -0.04, 0.066]} s={[0.03, 0.008, 0.004]} c="#a8584b" basic />
        </group>
      </group>
    </group>
  );
}

function OffDutyPerson({
  x,
  y,
  z,
  facing,
  pose,
  action,
  look,
  name,
  status,
  seatWorld = 0,
  phase = 0,
}: {
  x: number;
  y: number;
  z: number;
  facing: number; // derajat: 0 = menghadap jalan (+y), 90 = timur (+x), 180 = utara, 270 = barat
  pose: Pose;
  action: Action;
  look: Look;
  name: string;
  status: string;
  seatWorld?: number; // tinggi dudukan di atas lantai (satuan dunia)
  phase?: number;
}) {
  const [wx, , wz] = toWorld(x, y);
  const armR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const zzz = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;
    if (body.current) body.current.scale.y = 1 + Math.sin(t * (action === "sleep" ? 0.9 : 1.6)) * 0.01;
    const r = armR.current;
    const l = armL.current;
    const h = head.current;
    if (action === "stir" && r) {
      r.rotation.x = -1.1 + Math.sin(t * 3) * 0.15;
      r.rotation.z = Math.cos(t * 3) * 0.2;
    }
    if (action === "wash" && r && l) {
      r.rotation.x = -0.9 + Math.sin(t * 5) * 0.12;
      l.rotation.x = -0.9 + Math.cos(t * 5) * 0.12;
    }
    if (action === "eat" && r && l && h) {
      const bite = Math.max(0, Math.sin(t * 1.2));
      r.rotation.x = -0.6 - bite * 0.9;
      l.rotation.x = -0.7;
      h.rotation.x = 0.1 + bite * 0.12;
    }
    if (action === "watch" && r && l && h) {
      r.rotation.x = -0.2;
      l.rotation.z = 0.5;
      h.rotation.y = Math.sin(t * 0.3) * 0.15;
    }
    if (action === "phone" && r && l && h) {
      r.rotation.x = -1.2;
      l.rotation.x = -1.2;
      h.rotation.x = 0.35;
    }
    if (zzz.current) {
      const k = (t * 0.4) % 1;
      zzz.current.position.y = 0.55 + k * 0.25;
      zzz.current.children.forEach((c) => {
        const mesh = c as THREE.Mesh & { material?: { opacity?: number } };
        if (mesh.material && "opacity" in mesh.material) mesh.material.opacity = 1 - k;
      });
    }
  });

  const seatModel = seatWorld / S;
  const lying = pose === "lie";
  return (
    <group position={[wx, SLAB_TOP + z, wz]} rotation={[0, (facing * Math.PI) / 180, 0]}>
      <group scale={S}>
        {lying ? (
          // Telentang: kepala ke arah -x lokal grup (diatur lewat facing), muka menghadap atas.
          <group rotation={[0, Math.PI / 2, 0]}>
            <group ref={body} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0.3]}>
              <Body look={look} pose="stand" seatH={0} armR={armR} armL={armL} head={head} />
            </group>
          </group>
        ) : (
          <group ref={body}>
            <Body look={look} pose={pose} seatH={seatModel} armR={armR} armL={armL} head={head} />
          </group>
        )}
        {action === "phone" ? (
          <mesh position={[0, seatModel + 0.22, 0.12]} rotation={[-0.6, 0, 0]}>
            <boxGeometry args={[0.05, 0.08, 0.008]} />
            <meshStandardMaterial color="#111827" emissive="#60a5fa" emissiveIntensity={0.6} />
          </mesh>
        ) : null}
        {action === "sleep" ? (
          <group ref={zzz} position={[0, 0.55, 0.2]}>
            <Billboard>
              <Text fontSize={0.09} color="#e0f2fe" anchorX="center" anchorY="middle" fillOpacity={0.9}>
                z Z z
              </Text>
            </Billboard>
          </group>
        ) : null}
        <StatusLabel name={name} status={status} y={lying ? 0.45 : pose === "stand" ? 0.75 : seatModel + 0.62} />
      </group>
    </group>
  );
}

// Uap tipis dari panci di kompor.
function Steam({ x, y, z }: { x: number; y: number; z: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const [wx, , wz] = toWorld(x, y);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const k = (t * 0.5 + i / 3) % 1;
      mesh.position.y = k * 0.25;
      mesh.scale.setScalar(0.6 + k);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.45 * (1 - k);
    });
  });
  return (
    <group position={[wx, SLAB_TOP + z, wz]}>
      {/* Panci */}
      <mesh position={[0, 0.025, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.05, 16]} />
        <meshStandardMaterial color="#9aa5b1" metalness={0.4} roughness={0.4} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Plate({ x, y, z }: { x: number; y: number; z: number }) {
  const [wx, , wz] = toWorld(x, y);
  return (
    <group position={[wx, SLAB_TOP + z, wz]}>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.012, 16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0.018, 0]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color="#f5f0e1" />
      </mesh>
      <mesh position={[0.03, 0.016, 0.02]}>
        <boxGeometry args={[0.04, 0.012, 0.03]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
    </group>
  );
}

// Ketinggian perabot Lantai 2 (sama dengan kdsKamarLayout / kdsMakanLayout / kdsLoungeLayout).
const BED_LOW_TOP = m(0.3) + 0.03 + m(0.18);
const BED_HIGH_TOP = m(1.15) + 0.03 + m(0.18);
const CHAIR_SEAT = m(0.45) + 0.02;
const TABLE_TOP = m(0.75) + 0.02;
const COUNTER_TOP = m(0.9) + 0.019;
const SOFA_SEAT = m(0.42);
const BEANBAG_TOP = m(0.5);
const BED_X = KAMAR_X0 + 102; // sisi barat bunk bed
const BED_Y = 8 + 29; // tengah lebar kasur, relatif awal kamar

export function KdsOffDutyStaff() {
  return (
    <group>
      {/* Tidur: Kamar 1 kasur bawah, Kamar 3 kasur atas (kepala ke barat, berselimut) */}
      <OffDutyPerson x={BED_X + 64} y={KAMAR_STARTS[0] + BED_Y} z={BED_LOW_TOP} facing={0} pose="lie" action="sleep"
        look={{ shirt: "#2563eb", pants: "#1f2937", hair: "#1c1412" }} name="Andi" status="Tidur" phase={0.4} />
      <OffDutyPerson x={BED_X + 64} y={KAMAR_STARTS[2] + BED_Y} z={BED_HIGH_TOP} facing={0} pose="lie" action="sleep"
        look={{ shirt: "#16a34a", pants: "#374151", hair: "#2a1a10" }} name="Budi" status="Tidur" phase={2.1} />

      {/* Pantry: masak di kompor & cuci piring di sink (menghadap timur ke kitchen set) */}
      <OffDutyPerson x={298} y={1187} z={0} facing={90} pose="stand" action="stir"
        look={{ shirt: "#f97316", pants: "#334155", hair: "#111111" }} name="Sari" status="Masak" phase={1.2} />
      <Steam x={326} y={1190} z={COUNTER_TOP} />
      <OffDutyPerson x={298} y={1098} z={0} facing={90} pose="stand" action="wash"
        look={{ shirt: "#db2777", pants: "#1e293b", hair: "#3b2416" }} name="Dewi" status="Cuci piring" phase={0.7} />

      {/* Makan di meja makan (kursi utara menghadap selatan, kursi selatan menghadap utara) */}
      <OffDutyPerson x={136} y={1133} z={0} facing={0} pose="sit" action="eat" seatWorld={CHAIR_SEAT}
        look={{ shirt: "#0891b2", pants: "#1f2937", hair: "#151515" }} name="Rizky" status="Makan" phase={0.2} />
      <Plate x={136} y={1162} z={TABLE_TOP} />
      <OffDutyPerson x={196} y={1225} z={0} facing={180} pose="sit" action="eat" seatWorld={CHAIR_SEAT}
        look={{ shirt: "#a855f7", pants: "#111827", hair: "#2b1810" }} name="Nina" status="Makan" phase={1.6} />
      <Plate x={196} y={1196} z={TABLE_TOP} />

      {/* Lounge: nonton TV di sofa L, main HP di bean bag (menghadap TV di dinding timur) */}
      <OffDutyPerson x={30} y={1612} z={0} facing={90} pose="recline" action="watch" seatWorld={SOFA_SEAT}
        look={{ shirt: "#e11d48", pants: "#0f172a", hair: "#121212" }} name="Fajar" status="Nonton TV" phase={0.9} />
      <OffDutyPerson x={181} y={1699} z={0} facing={90} pose="recline" action="phone" seatWorld={BEANBAG_TOP}
        look={{ shirt: "#facc15", pants: "#1e3a8a", hair: "#3a2214" }} name="Lia" status="Main HP" phase={2.6} />
    </group>
  );
}
