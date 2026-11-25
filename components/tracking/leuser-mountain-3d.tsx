"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Compass, Moon, RotateCcw, Sun, ZoomIn, ZoomOut } from "lucide-react";

export type LiveMapAnimal3D = {
  id: string;
  deviceId: number;
  animalId: number;
  name: string;
  speciesId: number;
  speciesName: string;
  latitude: number;
  longitude: number;
  recordedAt: string;
  isActive: boolean;
  status: string;
  speedKmh: number;
  heading: string;
  trail: [number, number][];
};

type ProjectedAnimalPin = {
  id: string;
  x: number;
  y: number;
  visible: boolean;
};

type LeuserMountain3DProps = {
  animals: LiveMapAnimal3D[];
  selectedAnimalId: string | null;
  onSelect: (id: string | null) => void;
};

function speciesEmoji(speciesName: string): string {
  const s = speciesName.toLowerCase();
  if (s.includes("orangutan")) return "🐒";
  if (s.includes("harimau") || s.includes("tiger")) return "🐅";
  if (s.includes("gajah") || s.includes("elephant")) return "🐘";
  if (s.includes("badak") || s.includes("rhino")) return "🦏";
  return "🐾";
}

function speciesColor(speciesName: string): string {
  const s = speciesName.toLowerCase();
  if (s.includes("orangutan")) return "#f59e0b";
  if (s.includes("harimau") || s.includes("tiger")) return "#ef4444";
  if (s.includes("gajah") || s.includes("elephant")) return "#38bdf8";
  if (s.includes("badak") || s.includes("rhino")) return "#a78bfa";
  return "#34d399";
}

/** Realistic multi-ridge Gunung Leuser topography with Alas river valley & sub-peaks. */
function mountainHeightAt(x: number, z: number): number {
  const r = Math.sqrt(x * x + z * z);
  const mainPeak = 2.95 * Math.exp(-((x - 0.35) ** 2 + (z + 0.25) ** 2) / 6.2);
  const westPeak = 1.85 * Math.exp(-((x + 2.15) ** 2 + (z - 0.9) ** 2) / 4.4);
  const northRidge = 1.45 * Math.exp(-((x - 1.9) ** 2 + (z + 2.0) ** 2) / 3.8);
  const southFoothill = 1.05 * Math.exp(-((x + 0.7) ** 2 + (z - 2.3) ** 2) / 4.8);

  const fineDetail =
    0.28 * Math.sin(x * 1.15 + 0.4) * Math.cos(z * 1.05) +
    0.14 * Math.cos(x * 2.3 - z * 1.9) +
    0.06 * Math.sin(x * 4.1 + z * 3.7);

  // Subtle river valley carving across the south-east slope
  const riverDist = Math.abs(z - (0.45 * x + 1.35));
  const riverCarve = 0.42 * Math.exp(-(riverDist * riverDist) / 0.38);

  const skirt = Math.max(0, 1 - r / 6.8);
  const raw = (mainPeak + westPeak + northRidge + southFoothill + fineDetail * skirt - riverCarve) * skirt;
  return Math.max(0.02, raw);
}

/** Project real TNGL lat/lon coordinates smoothly onto the 3D mountain surface. */
function projectGpsToMountain(
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
  span: number,
): { x: number; z: number } {
  const safeSpan = Math.max(span, 0.04);
  const nx = ((lon - centerLon) / safeSpan) * 3.6;
  const nz = (-(lat - centerLat) / safeSpan) * 3.6;
  const dist = Math.hypot(nx, nz);
  const maxR = 4.35;
  if (dist > maxR) {
    const k = maxR / dist;
    return { x: nx * k, z: nz * k };
  }
  return { x: nx, z: nz };
}

export function LeuserMountain3D({
  animals,
  selectedAnimalId,
  onSelect,
}: LeuserMountain3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [nightMode, setNightMode] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [pins, setPins] = useState<ProjectedAnimalPin[]>([]);

  const selectedRef = useRef<string | null>(selectedAnimalId);
  const nightRef = useRef<boolean>(nightMode);
  const zoomRef = useRef<number>(1);
  const manualOrbitRef = useRef<number>(0);

  // Compute stable geographic bounding center for projecting GPS -> 3D mountain
  const geoBounds = useMemo(() => {
    if (animals.length === 0) {
      return { centerLat: 3.55, centerLon: 97.35, span: 0.25 };
    }
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;
    for (const a of animals) {
      if (a.latitude < minLat) minLat = a.latitude;
      if (a.latitude > maxLat) maxLat = a.latitude;
      if (a.longitude < minLon) minLon = a.longitude;
      if (a.longitude > maxLon) maxLon = a.longitude;
    }
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    const span = Math.max(maxLat - minLat, maxLon - minLon, 0.06) * 1.15;
    return { centerLat, centerLon, span };
  }, [animals]);

  const projectedTargets = useMemo(() => {
    return animals.map((animal) => {
      const { x, z } = projectGpsToMountain(
        animal.latitude,
        animal.longitude,
        geoBounds.centerLat,
        geoBounds.centerLon,
        geoBounds.span,
      );
      const y = mountainHeightAt(x, z);
      const trailPoints = animal.trail.map(([tLat, tLon]) => {
        const pt = projectGpsToMountain(tLat, tLon, geoBounds.centerLat, geoBounds.centerLon, geoBounds.span);
        return new THREE.Vector3(pt.x, mountainHeightAt(pt.x, pt.z) + 0.08, pt.z);
      });
      return {
        id: animal.id,
        x,
        y,
        z,
        color: speciesColor(animal.speciesName),
        isActive: animal.isActive,
        trailPoints,
      };
    });
  }, [animals, geoBounds]);

  const targetsRef = useRef(projectedTargets);
  useEffect(() => {
    targetsRef.current = projectedTargets;
  }, [projectedTargets]);

  useEffect(() => {
    selectedRef.current = selectedAnimalId;
  }, [selectedAnimalId]);

  useEffect(() => {
    nightRef.current = nightMode;
  }, [nightMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      queueMicrotask(() => setWebglError(true));
      return;
    }

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 520;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const dayBg = new THREE.Color("#d8ece1");
    const nightBg = new THREE.Color("#071410");
    scene.background = nightRef.current ? nightBg : dayBg;
    scene.fog = new THREE.FogExp2(nightRef.current ? "#071410" : "#d8ece1", 0.032);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 5.2, 9.6);

    const hemiLight = new THREE.HemisphereLight("#eefbf3", "#1b3a29", 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight("#fff4d6", 1.45);
    sunLight.position.set(7, 11, 6);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight("#7dd3fc", 0.48);
    rimLight.position.set(-7, 5, -6);
    scene.add(rimLight);

    // High-resolution Gunung Leuser terrain with realistic elevation biome + contour shading
    const geo = new THREE.PlaneGeometry(13.2, 13.2, 104, 104);
    geo.rotateX(-Math.PI / 2);
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = mountainHeightAt(x, z);
      posAttr.setY(i, y);

      const riverDist = Math.abs(z - (0.45 * x + 1.35));
      const isRiver = riverDist < 0.24 && y < 0.42;
      const contour = Math.abs((y * 5.2) % 1) < 0.05 ? -0.04 : 0;

      const c = new THREE.Color();
      if (isRiver) {
        c.set("#2b7a8c");
      } else if (y > 2.45) {
        c.set("#cfdcd4"); // misty summit rock
      } else if (y > 1.85) {
        c.set("#5c7d68"); // subalpine ridge
      } else if (y > 1.15) {
        c.set("#2e6844"); // montane rainforest
      } else if (y > 0.45) {
        c.set("#225738"); // dense dipterocarp canopy
      } else {
        c.set("#1a432c"); // lowland Leuser basin
      }
      c.offsetHSL(0, 0, contour);
      colors.push(c.r, c.g, c.b);
    }

    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mountainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.86,
      metalness: 0.06,
      flatShading: false,
    });
    const mountain = new THREE.Mesh(geo, mountainMat);
    scene.add(mountain);

    // Subtle topographic base grid ring beneath mountain
    const ringGeo = new THREE.RingGeometry(5.6, 5.75, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: "#3e7b58",
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const compassRing = new THREE.Mesh(ringGeo, ringMat);
    compassRing.position.y = 0.03;
    scene.add(compassRing);

    // Procedural tropical rainforest trees around slopes
    const treeGeo = new THREE.ConeGeometry(0.095, 0.32, 6);
    const treeMat = new THREE.MeshStandardMaterial({
      color: "#1a4d30",
      roughness: 0.9,
      flatShading: true,
    });
    for (let i = 0; i < 95; i++) {
      const angle = (i / 95) * Math.PI * 2 + (i % 7) * 0.31;
      const rad = 1.15 + ((i * 53) % 41) / 10;
      const tx = Math.cos(angle) * rad;
      const tz = Math.sin(angle) * rad;
      const ty = mountainHeightAt(tx, tz);
      const riverDist = Math.abs(tz - (0.45 * tx + 1.35));
      if (ty > 0.16 && ty < 2.15 && riverDist > 0.35) {
        const sc = 0.75 + ((i * 19) % 10) * 0.06;
        const tree = new THREE.Mesh(treeGeo, treeMat);
        tree.position.set(tx, ty + 0.12 * sc, tz);
        tree.scale.set(sc, sc, sc);
        scene.add(tree);
      }
    }

    // Dynamic animal beacons + ground pulse rings + 3D trails
    const beaconGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const pulseGeo = new THREE.RingGeometry(0.14, 0.22, 24);
    pulseGeo.rotateX(-Math.PI / 2);

    type AnimalVisual = {
      group: THREE.Group;
      beacon: THREE.Mesh;
      pulse: THREE.Mesh;
      trailLine: THREE.Line | null;
      currentPos: THREE.Vector3;
    };
    const animalVisuals = new Map<string, AnimalVisual>();

    // Drag to orbit + wheel zoom
    let isDragging = false;
    let lastX = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (selectedRef.current !== null) return;
      isDragging = true;
      lastX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || selectedRef.current !== null) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      manualOrbitRef.current -= dx * 0.0065;
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const lookTarget = new THREE.Vector3(0, 1.0, 0);
    const desiredLook = new THREE.Vector3(0, 1.0, 0);
    const desiredCam = new THREE.Vector3(0, 5.2, 9.6);
    let autoOrbit = 0;
    let animId = 0;
    let frameCount = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frameCount++;

      // Smooth day/night lighting
      const isNight = nightRef.current;
      scene.background = isNight ? nightBg : dayBg;
      if (scene.fog) {
        scene.fog.color.copy(isNight ? nightBg : dayBg);
      }
      hemiLight.intensity = isNight ? 0.35 : 0.85;
      sunLight.intensity = isNight ? 0.5 : 1.45;

      const currentTargets = targetsRef.current;
      const activeIds = new Set(currentTargets.map((t) => t.id));

      // Remove visuals for animals no longer in filter
      animalVisuals.forEach((vis, id) => {
        if (!activeIds.has(id)) {
          scene.remove(vis.group);
          if (vis.trailLine) {
            scene.remove(vis.trailLine);
            vis.trailLine.geometry.dispose();
            vis.trailLine.material.dispose();
          }
          vis.beacon.material.dispose();
          vis.pulse.material.dispose();
          animalVisuals.delete(id);
        }
      });

      // Sync & smoothly animate animal beacons and movement trails
      const pulseWave = 1 + 0.38 * Math.sin(frameCount * 0.07);
      for (const target of currentTargets) {
        let vis = animalVisuals.get(target.id);
        if (!vis) {
          const group = new THREE.Group();
          const beaconMat = new THREE.MeshStandardMaterial({
            color: target.color,
            emissive: target.color,
            emissiveIntensity: 0.75,
            roughness: 0.25,
          });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.y = 0.22;
          group.add(beacon);

          const pulseMat = new THREE.MeshBasicMaterial({
            color: target.color,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
          });
          const pulse = new THREE.Mesh(pulseGeo, pulseMat);
          pulse.position.y = 0.06;
          group.add(pulse);

          const startPos = new THREE.Vector3(target.x, target.y, target.z);
          group.position.copy(startPos);
          scene.add(group);

          vis = { group, beacon, pulse, trailLine: null, currentPos: startPos };
          animalVisuals.set(target.id, vis);
        }

        // Smoothly glide beacon toward latest 10-second GPS position
        const nextPos = new THREE.Vector3(target.x, target.y, target.z);
        vis.currentPos.lerp(nextPos, 0.08);
        vis.group.position.copy(vis.currentPos);

        const isSelected = selectedRef.current === target.id;
        const sc = isSelected ? 1.45 : 1.0;
        vis.beacon.scale.set(sc, sc, sc);
        vis.pulse.scale.set(pulseWave * sc, pulseWave * sc, 1);

        // Update 3D trail ribbon every 20 frames or when trail length changes
        if (target.trailPoints.length > 1 && frameCount % 20 === 0) {
          if (vis.trailLine) {
            scene.remove(vis.trailLine);
            vis.trailLine.geometry.dispose();
            vis.trailLine.material.dispose();
          }
          const trailGeo = new THREE.BufferGeometry().setFromPoints(target.trailPoints);
          const trailMat = new THREE.LineBasicMaterial({
            color: target.color,
            transparent: true,
            opacity: isSelected ? 0.95 : 0.55,
          });
          vis.trailLine = new THREE.Line(trailGeo, trailMat);
          scene.add(vis.trailLine);
        }
      }

      // Camera positioning (overview orbit vs focused on selected animal)
      const selectedId = selectedRef.current;
      const selectedVisual = selectedId ? animalVisuals.get(selectedId) : null;

      if (!selectedVisual) {
        if (!isDragging) {
          autoOrbit += 0.0018;
        }
        const angle = autoOrbit + manualOrbitRef.current;
        const dist = 9.6 / zoomRef.current;
        const camH = 5.1 / Math.sqrt(zoomRef.current);
        desiredCam.set(Math.sin(angle) * dist, camH, Math.cos(angle) * dist);
        desiredLook.set(0, 1.0, 0);
      } else {
        const pos = selectedVisual.currentPos;
        const len = Math.hypot(pos.x, pos.z) || 1;
        const nx = pos.x / len;
        const nz = pos.z / len;
        desiredCam.set(pos.x + nx * 2.9, pos.y + 1.8, pos.z + nz * 2.9);
        desiredLook.set(pos.x, pos.y + 0.35, pos.z);
      }

      camera.position.lerp(desiredCam, 0.075);
      lookTarget.lerp(desiredLook, 0.09);
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);

      // Project clickable 2D animal pins every 2 frames
      if (frameCount % 2 === 0) {
        const w = container.clientWidth || width;
        const h = container.clientHeight || height;
        const nextPins: ProjectedAnimalPin[] = [];
        animalVisuals.forEach((vis, id) => {
          const v = new THREE.Vector3(
            vis.currentPos.x,
            vis.currentPos.y + 0.42,
            vis.currentPos.z,
          );
          v.project(camera);
          nextPins.push({
            id,
            x: (v.x * 0.5 + 0.5) * w,
            y: (-v.y * 0.5 + 0.5) * h,
            visible: v.z < 1 && v.x > -1.1 && v.x < 1.1 && v.y > -1.1 && v.y < 1.1,
          });
        });
        setPins(nextPins);
      }
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);
      animalVisuals.forEach((vis) => {
        if (vis.trailLine) {
          vis.trailLine.geometry.dispose();
          vis.trailLine.material.dispose();
        }
        vis.beacon.material.dispose();
        vis.pulse.material.dispose();
      });
      animalVisuals.clear();
      geo.dispose();
      ringGeo.dispose();
      treeGeo.dispose();
      beaconGeo.dispose();
      pulseGeo.dispose();
      mountainMat.dispose();
      ringMat.dispose();
      treeMat.dispose();
      renderer.dispose();
    };
  }, []);

  const animalById = useMemo(() => {
    const map = new Map<string, LiveMapAnimal3D>();
    animals.forEach((a) => map.set(a.id, a));
    return map;
  }, [animals]);

  if (webglError) {
    return (
      <div className="flex h-[min(520px,70dvh)] min-h-[340px] items-center justify-center rounded-2xl border border-line bg-surface-muted p-6 text-center text-sm text-muted">
        WebGL tidak tersedia di browser ini. Beralih ke mode Peta 2D di atas untuk melihat lokasi satwa.
      </div>
    );
  }

  return (
    <div className="relative h-[min(540px,70dvh)] min-h-[340px] w-full overflow-hidden rounded-xl border border-emerald-500/25 shadow-inner">
      <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Top-left compass & hint */}
      <div className="pointer-events-none absolute left-3 top-3 z-20 flex max-w-[calc(100%-8.5rem)] items-center gap-2 rounded-full bg-surface/85 px-3 py-1.5 text-xs font-medium text-ink shadow backdrop-blur-md">
        <Compass className="size-3.5 shrink-0 text-primary" />
        <span className="truncate">
          {selectedAnimalId
            ? `Fokus Satwa · ${animalById.get(selectedAnimalId)?.name ?? selectedAnimalId}`
            : "Gunung Leuser 3D · Geser untuk putar · Klik pin satwa untuk info & model 3D"}
        </span>
      </div>

      {/* Top-right 3D controls */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
        {selectedAnimalId === null ? (
          <>
            <button
              type="button"
              onClick={() => {
                zoomRef.current = Math.min(1.7, zoomRef.current + 0.2);
              }}
              aria-label="Perbesar gunung 3D"
              className="flex size-8 items-center justify-center rounded-full bg-surface/85 text-ink shadow backdrop-blur-md transition hover:bg-surface"
            >
              <ZoomIn className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                zoomRef.current = Math.max(0.75, zoomRef.current - 0.2);
              }}
              aria-label="Perkecil gunung 3D"
              className="flex size-8 items-center justify-center rounded-full bg-surface/85 text-ink shadow backdrop-blur-md transition hover:bg-surface"
            >
              <ZoomOut className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-white shadow transition hover:bg-primary-dark"
          >
            <RotateCcw className="size-3.5" />
            <span>Lihat Gunung</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setNightMode((prev) => !prev)}
          aria-label={nightMode ? "Mode Siang" : "Mode Malam"}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface/85 px-3 text-xs font-medium text-ink shadow backdrop-blur-md transition hover:bg-surface"
        >
          {nightMode ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5 text-indigo-500" />}
          <span className="hidden sm:inline">{nightMode ? "Siang" : "Malam"}</span>
        </button>
      </div>

      {/* Clickable 2D projected animal pins */}
      {pins.map((pin) => {
        if (!pin.visible) return null;
        const animal = animalById.get(pin.id);
        if (!animal) return null;
        const isSelected = selectedAnimalId === animal.id;
        return (
          <button
            key={animal.id}
            type="button"
            onClick={() => onSelect(animal.id)}
            style={{
              left: `${pin.x}px`,
              top: `${pin.y}px`,
              transform: "translate(-50%, -100%)",
            }}
            className={`absolute z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-lg backdrop-blur-md transition hover:scale-105 ${
              isSelected
                ? "border-amber-300 bg-primary text-white ring-2 ring-amber-400/70"
                : "border-emerald-400/50 bg-forest-black/85 text-emerald-50 hover:bg-primary"
            }`}
          >
            <span className="text-sm leading-none">{speciesEmoji(animal.speciesName)}</span>
            <span className="max-w-[120px] truncate">{animal.name}</span>
            {animal.isActive ? (
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
