import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const canvas = document.getElementById("heroCanvas");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0e1512, 0.05);

const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3.6, 14);
camera.lookAt(0, 0.4, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

/* ---------- postprocessing: bloom for the glowing fiber lines ---------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.85, // strength
  0.6,  // radius
  0.15  // threshold
);
composer.addPass(bloomPass);

/* ---------- terrain grid (the hills of Tanahun, abstracted) ---------- */
const gridSize = 42, gridDivisions = 42;
const terrain = new THREE.Group();

const gridGeo = new THREE.PlaneGeometry(gridSize, gridSize, gridDivisions, gridDivisions);
const posAttr = gridGeo.attributes.position;
function terrainHeight(x, z) {
  return Math.sin(x * 0.32) * 0.45 + Math.cos(z * 0.26) * 0.55 + Math.sin((x + z) * 0.17) * 0.6;
}
for (let i = 0; i < posAttr.count; i++) {
  const x = posAttr.getX(i), y = posAttr.getY(i);
  posAttr.setZ(i, terrainHeight(x, y));
}
gridGeo.computeVertexNormals();

const gridMat = new THREE.MeshBasicMaterial({ color: 0x2c3f37, wireframe: true, transparent: true, opacity: 0.3 });
const gridMesh = new THREE.Mesh(gridGeo, gridMat);
gridMesh.rotation.x = -Math.PI / 2.35;
gridMesh.position.y = -1.7;
terrain.add(gridMesh);
scene.add(terrain);

/* ---------- atmospheric dust particles ---------- */
const dustCount = 260;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dustPos[i * 3] = (Math.random() - 0.5) * 30;
  dustPos[i * 3 + 1] = Math.random() * 8 - 1;
  dustPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
}
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({ color: 0x9caFa0, size: 0.02, transparent: true, opacity: 0.25 });
const dust = new THREE.Points(dustGeo, dustMat);
scene.add(dust);

/* ---------- network nodes + fiber lines ---------- */
const NODE_COUNT = 24;
const nodes = [];
const nodeGeo = new THREE.SphereGeometry(0.05, 12, 12);
const nodeMatAmber = new THREE.MeshBasicMaterial({ color: 0xffb066 });
const nodeMatTeal = new THREE.MeshBasicMaterial({ color: 0x7fe6cf });

for (let i = 0; i < NODE_COUNT; i++) {
  const x = (Math.random() - 0.5) * gridSize * 0.72;
  const z = (Math.random() - 0.5) * gridSize * 0.72;
  const y = terrainHeight(x, z) * 0.42 - 1.7 + 0.35;
  const mat = Math.random() > 0.72 ? nodeMatTeal : nodeMatAmber;
  const mesh = new THREE.Mesh(nodeGeo, mat);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  nodes.push(mesh);
}

const linePositions = [];
const pulseLines = [];
nodes.forEach((n, i) => {
  const dists = nodes
    .map((o, j) => ({ j, d: n.position.distanceTo(o.position) }))
    .filter((e) => e.j !== i)
    .sort((a, b) => a.d - b.d)
    .slice(0, 2);
  dists.forEach(({ j }) => {
    linePositions.push(n.position.x, n.position.y, n.position.z);
    linePositions.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
    pulseLines.push({ a: n.position, b: nodes[j].position, offset: Math.random() });
  });
});

const lineGeo = new THREE.BufferGeometry();
lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
const lineMat = new THREE.LineBasicMaterial({ color: 0x44594f, transparent: true, opacity: 0.55 });
const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
scene.add(lineSegments);

const pulseGeo = new THREE.SphereGeometry(0.035, 8, 8);
const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffc98a });
const pulseCount = Math.min(20, pulseLines.length);
const pulseMeshes = Array.from({ length: pulseCount }, () => new THREE.Mesh(pulseGeo, pulseMat));
pulseMeshes.forEach((m) => scene.add(m));

let mouseX = 0, mouseY = 0;
window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", resize);

const clock = new THREE.Clock();
const startZ = 14, endZ = 9.2;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // opening dolly-in, first ~2.6s
  const dollyT = Math.min(t / 2.6, 1);
  const eased = 1 - Math.pow(1 - dollyT, 3);
  camera.position.z = startZ + (endZ - startZ) * eased;

  if (!prefersReduced) {
    terrain.rotation.y = t * 0.015;
    scene.rotation.y += ((mouseX * 0.15) - scene.rotation.y) * 0.02;
    camera.position.y = 3.6 + mouseY * 0.2;
    dust.rotation.y = t * 0.01;

    pulseMeshes.forEach((mesh, idx) => {
      const line = pulseLines[idx];
      const speed = 0.15 + (idx % 5) * 0.03;
      const p = (t * speed + line.offset) % 1;
      mesh.position.lerpVectors(line.a, line.b, p);
    });

    nodes.forEach((n, i) => {
      n.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.18);
    });
  }

  composer.render();
}
animate();
