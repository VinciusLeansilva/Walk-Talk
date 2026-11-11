import { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { tilt } from "../hooks/useParallax";
import { useExperience } from "../store/useExperience";
const vertex = `varying vec3 vNormal; varying vec3 vPosition; void main(){ vNormal=normalize(normalMatrix*normal); vec4 p=modelViewMatrix*vec4(position,1.0); vPosition=p.xyz; gl_Position=projectionMatrix*p; }`;
const fragment = `varying vec3 vNormal; varying vec3 vPosition; void main(){ float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(-vPosition))),3.8); gl_FragColor=vec4(0.08,0.56,1.0,rim*0.65); }`;
function FrameBudget() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) invalidate();
    }, 1000 / 30);
    return () => window.clearInterval(timer);
  }, [invalidate]);
  return null;
}
function Satellite({ angle }: { angle: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime * 0.09 + angle;
      ref.current.position.set(
        Math.cos(t) * 2.57,
        Math.sin(t) * 1.03,
        Math.sin(t) * 1.8,
      );
      ref.current.rotation.set(0.4, t, -0.5);
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.11, 0.12, 0.13]} />
        <meshStandardMaterial
          color="#e8f4ff"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.16, 0, 0]}>
          <boxGeometry args={[0.18, 0.08, 0.015]} />
          <meshStandardMaterial
            color="#239bd1"
            emissive="#075787"
            emissiveIntensity={0.7}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#9cfcff" />
      </mesh>
    </group>
  );
}
function Globe({ story, onReady }: { story: boolean; onReady: () => void }) {
  const group = useRef<THREE.Group>(null);
  const earth = useRef<THREE.Mesh>(null);
  const packet = useRef<THREE.Mesh>(null);
  const [day, night] = useLoader(THREE.TextureLoader, [
    "/textures/earth.jpg",
    "/textures/night.jpg",
  ]);
  useEffect(() => {
    onReady();
  }, [onReady]);
  day.colorSpace = THREE.SRGBColorSpace;
  night.colorSpace = THREE.SRGBColorSpace;
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.3, -0.9, 1.2),
        new THREE.Vector3(-1.85, 0.65, 1.8),
        new THREE.Vector3(0.3, 2.65, 0.6),
        new THREE.Vector3(1.65, 0.75, 1.1),
        new THREE.Vector3(1.1, -0.4, 1.5),
      ]),
    [],
  );
  const trail = useMemo(
    () => new THREE.TubeGeometry(curve, 100, 0.006, 4, false),
    [curve],
  );
  const lastPulse = useRef(0);
  const started = useRef(-99);
  useFrame(({ clock, pointer, camera }, delta) => {
    const s = useExperience.getState();
    if (group.current) {
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        (tilt.enabled ? tilt.y : pointer.y) * 0.055,
        2,
        delta,
      );
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        (tilt.enabled ? tilt.x : pointer.x) * 0.09,
        2,
        delta,
      );
    }
    if (earth.current) earth.current.rotation.y += delta * 0.025;
    if (s.pulse !== lastPulse.current) {
      lastPulse.current = s.pulse;
      started.current = clock.elapsedTime;
    }
    if (packet.current) {
      const t = story
        ? s.step / 5
        : (clock.elapsedTime - started.current) / 2.6;
      packet.current.visible = story || (t >= 0 && t <= 1) || s.ptt;
      packet.current.position.copy(
        curve.getPoint(
          Math.max(0, Math.min(1, s.ptt ? (clock.elapsedTime % 2.6) / 2.6 : t)),
        ),
      );
    }
    if (story) {
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        (s.journey - 0.5) * 1.2,
        2,
        delta,
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        Math.sin((s.step / 5) * Math.PI) * 0.8,
        2,
        delta,
      );
      camera.lookAt(0, 0, 0);
    }
  });
  return (
    <group ref={group} rotation={[0.06, 0, -0.15]}>
      <mesh ref={earth} rotation={[0, 2.9, 0]}>
        <sphereGeometry args={[1.87, 48, 48]} />
        <meshStandardMaterial
          map={day}
          emissiveMap={night}
          emissive="#e5ecff"
          emissiveIntensity={1.15}
          roughness={0.96}
          color="#6aa1d4"
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.905, 48, 48]} />
        <shaderMaterial
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + (i ? 0.7 : -0.45), i * 0.9, 0]}>
          <torusGeometry args={[2.5 + i * 0.12, 0.004, 5, 96]} />
          <meshBasicMaterial color="#30b8df" transparent opacity={0.28} />
        </mesh>
      ))}
      <mesh geometry={trail}>
        <meshBasicMaterial color="#63e8ff" transparent opacity={0.52} />
      </mesh>
      <mesh ref={packet}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color="#c6fcff" />
      </mesh>
      <Satellite angle={0.5} />
      <Satellite angle={3.65} />
    </group>
  );
}
export default function EarthScene({
  story = false,
  onReady,
}: {
  story?: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.25]}
      frameloop="demand"
      camera={{ position: [0, 0, 6.7], fov: 44 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      aria-hidden="true"
    >
      <FrameBudget />
      <ambientLight intensity={0.65} />
      <directionalLight position={[-3, 4, 6]} intensity={2.6} color="#a0dfff" />
      <Suspense fallback={null}>
        <Globe story={story} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
