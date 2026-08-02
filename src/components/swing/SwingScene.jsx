import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const FT = 0.3048;
const CONTACT_T = 0.55;

const VIEWS = {
  side: [5.2, 2.3, 3.4],
  catcher: [0.2, 2.2, 6.2],
  top: [0.6, 7.5, 0.9],
};

// Builds a stylized batter, plate, strike zone, bat arc and ball flight, then
// scrubs the whole swing from a single normalized time value.
export default function SwingScene({ params, playing, view = "side", onProgress }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const playingRef = useRef(playing);
  const progressRef = useRef(onProgress);
  playingRef.current = playing;
  progressRef.current = onProgress;

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#070B14");
    scene.fog = new THREE.Fog("#070B14", 12, 26);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x8fb6ff, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 8, 4);
    scene.add(key);
    const rim = new THREE.PointLight(0x34d399, 1.4, 14);
    rim.position.set(-2, 2, -2);
    scene.add(rim);

    const grid = new THREE.GridHelper(24, 24, 0x1d3a34, 0x111a28);
    grid.position.y = 0.001;
    scene.add(grid);

    const dirt = new THREE.Mesh(
      new THREE.CircleGeometry(3.4, 48),
      new THREE.MeshStandardMaterial({ color: 0x14202f, roughness: 1 })
    );
    dirt.rotation.x = -Math.PI / 2;
    scene.add(dirt);

    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.43, 0.02, 0.43),
      new THREE.MeshStandardMaterial({ color: 0xe8eef7 })
    );
    plate.position.y = 0.01;
    scene.add(plate);

    // Strike zone
    const zone = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.62, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.35 })
    );
    zone.position.set(0, 0.85, 0);
    scene.add(zone);

    // Batter
    const skin = new THREE.MeshStandardMaterial({ color: 0x9fb4cf, roughness: 0.7 });
    const kit = new THREE.MeshStandardMaterial({ color: 0x1f3350, roughness: 0.6 });
    const batter = new THREE.Group();
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.5, 6, 14), kit);
    torso.position.y = 1.12;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), skin);
    head.position.y = 1.58;
    const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.55, 4, 10), kit);
    legL.position.set(-0.12, 0.42, 0.14);
    const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.55, 4, 10), kit);
    legR.position.set(-0.12, 0.42, -0.18);
    batter.add(torso, head, legL, legR);
    batter.position.set(0.72, 0, 0);
    scene.add(batter);

    // Bat rig: tilt group sets the swing plane, sweep group rotates the bat
    const tilt = new THREE.Group();
    tilt.position.set(0.68, 1.02, 0);
    const sweep = new THREE.Group();
    tilt.add(sweep);
    scene.add(tilt);

    const bat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.018, 0.86, 14),
      new THREE.MeshStandardMaterial({ color: 0xf5d6a0, roughness: 0.4, metalness: 0.15 })
    );
    bat.rotation.z = Math.PI / 2;
    bat.position.x = 0.43;
    sweep.add(bat);

    const arms = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.22, 4, 8), skin);
    arms.rotation.z = Math.PI / 2;
    arms.position.x = -0.1;
    sweep.add(arms);

    // Ball
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.037, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x223344 })
    );
    scene.add(ball);

    // Swing path trail
    const trailMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.8 });
    const trail = new THREE.Line(new THREE.BufferGeometry(), trailMat);
    scene.add(trail);

    // Contact marker
    const marker = new THREE.Mesh(
      new THREE.RingGeometry(0.07, 0.1, 24),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    scene.add(marker);

    stateRef.current = { scene, camera, renderer, tilt, sweep, ball, trail, marker, bat, mount };

    let raf;
    let t = 0;
    let last = performance.now();

    const render = () => {
      raf = requestAnimationFrame(render);
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;

      const p = stateRef.current.params;
      if (!p) {
        renderer.render(scene, camera);
        return;
      }

      if (playingRef.current) {
        t = (t + dt / 3.2) % 1;
        progressRef.current?.(t);
      }

      // --- swing geometry ---
      const contact = new THREE.Vector3(
        (p.contact_side_ft || 0) * FT,
        Math.max(0.35, (p.contact_height_ft ?? 2.4) * FT),
        -Math.max(-1.2, p.contact_depth_ft ?? 1.2) * FT
      );
      const pivot = new THREE.Vector3(0.68, 1.02, 0);
      const azContact = Math.atan2(contact.z - pivot.z, contact.x - pivot.x);
      const attack = THREE.MathUtils.degToRad(p.attack_angle_deg ?? 8);

      tilt.rotation.z = attack;
      tilt.position.y = 1.02 + (contact.y - 0.73) * 0.5;

      const start = azContact - 2.0;
      const end = azContact + 0.85;

      // phase timing: load -> stride -> launch -> contact -> extension
      let swingT = 0;
      if (t > 0.3) swingT = Math.min(1, (t - 0.3) / 0.45);
      const eased = swingT < 0.6 ? Math.pow(swingT / 0.6, 1.8) * 0.72 : 0.72 + ((swingT - 0.6) / 0.4) * 0.28;
      sweep.rotation.y = start + (end - start) * eased;

      // batter coil / rotation
      batter.rotation.y = -0.5 + eased * 1.5;
      batter.position.z = -0.02 + Math.sin(Math.min(t, 0.35) * Math.PI) * 0.05;

      // --- ball flight ---
      const release = new THREE.Vector3(-0.25, 1.85, -16);
      if (t < CONTACT_T) {
        const bt = Math.min(1, t / CONTACT_T);
        ball.position.lerpVectors(release, contact, Math.pow(bt, 1.05));
      } else {
        const ft2 = (t - CONTACT_T) / (1 - CONTACT_T);
        const la = THREE.MathUtils.degToRad(p.launch_angle_deg ?? 14);
        const dir = THREE.MathUtils.degToRad(p.launch_direction_deg ?? -12);
        const speed = ((p.exit_velocity_mph ?? 82) / 90) * 26;
        const d = speed * ft2;
        ball.position.set(
          contact.x + Math.sin(dir) * d * 0.4,
          Math.max(0.037, contact.y + Math.tan(la) * d - 4.9 * Math.pow(ft2 * 1.5, 2)),
          contact.z - Math.cos(dir) * d
        );
      }

      marker.position.copy(contact);
      marker.lookAt(camera.position);
      marker.material.opacity = Math.abs(t - CONTACT_T) < 0.08 ? 1 : 0.25;

      // --- trail ---
      const pts = [];
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const e = i / steps;
        const eu = e < 0.6 ? Math.pow(e / 0.6, 1.8) * 0.72 : 0.72 + ((e - 0.6) / 0.4) * 0.28;
        const a = start + (end - start) * eu;
        const v = new THREE.Vector3(Math.cos(a) * 0.86, 0, Math.sin(a) * 0.86);
        v.applyAxisAngle(new THREE.Vector3(0, 0, 1), attack);
        v.add(new THREE.Vector3(pivot.x, tilt.position.y, pivot.z));
        pts.push(v);
      }
      trail.geometry.setFromPoints(pts);
      trail.material.opacity = 0.15 + 0.6 * swingT;

      renderer.render(scene, camera);
    };
    render();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    stateRef.current.params = params;
  }, [params]);

  useEffect(() => {
    const { camera } = stateRef.current;
    if (!camera) return;
    const [x, y, z] = VIEWS[view] || VIEWS.side;
    camera.position.set(x, y, z);
    camera.lookAt(0, 1, 0);
  }, [view]);

  return <div ref={mountRef} className="w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden border border-white/5" />;
}