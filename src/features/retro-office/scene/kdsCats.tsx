"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { KDS_DESK_ROWS } from "@/features/retro-office/core/furnitureDefaults";
import { toWorld } from "@/features/retro-office/core/geometry";

// Dua kucing kantor KDS yang berkeliaran dari lobi sampai ruang kerja mengikuti graf jalur
// (koordinat kanvas lokal ruko, sama dengan KDS_RUKO_LOCAL). Celah antar-meja (x 117 & 231)
// cukup untuk kucing menyelinap di antara baris meja.

type Node = { x: number; y: number };

function buildGraph() {
  const nodes: Node[] = [];
  const edges = new Map<number, Set<number>>();
  const add = (x: number, y: number) => {
    nodes.push({ x, y });
    edges.set(nodes.length - 1, new Set());
    return nodes.length - 1;
  };
  const link = (a: number, b: number) => {
    edges.get(a)!.add(b);
    edges.get(b)!.add(a);
  };
  // Lobi / ruang tunggu -> pintu sekat 1 -> sisi resepsionis -> pintu sekat 2 -> koridor
  const w1 = add(290, 1650);
  const w2 = add(150, 1640);
  const w3 = add(45, 1600);
  const d1 = add(40, 1548);
  const d1n = add(40, 1512);
  const r1 = add(35, 1475);
  const d2 = add(40, 1448);
  const d2n = add(40, 1412);
  const c1 = add(55, 1320);
  const c2 = add(55, 1200);
  const c3 = add(40, 1160);
  [[w1, w2], [w2, w3], [w1, w3], [w3, d1], [d1, d1n], [d1n, r1], [r1, d2], [d2, d2n], [d2n, c1], [c1, c2], [c2, c3]].forEach(
    ([a, b]) => link(a, b),
  );
  // Lorong di antara baris meja + jalur menyelinap di celah meja
  const lanes = [20, 117, 231, 330];
  const walkwayYs = KDS_DESK_ROWS.map((y) => y + 75);
  const grid: number[][] = walkwayYs.map((wy) => lanes.map((lx) => add(lx, wy)));
  grid.forEach((row) => {
    for (let i = 0; i < row.length - 1; i += 1) link(row[i], row[i + 1]);
  });
  for (let r = 0; r < grid.length - 1; r += 1) {
    link(grid[r][1], grid[r + 1][1]);
    link(grid[r][2], grid[r + 1][2]);
  }
  link(grid[grid.length - 1][0], c3);
  // Ke pantry lewat celah meja baris pertama
  const p0 = add(231, 415);
  const p1 = add(200, 405);
  const p2 = add(205, 250);
  link(grid[0][2], p0);
  link(p0, p1);
  link(p1, p2);
  return { nodes, edges };
}

type Mode = "walk" | "sit" | "groom" | "loaf";

type CatState = {
  from: number;
  to: number;
  prev: number;
  t: number;
  mode: Mode;
  timer: number;
  heading: number;
  phase: number;
};

const SPEED = 30; // satuan kanvas per detik (±0,5 m/s)

function useCatWalker(startNode: number, seed: number) {
  const graph = useMemo(buildGraph, []);
  const state = useRef<CatState>({
    from: startNode,
    to: [...graph.edges.get(startNode)!][0],
    prev: -1,
    t: 0,
    mode: "walk",
    timer: 0,
    heading: 0,
    phase: seed,
  });
  const pickNext = (current: number, prev: number) => {
    const options = [...graph.edges.get(current)!];
    const forward = options.filter((n) => n !== prev);
    const pool = forward.length > 0 && Math.random() < 0.85 ? forward : options;
    return pool[Math.floor(Math.random() * pool.length)];
  };
  const step = (dt: number) => {
    const s = state.current;
    s.phase += dt;
    if (s.mode !== "walk") {
      s.timer -= dt;
      if (s.timer <= 0) s.mode = "walk";
    } else {
      const a = graph.nodes[s.from];
      const b = graph.nodes[s.to];
      const len = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
      s.t += (SPEED * dt) / len;
      if (s.t >= 1) {
        s.prev = s.from;
        s.from = s.to;
        s.to = pickNext(s.from, s.prev);
        s.t = 0;
        const roll = Math.random();
        if (roll < 0.12) {
          s.mode = "sit";
          s.timer = 3 + Math.random() * 6;
        } else if (roll < 0.18) {
          s.mode = "groom";
          s.timer = 4 + Math.random() * 4;
        } else if (roll < 0.23) {
          s.mode = "loaf";
          s.timer = 8 + Math.random() * 10;
        }
      }
    }
    const a = graph.nodes[s.from];
    const b = graph.nodes[s.to];
    const t = s.mode === "walk" ? s.t : 0;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    if (s.mode === "walk") {
      const target = Math.atan2(b.x - a.x, b.y - a.y);
      let diff = target - s.heading;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      s.heading += diff * Math.min(1, dt * 6);
    }
    return { x, y, ...s };
  };
  return step;
}

type Look = {
  fur: string;
  furDark: string;
  eye: string;
  long: boolean;
};

const BRITISH: Look = { fur: "#8d98a5", furDark: "#76818e", eye: "#e0862a", long: false };
const PERSIAN: Look = { fur: "#151515", furDark: "#0a0a0a", eye: "#d9822b", long: true };

function Cat({ look, startNode, seed, scale = 1 }: { look: Look; startNode: number; seed: number; scale?: number }) {
  const step = useCatWalker(startNode, seed);
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const legs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const s = step(dt);
    const g = root.current;
    if (!g) return;
    const [wx, , wz] = toWorld(s.x, s.y);
    g.position.set(wx, 0, wz);
    g.rotation.y = s.heading;
    const walking = s.mode === "walk";
    const gait = walking ? Math.sin(s.phase * 9) : 0;
    legs.current.forEach((leg, i) => {
      if (!leg) return;
      const sign = i === 0 || i === 3 ? 1 : -1;
      leg.rotation.x = gait * 0.5 * sign;
      leg.visible = s.mode !== "loaf";
    });
    if (body.current) {
      const sitting = s.mode === "sit" || s.mode === "groom";
      body.current.rotation.x = sitting ? -0.45 : 0;
      body.current.position.y = s.mode === "loaf" ? -0.035 : walking ? Math.abs(gait) * 0.006 : 0;
    }
    if (head.current) {
      head.current.rotation.x = s.mode === "groom" ? 0.5 + Math.sin(s.phase * 6) * 0.15 : 0;
      head.current.rotation.y = walking ? 0 : Math.sin(s.phase * 0.7) * 0.4;
    }
    if (tail.current) {
      tail.current.rotation.y = Math.sin(s.phase * (walking ? 3 : 1.4)) * 0.45;
    }
  });

  const furMat = <meshStandardMaterial color={look.fur} roughness={look.long ? 1 : 0.9} />;
  const darkMat = <meshStandardMaterial color={look.furDark} roughness={1} />;
  const bodyR = look.long ? 0.105 : 0.095;
  const fluff: [number, number, number, number][] = look.long
    ? [
        [0.07, 0.12, 0.02, 0.06],
        [-0.07, 0.12, 0.02, 0.06],
        [0, 0.17, -0.06, 0.065],
        [0, 0.08, 0.1, 0.06],
        [0.06, 0.1, -0.1, 0.055],
        [-0.06, 0.1, -0.1, 0.055],
      ]
    : [];

  return (
    <group ref={root} scale={scale}>
      <group ref={body}>
        {/* Badan */}
        <mesh position={[0, 0.12, 0]} scale={[1, 0.85, 1.5]} castShadow>
          <sphereGeometry args={[bodyR, 18, 14]} />
          {furMat}
        </mesh>
        {fluff.map(([fx, fy, fz, r], i) => (
          <mesh key={i} position={[fx, fy, fz]} castShadow>
            <sphereGeometry args={[r, 10, 8]} />
            {i % 2 ? darkMat : furMat}
          </mesh>
        ))}
        {/* Kepala */}
        <group ref={head} position={[0, 0.2, 0.14]}>
          <mesh scale={[1.12, look.long ? 0.98 : 1, look.long ? 0.82 : 0.95]} castShadow>
            <sphereGeometry args={[0.072, 18, 14]} />
            {furMat}
          </mesh>
          {/* Pipi tembam */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.042, -0.02, 0.035]} castShadow>
              <sphereGeometry args={[look.long ? 0.04 : 0.036, 12, 10]} />
              {furMat}
            </mesh>
          ))}
          {/* Telinga kecil membulat */}
          {[-1, 1].map((side) => (
            <mesh key={`e${side}`} position={[side * 0.042, 0.06, -0.005]} rotation={[0, 0, side * -0.35]} castShadow>
              <coneGeometry args={[0.024, look.long ? 0.03 : 0.038, 8]} />
              {darkMat}
            </mesh>
          ))}
          {/* Mata bulat tembaga */}
          {[-1, 1].map((side) => (
            <group key={`m${side}`} position={[side * 0.026, 0.008, look.long ? 0.058 : 0.064]}>
              <mesh>
                <sphereGeometry args={[0.014, 12, 10]} />
                <meshStandardMaterial color={look.eye} emissive={look.eye} emissiveIntensity={0.25} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0.011]} scale={[0.45, 1, 0.4]}>
                <sphereGeometry args={[0.008, 8, 6]} />
                <meshStandardMaterial color="#050505" roughness={0.1} />
              </mesh>
            </group>
          ))}
          {/* Hidung */}
          <mesh position={[0, -0.012, look.long ? 0.064 : 0.07]}>
            <sphereGeometry args={[0.007, 8, 6]} />
            <meshStandardMaterial color={look.long ? "#2b2b2b" : "#5f6670"} />
          </mesh>
        </group>
        {/* Ekor */}
        <group ref={tail} position={[0, 0.14, -0.14]}>
          <mesh position={[0, 0.04, -0.06]} rotation={[-0.9, 0, 0]} castShadow>
            <capsuleGeometry args={[look.long ? 0.034 : 0.025, look.long ? 0.13 : 0.1, 4, 8]} />
            {look.long ? darkMat : furMat}
          </mesh>
        </group>
      </group>
      {/* Kaki pendek */}
      {[
        [0.05, 0.1],
        [-0.05, 0.1],
        [0.05, -0.09],
        [-0.05, -0.09],
      ].map(([lx, lz], i) => (
        <mesh
          key={i}
          ref={(el) => {
            legs.current[i] = el;
          }}
          position={[lx, 0.045, lz]}
          castShadow
        >
          <cylinderGeometry args={[0.021, 0.019, 0.09, 8]} />
          {look.long ? darkMat : furMat}
        </mesh>
      ))}
    </group>
  );
}

export function KdsCats() {
  return (
    <group>
      <Cat look={BRITISH} startNode={0} seed={1.3} scale={1.35} />
      <Cat look={PERSIAN} startNode={10} seed={4.1} scale={1.35} />
    </group>
  );
}
