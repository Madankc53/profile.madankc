import * as THREE from "three";

const canvas = document.getElementById("heroCanvas");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0e1512, 0.045);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3.4, 9);
camera.lookAt(0, 0.4, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

/* ---------- terrain grid (the hills of Tanahun, abstracted) ---------- */
const gridSize = 40, gridDivisions = 40;
const terrain = new THREE.Group();

const gridGeo = new THREE.PlaneGeometry(gridSize, gridSize, gridDivisions, gridDivisions);
const posAttr = gridGeo.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  const x = posAttr.getX(i), y = posAttr.getY(i);
  const h = Math.sin(x * 0.35) * 0.4 + Math.cos(y * 0.28) * 0.5 + Math.sin((x + y) * 0.18) * 0.6;
  posAttr.setZ(i, h);
}
gridGeo.computeVertexNormals();

const gridMat = new THREE.MeshBasicMaterial({ color: 0x2a3b34, wireframe: true, transparent: true, opacity: 0.35 });
const gridMesh = new THREE.Mesh(gridGeo, gridMat);
gridMesh.rotation.x = -Math.PI / 2.4;
gridMesh.position.y = -1.6;
terrain.add(gridMesh);
scene.add(terrain);

/* ---------- network nodes + fiber lines ---------- */
const NODE_COUNT = 22;
const nodes = [];
const nodeGeo = new THREE.SphereGeometry(0.045, 12, 12);
const nodeMatAmber = new THREE.MeshBasicMaterial({ color: 0xff9a3c });
const nodeMatTeal = new THREE.MeshBasicMaterial({ color: 0x5fd9c0 });

function sampleHeight(x, z) {
  return Math.sin(x * 0.35) * 0.4 + Math.cos(z * 0.28) * 0.5 + Math.sin((x + z) * 0.18) * 0.6;
}

for (let i = 0; i < NODE_COUNT; i++) {
  const x = (Math.random() - 0.5) * gridSize * 0.7;
  const z = (Math.random() - 0.5) * gridSize * 0.7;
  const y = sampleHeight(x, z) * 0.42 - 1.6 + 0.35;
  const mat = Math.random() > 0.75 ? nodeMatTeal : nodeMatAmber;
  const mesh = new THREE.Mesh(nodeGeo, mat);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  nodes.push(mesh);
}

// connect each node to its nearest neighbors
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
const lineMat = new THREE.LineBasicMaterial({ color: 0x3a4d45, transparent: true, opacity: 0.5 });
const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
scene.add(lineSegments);

// traveling pulses along the fiber lines
const pulseGeo = new THREE.SphereGeometry(0.03, 8, 8);
const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffb066 });
const pulseMeshes = pulseLines.slice(0, 16).map(() => new THREE.Mesh(pulseGeo, pulseMat));
pulseMeshes.forEach((m) => scene.add(m));

/* ---------- ambient light points for glow feel (basic materials, no lights needed) ---------- */

let mouseX = 0, mouseY = 0;
window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", resize);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (!prefersReduced) {
    terrain.rotation.y = t * 0.015;
    scene.rotation.y += ((mouseX * 0.15) - scene.rotation.y) * 0.02;
    camera.position.y = 3.4 + mouseY * 0.2;

    pulseMeshes.forEach((mesh, idx) => {
      const line = pulseLines[idx];
      const speed = 0.15 + (idx % 5) * 0.03;
      const p = (t * speed + line.offset) % 1;
      mesh.position.lerpVectors(line.a, line.b, p);
    });

    nodes.forEach((n, i) => {
      n.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.15);
    });
  }

  renderer.render(scene, camera);
}
animate();
