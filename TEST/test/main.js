import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

// --------------------
// CENA, CÂMERA, RENDER
// --------------------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 120;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// --------------------
// SHADERS
// --------------------
const vertexShader = `
uniform float uTime;
uniform float uSize;
uniform float uProgress;

attribute vec3 aTarget;

varying float vDepth;
varying float vNoise;
varying float vPulse;

float random(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453);
}

void main() {

  vec3 pos = position;

  // Ruído base fixo por partícula
  vNoise = random(pos);

  // --------------------
  // VIDA / RESPIRAÇÃO
  // --------------------
  float timeOffset = uTime * 0.6 + vNoise * 10.0;

  // Pulsação orgânica
  vPulse = sin(timeOffset) * 0.5 + 0.5;

  // Drift suave
  pos.x += sin(timeOffset + pos.y * 0.03) * 0.4;
  pos.y += cos(timeOffset + pos.x * 0.03) * 0.4;
  pos.z += sin(timeOffset * 0.7) * 0.6;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  vDepth = smoothstep(30.0, 200.0, -mvPosition.z);

  // Tamanho VIVO
  gl_PointSize =
    uSize *
    mix(0.6, 1.8, vNoise) *
    mix(0.7, 1.3, vPulse) *
    (1.0 - vDepth) *
    (120.0 / -mvPosition.z);

  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform float uBrightness;

varying float vDepth;
varying float vNoise;
varying float vPulse;

void main() {
  float dist = distance(gl_PointCoord, vec2(0.5));
  float alpha = 1.0 - smoothstep(0.25, 0.5, dist);

  // Fade por profundidade
  alpha *= (1.0 - vDepth);

  // Flicker sutil
  alpha *= mix(0.85, 1.15, vPulse);

  // Glow mais suave
  alpha = pow(alpha, 1.3);

  // Cores com vida
  vec3 nearColor = vec3(1.0, 0.92, 0.75);
  vec3 farColor  = vec3(0.15, 0.28, 0.25);

  // Micro variação cromática
  vec3 color = mix(
    nearColor,
    farColor,
    vDepth + vNoise * 0.2 + vPulse * 0.05
  );

  gl_FragColor = vec4(color, alpha * uBrightness);
}
`;

// --------------------
// MATERIAL
// --------------------
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime: { value: 0 },
    uSize: { value: 4.0 },
    uBrightness: { value: 4.0 },
    uProgress: { value: 0 }
  }
});

// --------------------
// PARTÍCULAS (PLACEHOLDER)
// --------------------
let particles;
const geometry = new THREE.BufferGeometry();

particles = new THREE.Points(geometry, material);
scene.add(particles);

// --------------------
// IMAGENS → FORMAS
// --------------------
const images = ['./dna.png'];
let shapes = [];
let currentShape = 0;

Promise.all(images.map(loadImage)).then(imgs => {
  shapes = imgs.map(img => imageToPositions(img));
  initGeometry(shapes[0], shapes[0]);
});

// --------------------
// FUNÇÕES
// --------------------
function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

function imageToPositions(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const size = 256;
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  const positions = [];

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const i = (y * size + x) * 4;
      if (data[i] > 20) {
        positions.push(
          (x - size / 2) * 0.6,
          (size / 2 - y) * 0.6,
          (Math.random() - 0.5) * 20
        );
      }
    }
  }

  return positions;
}

function initGeometry(base, target) {
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(base, 3));
  geometry.setAttribute('aTarget', new THREE.Float32BufferAttribute(target, 3));
}

// --------------------
// MORPH (troca de forma)
// --------------------
function morphTo(index) {
  geometry.setAttribute(
    'aTarget',
    new THREE.Float32BufferAttribute(shapes[index], 3)
  );

  material.uniforms.uProgress.value = 0;

  const duration = 1.8;
  let start = performance.now();

  function animateMorph(now) {
    let t = (now - start) / (duration * 1000);
    t = Math.min(t, 1);
    material.uniforms.uProgress.value = t * t * (3 - 2 * t);
    if (t < 1) requestAnimationFrame(animateMorph);
  }

  requestAnimationFrame(animateMorph);
}

// --------------------
// MOUSE / CÂMERA
// --------------------
const mouse = { x: 0, y: 0 };

window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// --------------------
// LOOP
// --------------------
const clock = new THREE.Clock();

function animate() {
  material.uniforms.uTime.value = clock.getElapsedTime();

  camera.position.x += (mouse.x * 20 - camera.position.x) * 0.05;
  camera.position.y += (mouse.y * 20 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// --------------------
// RESIZE
// --------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
