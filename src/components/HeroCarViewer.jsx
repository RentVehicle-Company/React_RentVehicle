import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const LOOK_AT = new THREE.Vector3(0, -0.4, 0);
const DESIRED_POS = new THREE.Vector3();
const DESIRED_TARGET = new THREE.Vector3();

const VIEW_CONFIG = {
  front: { position: [0, 0.9, 7.5], target: [0, -0.4, 0] },
  side: { position: [7.5, 0.9, 0], target: [0, -0.4, 0] },
  "three-quarter": { position: [5.8, 2, 5.8], target: [0, -0.4, 0] },
};

const VEHICLE_CONFIG = {
  bmw: {
    model: "/bmw_m4csl.glb",
    name: "BMW M4 CSL",
    type: "Sportscar",
    scale: [1.55, 1.55, 1.55],
    offset: [0, -0.5, 0],
  },
  urus: {
    model: "/urus_absoluttm.glb",
    name: "Lamborghini Urus",
    type: "Super SUV",
    scale: [1.46, 1.46, 1.46],
    offset: [0, -0.5, 0],
  },
  raptor: {
    model: "/ford_f150_raptor.glb",
    name: "Ford F-150 Raptor",
    type: "Truck/Offroad",
    scale: [1.37, 1.37, 1.37],
    offset: [0, -0.5, 0],
  },
};

const ORBIT_RADIUS = 7;
const ORBIT_HEIGHT = 1.25;
const ORBIT_SPEED = 0.35;

// Non-paint parts that must NEVER be repainted — wheels, windows, lighting,
// trim, interior and hardware. Checked case-insensitively against BOTH mesh
// and material names (incl. Dekora/Blender naming: teker/goma = tyres,
// crome = chrome, deng/luces = lights, frein/plaquette/visse = brakes/screws,
// CRBN_JANTE = carbon wheels).
const EXCLUDE_HINTS = [
  "glass",
  "window",
  "tire",
  "tyre",
  "wheel",
  "rim",
  "brake",
  "break",
  "caliper",
  "disc",
  "interior",
  "light",
  "lens",
  "headlight",
  "taillight",
  "chrome",
  "crome",
  "carbon",
  "crbn",
  "logo",
  "badge",
  "symbol",
  "emblem",
  "mirror",
  "screw",
  "rivet",
  "keyhole",
  "stitch",
  "grill",
  "carpet",
  "leather",
  "dash",
  "console",
  "pedal",
  "under",
  "teker",
  "goma",
  "steel",
  "iron",
  "exhaust",
  "plastic",
  "deng",
  "luces",
  "whelen",
  "genesis",
  "frein",
  "plaquette",
  "visse",
  "jante",
  "hub",
  "sdc",
];

// Body-paint keywords matched against mesh + parent + material names.
const INCLUDE_HINTS = [
  "body",
  "paint",
  "car",
  "door",
  "hood",
  "fender",
  "trunk",
  "cab",
  "bed",
  "chassis",
];

// Exact exterior-paint materials per model (by MATERIAL name only). These are
// unambiguous, so they override misleading node-name prefixes — e.g. the Urus
// GLB names its body meshes `lights_050_BlackPaint_0`, which must NOT be
// skipped for containing "lights".
const STRONG_PAINT_HINTS = ["car_paint", "blackpaint", "paint_1"];

// Premium metallic gloss stamped onto EVERY painted body mesh of the Urus &
// Raptor. Those GLBs split the shell across differently-typed materials (e.g.
// Urus `BlackPaint` MeshPhysical vs white `material`/`Material.005` panels);
// stamping identical PBR values makes hood/roof/doors/bumper/side panels
// render as ONE uniformly-colored unit instead of two-tone flat-vs-metal.
const BODY_PAINT_METALNESS = 0.7;
const BODY_PAINT_ROUGHNESS = 0.25;

// Fallback: materials whose ORIGINAL base color is light/mid enough to be a
// painted exterior shell (not dark trim/plastics/tyres/undercarriage) get
// painted even when they carry a generic name, so doors and side panels are
// never left out. 0.16 keeps 0.12-gray trim plastics and 0.13-dark accent
// colors unpainted while still catching silver/mid body panels.
const BODY_LUMINANCE_MIN = 0.16;

function luminanceOf(color) {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

function captureDefaultColor(child) {
  if (!child.userData.defaultColor) {
    child.userData.defaultColor = child.material.color.clone();
  }
  return child.userData.defaultColor;
}

function GltfHeroCar({ color, vehicle }) {
  const { scene } = useGLTF(VEHICLE_CONFIG[vehicle].model);
  const { scale, offset } = VEHICLE_CONFIG[vehicle];

  // Debug dump of every mesh + material name so exact body nodes can be
  // identified while tuning the keyword lists.
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        console.log(
          `[GltfHeroCar:${vehicle}] mesh="${child.name}" material="${child.material.name}"`
        );
      }
    });
  }, [scene, vehicle]);

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh || !child.material?.color) return;

      const materialName = child.material.name || "";
      const parentName = child.parent?.name || "";
      const haystack =
        `${child.name} ${parentName} ${materialName}`.toLowerCase();

      // 0) Known body-paint materials always paint, regardless of the mesh
      //    node name they landed on.
      const strongPaint = STRONG_PAINT_HINTS.some((hint) =>
        materialName.toLowerCase().includes(hint)
      );

      // 1) Skip non-paint parts outright (unless strongPaint above).
      if (
        !strongPaint &&
        EXCLUDE_HINTS.some((hint) => haystack.includes(hint))
      ) {
        return;
      }

      // 2) Named body paint wins; otherwise fall back to the dominant
      //    exterior-material heuristic.
      const tagged = INCLUDE_HINTS.some((hint) => haystack.includes(hint));
      let isPaint = strongPaint || tagged;
      if (!isPaint) {
        const base = child.userData.defaultColor ?? child.material.color;
        if (
          !child.material.transparent &&
          luminanceOf(base) >= BODY_LUMINANCE_MIN
        ) {
          isPaint = true;
        }
      }
      if (!isPaint) return;

      // Clone once so roughness/metalness/normal & clearcoat maps survive.
      if (!child.userData.paintCloned) {
        captureDefaultColor(child);
        child.material = child.material.clone();
        child.userData.paintCloned = true;
      }

      // A baked diffuse texture would fight the selected paint color (the
      // texture tints/overrides the hex). Drop ONLY the base map on the clone
      // — normal maps, AO/bump maps (door lines & panel creases) and the
      // pristine material's reference all stay intact for future restore.
      if (child.material.map && !child.userData.mapHandled) {
        child.userData.originalMap = child.material.map;
        child.material.map = null;
        child.userData.mapHandled = true;
      }

      // Only the base color is repainted; material props are untouched by
      // default. Exception: Urus/Raptor body meshes get a single shared
      // metallic-gloss finish so the whole shell changes color uniformly.
      child.material.color.set(color);
      if (vehicle === "urus" || vehicle === "raptor") {
        if (child.material.roughnessMap) {
          child.userData.originalRoughnessMap = child.material.roughnessMap;
          child.material.roughnessMap = null;
        }
        if (child.material.metalnessMap) {
          child.userData.originalMetalnessMap = child.material.metalnessMap;
          child.material.metalnessMap = null;
        }
        child.material.metalness = BODY_PAINT_METALNESS;
        child.material.roughness = BODY_PAINT_ROUGHNESS;
      }
      // Force Three.js to re-render this material immediately.
      child.material.needsUpdate = true;
    });
    // Runs on mount AND whenever `color`/`vehicle` changes, so the currently
    // active paint is applied to the freshly loaded GLTF after every model
    // switch (BMW M4 CSL -> Urus -> Ford Raptor -> ...).
  }, [scene, color, vehicle]);

  return <primitive object={scene} scale={scale} position={offset} />;
}

function CameraTween({ cameraView, modeRef, activeRef }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);
  const orbitAngle = useRef(0);

  useEffect(() => {
    if (cameraView === "custom") return;
    modeRef.current = cameraView;
    activeRef.current = true;
    if (cameraView === "auto") {
      orbitAngle.current = Math.atan2(
        camera.position.z - LOOK_AT.z,
        camera.position.x - LOOK_AT.x
      );
    }
  }, [cameraView, camera, modeRef, activeRef]);

  useFrame((_, delta) => {
    if (!controls) return;

    const mode = modeRef.current;
    if (mode === "custom") return;

    const step = THREE.MathUtils.clamp(
      1 - Math.exp(-4.5 * delta),
      0.05,
      0.08
    );

    if (mode === "auto") {
      orbitAngle.current += delta * ORBIT_SPEED;
      DESIRED_POS.set(
        LOOK_AT.x + Math.cos(orbitAngle.current) * ORBIT_RADIUS,
        ORBIT_HEIGHT,
        LOOK_AT.z + Math.sin(orbitAngle.current) * ORBIT_RADIUS
      );
      DESIRED_TARGET.copy(LOOK_AT);
    } else {
      if (!activeRef.current) return;
      const config = VIEW_CONFIG[mode];
      if (!config) return;
      DESIRED_POS.set(
        config.position[0],
        config.position[1],
        config.position[2]
      );
      DESIRED_TARGET.set(
        config.target[0],
        config.target[1],
        config.target[2]
      );
    }

    camera.position.lerp(DESIRED_POS, step);
    controls.target.lerp(DESIRED_TARGET, step);

    if (mode !== "auto") {
      activeRef.current =
        camera.position.distanceTo(DESIRED_POS) < 0.02 &&
        controls.target.distanceTo(DESIRED_TARGET) < 0.02;
    }
  });

  return null;
}

function createFlareTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.15, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.4, "rgba(170,205,255,0.35)");
  gradient.addColorStop(1, "rgba(170,205,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Dim/soft linear falloff so the beam reads as a realistic cone instead of a
// hard cutoff.
function HeadlightBeam({ position, on }) {
  const flareTex = useMemo(() => createFlareTexture(), []);
  const lightRef = useRef();
  const targetRef = useRef();

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);

  return (
    <group>
      <object3D ref={targetRef} position={[position[0], position[1], 8]} />
      <spotLight
        ref={lightRef}
        position={position}
        angle={0.4}
        penumbra={0.6}
        distance={34}
        decay={1.5}
        intensity={on ? 90 : 0}
        color="#fff6e0"
      />
      <pointLight
        position={position}
        distance={8}
        decay={2}
        intensity={on ? 16 : 0}
        color="#ffedd8"
      />
      <sprite scale={[0.95, 0.95, 1]}>
        <spriteMaterial
          map={flareTex}
          color={on ? "#fff2d9" : "#000000"}
          opacity={on ? 0.95 : 0}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}

const HeroCarViewer = ({
  color,
  cameraView = "auto",
  headlightsOn = false,
  vehicle = "bmw",
  onInteract,
}) => {
  const modeRef = useRef(cameraView === "custom" ? "custom" : cameraView);
  const activeRef = useRef(false);

  return (
    <div className="w-full min-h-[380px] h-[460px] sm:h-[560px] md:h-[620px] relative flex items-center justify-center object-contain -mt-8 sm:-mt-12 md:-mt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[940px] animate-ambient rounded-full bg-gradient-to-tr from-blue-600/30 via-indigo-500/20 to-cyan-400/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-ambient absolute left-1/2 top-1/2 h-[440px] w-[440px] rounded-full bg-primary/20 blur-2xl"
        style={{ animationDelay: "-5.5s" }}
      />
      <div
        aria-hidden="true"
        className="animate-ambient absolute left-1/2 top-1/2 h-[360px] w-[360px] rounded-full bg-violet-500/25 blur-2xl"
        style={{ animationDelay: "-11s" }}
      />
      {Array.from({ length: 8 }).map((_, index) => {
        const larger = index >= 4 ? 1 : 0;
        const gradientPoints = [
          ["9%", "16%"],
          ["88%", "15%"],
          ["6%", "60%"],
          ["92%", "64%"],
          ["15%", "82%"],
          ["78%", "86%"],
          ["45%", "92%"],
          ["52%", "10%"],
        ];
        const [left, top] = gradientPoints[index];
        const palette = [
          "#2563eb",
          "#8b5cf6",
          "#2563eb",
          "#a855f7",
          "#3b82f6",
          "#8b5cf6",
          "#2563eb",
          "#a855f7",
        ];
        return (
          <span
            key={index}
            aria-hidden="true"
            className="animate-dot-float pointer-events-none absolute rounded-full"
            style={{
              left,
              top,
              width: `${larger ? 8 : 6}px`,
              height: `${larger ? 8 : 6}px`,
              backgroundColor: palette[index],
              animationDuration: `${(5 + ((index * 1.7) % 4)).toFixed(1)}s`,
              animationDelay: `${(index * 0.8 - 4).toFixed(1)}s`,
            }}
          />
        );
      })}
      <Canvas
        shadows
        dpr={Math.min(window.devicePixelRatio, 2)}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        camera={{ position: [7.5, 1.35, 7.5], fov: 45, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={2} />

        <HeadlightBeam
          position={[-0.62, 0.5, 2.15]}
          on={headlightsOn}
        />
        <HeadlightBeam position={[0.62, 0.5, 2.15]} on={headlightsOn} />

        <Environment preset="city" />

        <Suspense fallback={null}>
          <GltfHeroCar color={color} vehicle={vehicle} />
        </Suspense>

        <CameraTween
          cameraView={cameraView}
          modeRef={modeRef}
          activeRef={activeRef}
        />

        <OrbitControls
          makeDefault
          enableZoom
          enablePan={false}
          minDistance={3.5}
          maxDistance={12.5}
          enableDamping
          dampingFactor={0.08}
          onStart={() => {
            modeRef.current = "custom";
            activeRef.current = false;
            onInteract?.();
          }}
          target={LOOK_AT}
        />
      </Canvas>
    </div>
  );
};

export default HeroCarViewer;