import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const params = new URLSearchParams(window.location.search);

const MODEL_NAME = params.keys().next().value;
const IS_DARK_MODE = params.has('dark');

if (!MODEL_NAME) {
  alert('Nenhum modelo especificado na URL');
  throw new Error('Modelo não informado');
}

if (!MODEL_NAME) {
  alert('Nenhum modelo especificado na URL');
  throw new Error('Modelo não informado');
}

const ColorBlindShader = {
  uniforms: {
    tDiffuse: { value: null },
    uMatrix: { value: new THREE.Matrix3() }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform mat3 uMatrix;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec3 corrected = uMatrix * color.rgb;
      gl_FragColor = vec4(corrected, color.a);
    }
  `
};

const COLOR_FILTERS = {
  normal: [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ],

  protanopia: [
    0.56667, 0.43333, 0.0,
    0.55833, 0.44167, 0.0,
    0.0,     0.24167, 0.75833
  ],

  deuteranopia: [
    0.625, 0.375, 0.0,
    0.70,  0.30,  0.0,
    0.0,   0.30,  0.70
  ],

  tritanopia: [
    0.95, 0.05, 0.0,
    0.0,  0.43333, 0.56667,
    0.0,  0.475,   0.525
  ]
};

let scene, camera, renderer, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let highlightMesh = null;
let composer, colorPass;

const models = [];
let selectedObject = null;
let objectData = {};

init();
loadModels();
loadDescriptions();
animate();

/* ---------------- INIT ---------------- */
function init() {
  scene = new THREE.Scene();

  if (IS_DARK_MODE) {
    document.body.classList.add('dark');
    scene.background = new THREE.Color(0x313131);
  } else {
    scene.background = new THREE.Color(0xf2f2f2);
  }

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 2, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const dir = new THREE.DirectionalLight(0xffffff, 1.6);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
  fillLight.position.set(-5, 4, -5);
  scene.add(fillLight);

  const hemi = new THREE.HemisphereLight(
  0xffffff,
  0x444444,
  0.6
);
scene.add(hemi);


  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  colorPass = new ShaderPass(ColorBlindShader);
  composer.addPass(colorPass);
  setColorBlindMode('normal');

  setDefaultCamera();

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('resize', onResize);

  document.getElementById('hideObject').onclick = hideSelected;
}

function setColorBlindMode(mode) {
  const m = COLOR_FILTERS[mode] || COLOR_FILTERS.normal;

  colorPass.uniforms.uMatrix.value.set(
    m[0], m[1], m[2],
    m[3], m[4], m[5],
    m[6], m[7], m[8]
  );
}

document.getElementById('colorFilter').addEventListener('change', e => {
  setColorBlindMode(e.target.value);
});

/* ---------------- LOAD 3D ---------------- */
function loadModels() {
  const loader = new GLTFLoader();

  const files = [`models/${MODEL_NAME}.glb`];

  files.forEach((file) => {
    loader.load(file, (gltf) => {
      gltf.scene.traverse(obj => {
      if (obj.isMesh && obj.material) {
        const mat = obj.material;
        
        /*console.log(obj.material.name)*/
        
        if (obj.isMesh && obj.material.name === '01 - Default.005') {
          obj.material.transparent = true;
          obj.material.opacity = 0.6;
          obj.material.depthWrite = false;
        }

        if (mat.opacity < 1) {
          mat.transparent = true;
          mat.depthWrite = false;
          mat.needsUpdate = true;
        }
      }
    });

      scene.add(gltf.scene);
      models.push(gltf.scene);
    });
  });
}

/* ---------------- LOAD JSON ---------------- */
function loadDescriptions() {
  fetch(`models/${MODEL_NAME}.json`)
    .then(res => res.json())
    .then(data => {
      objectData = data;
      console.log('Descrições carregadas', objectData);
    });
}

/* ---------------- CLICK ---------------- */
function onPointerDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster
  .intersectObjects(models, true)
  .filter(i => i.object.visible && !i.object.userData.hidden);

  if (!intersects.length) return;

  selectedObject = intersects[0].object;

  showObjectInfo(selectedObject);
  highlightObject(selectedObject);
}

/* ---------------- INFO PANEL ---------------- */
function showObjectInfo(mesh) {
  const panel = document.getElementById('infoPanel');
  const titleEl = document.getElementById('infoTitle');
  const descEl = document.getElementById('infoDesc');
  const hideBtn = document.getElementById('hideObject');

  const id = mesh.name;
  const data = objectData[id];

  titleEl.innerText = data?.objname || formatObjectName(id);
  descEl.innerText = data?.description || 'Sem descrição cadastrada.';

  hideBtn.style.display = 'block';

  panel.style.display = 'block';
}

/* ---------------- HIDE ---------------- */
function hideSelected() {
  if (!selectedObject || !selectedObject.isMesh) return;

  selectedObject.visible = false;
  selectedObject.userData.hidden = true;

  clearHighlight();

  document.getElementById('infoPanel').style.display = 'none';
  selectedObject = null;
}

/* ---------------- RESET ---------------- */
function resetScene() {
  models.forEach(model => {
    model.visible = true;

    model.traverse(obj => {
      if (obj.isMesh) {
        obj.visible = true;
      }
    });

    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
  });

  clearHighlight();
  setDefaultCamera();

  document.getElementById('infoPanel').style.display = 'none';
  selectedObject = null;
}


/* ---------------- HIGHLIGHT ---------------- */
function highlightObject(object) {
  clearHighlight();

  if (!object.visible) return;
  clearHighlight();

  highlightMesh = new THREE.Mesh(
    object.geometry.clone(),
    new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
      depthWrite: false
    })
  );

  highlightMesh.position.copy(object.getWorldPosition(new THREE.Vector3()));
  highlightMesh.quaternion.copy(object.getWorldQuaternion(new THREE.Quaternion()));
  highlightMesh.scale
    .copy(object.getWorldScale(new THREE.Vector3()))
    .multiplyScalar(1.03);

  scene.add(highlightMesh);
}

function clearHighlight() {
  if (!highlightMesh) return;

  highlightMesh.geometry.dispose();
  highlightMesh.material.dispose();
  scene.remove(highlightMesh);
  highlightMesh = null;
}

/* ---------------- UTILS ---------------- */
function formatObjectName(name) {
  if (!name) return 'Parte sem nome';

  return name.replace(/_/g, ' ').trim();
}

function setDefaultCamera() {
  camera.position.set(0, 2, 3);
  controls.target.set(0, 1, 0);
  controls.update();
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

/* ---------------- LOOP ---------------- */
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  composer.render();
}

document.getElementById('infoBtn').onclick = () => {
  const panel = document.getElementById('infoPanel');
  const titleEl = document.getElementById('infoTitle');
  const descEl = document.getElementById('infoDesc');
  const hideBtn = document.getElementById('hideObject');

  titleEl.innerText = objectData.objname || formatObjectName(MODEL_NAME);
  descEl.innerText = objectData.objdescription || 'Sem descrição geral.';

  hideBtn.style.display = 'none';

  panel.style.display = 'block';
};


document.getElementById('closeInfo').onclick = () => {
  document.getElementById('infoPanel').style.display = 'none';
  clearHighlight();
};

const fsBtn = document.getElementById('fullscreenBtn');
const exitFsBtn = document.getElementById('exitFullscreenBtn');

fsBtn.onclick = () => {
  document.documentElement.requestFullscreen();
  fsBtn.style.display = 'none';
  exitFsBtn.style.display = 'block';
};

exitFsBtn.onclick = () => {
  document.exitFullscreen();
  exitFsBtn.style.display = 'none';
  fsBtn.style.display = 'block';
};

document.getElementById('resetBtnIcon').onclick = resetScene;

function setUIColorFilter(mode) {
  document.body.classList.remove(
    'filter-protanopia',
    'filter-deuteranopia',
    'filter-tritanopia'
  );

  if (mode !== 'normal') {
    document.body.classList.add(`filter-${mode}`);
  }
}

document.getElementById('colorFilter').addEventListener('change', e => {
  const mode = e.target.value;

  setColorBlindMode(mode);
  setUIColorFilter(mode);
});
