import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const ColorBlindShader = {
    uniforms: { tDiffuse: { value: null }, uMatrix: { value: new THREE.Matrix3() } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform mat3 uMatrix; varying vec2 vUv; void main() { vec4 color = texture2D(tDiffuse, vUv); vec3 corrected = uMatrix * color.rgb; gl_FragColor = vec4(corrected, color.a); }`
};


const COLOR_FILTERS = {
    normal: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    protanopia: [0.56667, 0.43333, 0.0, 0.55833, 0.44167, 0.0, 0.0, 0.24167, 0.75833],
    deuteranopia: [0.625, 0.375, 0.0, 0.70, 0.30, 0.0, 0.0, 0.30, 0.70],
    tritanopia: [0.95, 0.05, 0.0, 0.0, 0.43333, 0.56667, 0.0, 0.475, 0.525]
};

let scene, camera, renderer, controls, composer, colorPass, modelId;
let highlightMesh = null;
let models = [];
let objectData = {};

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const params = new URLSearchParams(window.location.search);

modelId = params.get('id');

async function initViewer() {
    if (params.get('theme') === 'dark') document.body.classList.add('dark-mode');
    if (params.get('modal') === 'true') document.body.classList.add('is-modal');
    if (!modelId) return;

    try {

        const response = await fetch(`models/${modelId}.json`);

        objectData = await response.json();

        document.getElementById('det-title').textContent = objectData.objname;
        document.getElementById('det-bc').textContent = objectData.objname;
        document.getElementById('det-sys').textContent = objectData.objsystem;
        document.querySelector('.desc-tx').innerHTML = `<p>${objectData.objdescription}</p>`;       

        const tagsCont = document.getElementById('det-tags');

        if(tagsCont) tagsCont.innerHTML = `<span class="tag">ID: #${modelId}</span><span class="tag">${objectData.objsystem}</span>`;

        renderizarCapitulos(objectData);

        initThree();

        load3DModel(modelId);

    } catch (e) { console.error("Erro no setup:", e); }

    window.focus();
}


function initThree() {

    const container = document.getElementById('three-container');
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    if (height === 0) {
        requestAnimationFrame(initThree);
        return;
    }

    scene = new THREE.Scene();   

    const isDark = document.body.classList.contains('dark-mode');

    scene.background = new THREE.Color(isDark ? 0x0f172a : 0xf2f2f2);
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 2, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);

    dirLight.position.set(5, 10, 7);

    scene.add(dirLight);


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

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    animate();
}


function load3DModel(id) {
    const loader = new GLTFLoader();
    loader.load(`models/${id}.glb`, (gltf) => {
        
        gltf.scene.traverse(obj => {
            if (obj.isLight) {
                obj.intensity *= 1.0;
            }

            if (obj.isMesh && obj.material) {
                if (obj.material.opacity < 1) {
                    obj.material.transparent = true;
                    obj.material.depthWrite = false;
                }
                if (obj.material.emissiveIntensity !== undefined) {
                    // obj.material.emissiveIntensity = 2.0; 
                }
            }
        });

        scene.add(gltf.scene);
        models.push(gltf.scene);

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());       

        document.getElementById('loading-3d').style.display = 'none';
    });
}

function renderizarCapitulos(data) {
    const container = document.getElementById('tc-ch');
    const ignoreKeys = ['objname', 'objsystem', 'objdescription', 'id'];
    const html = Object.keys(data)

        .filter(key => !ignoreKeys.includes(key))

        .map(key => `

            <div class="ch-item" onclick="focarParte('${key}')">
                <div>
                    <div class="ch-name">${data[key].objname || key}</div>
                    <div class="ch-desc">${data[key].description || ''}</div>
                </div>
            </div>`).join('');   

    container.innerHTML = html || '<p>Nenhum capítulo disponível.</p>';
}


window.focarParte = (id) => {
    const data = objectData[id];

    if (data) {
        window.swTab('desc', document.querySelector('.tab-btn')); // Vai para aba descrição

        document.querySelector('.desc-tx').innerHTML = `
            <h3>${data.objname || id}</h3>
            <p>${data.description || 'Sem descrição.'}</p>
            <button class="dp-act" onclick="resetScene()">Voltar ao Geral</button>
        `;

        scene.traverse(obj => {

            if(obj.isMesh && obj.name === id) highlightObject(obj);
        });
    }
};


window.resetScene = () => {
    clearHighlight();
    setDefaultCamera();
    camera.position.set(0, 2, 3);
    document.querySelector('.desc-tx').innerHTML = `<p>${objectData.objdescription}</p>`;
};


function setDefaultCamera() {
  camera.position.set(0, 2, 3);
  controls.target.set(0, 1, 0);
  controls.update();
}


window.swTab = (id, btn) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    if(btn) btn.classList.add('active');
    ['ch', 'desc', 'res'].forEach(t => {
        const el = document.getElementById('tc-' + t);
        if (el) el.style.display = (t === id) ? 'block' : 'none';
    });
};


window.setColorBlindMode = (mode) => {
    const m = COLOR_FILTERS[mode] || COLOR_FILTERS.normal;
    colorPass.uniforms.uMatrix.value.set(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]);
};


window.toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
};


window.shareModel = (btnEl) => {
    const url = new URL(window.location.href);

    url.searchParams.delete('modal');

    navigator.clipboard.writeText(url.toString()).then(() => {
        const original = btnEl.innerHTML;
        btnEl.innerHTML = '✅ Copiado!';
        btnEl.classList.add('copied');
        setTimeout(() => { btnEl.innerHTML = original; btnEl.classList.remove('copied'); }, 2000);
    });
};

function onPointerDown(event) {
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(models, true);

    if (intersects.length > 0) {
        const selected = intersects[0].object;
        window.focarParte(selected.name);
    }
}


function highlightObject(object) {
    clearHighlight();

    highlightMesh = new THREE.Mesh(
        object.geometry.clone(),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.35, side: THREE.BackSide, depthWrite: false })
    );

    highlightMesh.position.copy(object.getWorldPosition(new THREE.Vector3()));
    highlightMesh.quaternion.copy(object.getWorldQuaternion(new THREE.Quaternion()));
    highlightMesh.scale.copy(object.getWorldScale(new THREE.Vector3())).multiplyScalar(1.03);

    scene.add(highlightMesh);
}


function clearHighlight() {
    if (highlightMesh) {
        highlightMesh.geometry.dispose();
        highlightMesh.material.dispose();
        scene.remove(highlightMesh);
        highlightMesh = null;
    }
}


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}


window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (window.parent && typeof window.parent.closeDet === 'function') {
            window.parent.closeDet();
        }
    }
});


window.addEventListener('resize', () => {
    const container = document.getElementById('three-container');

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.offsetWidth, container.offsetHeight);
    composer.setSize(container.offsetWidth, container.offsetHeight);
});

initViewer(); 