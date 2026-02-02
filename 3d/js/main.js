import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const urlParam = new URLSearchParams(window.location.search);
const MODEL_NAME = urlParam.keys().next().value;

if (!MODEL_NAME) {
  alert('Nenhum modelo especificado na URL');
  throw new Error('Modelo não informado');
}

let scene, camera, renderer, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let highlightMesh = null;

const models = [];
let selectedObject = null;
let objectData = {}; // ✅ AGORA GLOBAL

init();
loadModels();
loadDescriptions();
animate();

/* ---------------- INIT ---------------- */
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2f2f2);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;

  setDefaultCamera();

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('resize', onResize);

  document.getElementById('resetBtn').onclick = resetScene;
  document.getElementById('hideObject').onclick = hideSelected;
}

/* ---------------- LOAD 3D ---------------- */
function loadModels() {
  const loader = new GLTFLoader();

  const files = [`models/${MODEL_NAME}.glb`];

  files.forEach((file) => {
    loader.load(file, (gltf) => {
      gltf.scene.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
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

  const intersects = raycaster.intersectObjects(models, true);

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

  const id = mesh.name;
  const data = objectData[id];

  titleEl.innerText = data?.title || formatObjectName(id);
  descEl.innerText = data?.description || 'Sem descrição cadastrada.';

  panel.style.display = 'block';
}

/* ---------------- HIDE ---------------- */
function hideSelected() {
  if (!selectedObject || !selectedObject.isMesh) return;

  selectedObject.visible = false;

  document.getElementById('infoPanel').style.display = 'none';
  selectedObject = null;
  clearHighlight();
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

  if (!object.geometry) return;

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
}

/* ---------------- LOOP ---------------- */
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
