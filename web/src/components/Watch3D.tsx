import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Lightformer, PresentationControls, RoundedBox, useTexture } from '@react-three/drei';
import * as THREE from 'three';

type Props = {
  textures: string[];
  index: number;
  /** Strap tint; defaults to graphite silicone. */
  strap?: string;
  spin?: boolean;
  className?: string;
  label: string;
  distance?: number;
  onReady?: () => void;
};

/**
 * A watch built from primitives: steel case, bezel, crown, glass and strap.
 * The dial is the face's real store render, so every colour the visitor picks
 * is the one the watch will actually show.
 */
const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export default function Watch3D({ textures, index, strap = '#161616', spin, className, label, distance = 6.2, onReady }: Props) {
  return (
    <div className={className} role="img" aria-label={label}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, distance], fov: 32 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <PresentationControls
            enabled={!coarse}
            global
            cursor
            snap
            speed={1.4}
            rotation={[0.12, -0.35, 0]}
            polar={[-0.5, 0.5]}
            azimuth={[-1.1, 1.1]}
          >
            <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.5}>
              <Watch textures={textures} index={index} strap={strap} spin={spin} onReady={onReady} />
            </Float>
          </PresentationControls>
          <ContactShadows position={[0, -2.25, 0]} opacity={0.5} scale={8} blur={2.6} far={4} color="#000" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 4, 5]} intensity={1.4} />
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={1.2} position={[0, 0, 6]} scale={[10, 10, 1]} color="#5a5a5a" />
            <Lightformer intensity={3} position={[0, 4, 3]} scale={[8, 1.5, 1]} />
            <Lightformer intensity={1.6} position={[-5, 0.5, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
            <Lightformer intensity={1.2} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#a7ff9c" />
            <Lightformer intensity={0.8} position={[0, -4, 2]} scale={[8, 1, 1]} color="#ff6831" />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}

function Watch({
  textures,
  index,
  strap,
  spin,
  onReady,
}: {
  textures: string[];
  index: number;
  strap: string;
  spin?: boolean;
  onReady?: () => void;
}) {
  const maps = useTexture(textures);
  useEffect(() => onReady?.(), [onReady]);
  useMemo(() => {
    for (const t of maps) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    }
  }, [maps]);

  const group = useRef<THREE.Group>(null);
  const front = useRef<THREE.MeshBasicMaterial>(null);
  const back = useRef<THREE.MeshBasicMaterial>(null);
  const shown = useRef(index);
  const fade = useRef(1);

  useEffect(() => {
    if (!front.current || !back.current || shown.current === index) return;
    back.current.map = maps[shown.current];
    back.current.needsUpdate = true;
    front.current.map = maps[index];
    front.current.needsUpdate = true;
    shown.current = index;
    fade.current = 0;
  }, [index, maps]);

  useFrame((state, dt) => {
    if (fade.current < 1 && front.current) {
      fade.current = Math.min(1, fade.current + dt * 3.2);
      front.current.opacity = fade.current;
    }
    if (group.current) {
      const t = state.clock.elapsedTime;
      group.current.rotation.y = spin ? Math.sin(t * 0.45) * 0.55 : THREE.MathUtils.lerp(group.current.rotation.y, 0, 0.05);
    }
  });

  const steel = (
    <meshStandardMaterial color="#d4d4d8" metalness={0.92} roughness={0.3} envMapIntensity={1.6} />
  );

  return (
    <group ref={group} scale={1}>
      {/* case */}
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[1.32, 1.28, 0.42, 96]} />
        {steel}
      </mesh>
      {/* bezel */}
      <mesh position-z={0.22}>
        <torusGeometry args={[1.24, 0.075, 24, 128]} />
        <meshStandardMaterial color="#e2e2e4" metalness={1} roughness={0.12} />
      </mesh>
      {/* dial: the real render, lit by itself like an AMOLED panel */}
      <mesh position-z={0.214}>
        <circleGeometry args={[1.17, 96]} />
        <meshBasicMaterial ref={back} map={maps[index]} toneMapped={false} />
      </mesh>
      <mesh position-z={0.216}>
        <circleGeometry args={[1.17, 96]} />
        <meshBasicMaterial ref={front} map={maps[index]} toneMapped={false} transparent />
      </mesh>
      {/* glass */}
      <mesh position-z={0.24}>
        <circleGeometry args={[1.19, 96]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.06} roughness={0.05} metalness={0} envMapIntensity={0.6} depthWrite={false} />
      </mesh>
      {/* crown and pushers */}
      <mesh position={[1.4, 0, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.11, 0.11, 0.18, 32]} />
        {steel}
      </mesh>
      {[-0.55, 0.55].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 1.36, Math.sin(a) * 1.36, 0]} rotation-z={a + Math.PI / 2}>
          <cylinderGeometry args={[0.07, 0.07, 0.14, 24]} />
          {steel}
        </mesh>
      ))}
      {/* strap */}
      {[1, -1].map((s) => (
        <group key={s}>
          <RoundedBox args={[1.12, 1.9, 0.16]} radius={0.07} smoothness={4} position={[0, s * 2.15, -0.12]} rotation-x={s * 0.32}>
            <meshStandardMaterial color={strap} roughness={0.8} metalness={0} />
          </RoundedBox>
          <mesh position={[0, s * 1.22, -0.05]}>
            <boxGeometry args={[1.0, 0.3, 0.28]} />
            {steel}
          </mesh>
        </group>
      ))}
    </group>
  );
}
