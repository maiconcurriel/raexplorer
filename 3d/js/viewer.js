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
let selectedObject = null;
let originalEmissive = new THREE.Color();
let isIsolatedMode = false;
let visibilidadeAntesDoIsolamento = {};

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

        renderizarRecursosGlobais(objectData);

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
                    //obj.material.emissiveIntensity = 2.0;
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
    const ignoreKeys = ['objname', 'objsystem', 'objdescription', 'id', 'resources'];
    
    const html = Object.keys(data)
        .filter(key => {
            const isNotIgnored = !ignoreKeys.includes(key);
            const hasDescription = data[key] && data[key].description && data[key].description.trim() !== "";
            
            return isNotIgnored && hasDescription;
        })
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
    if (!data) return;

    if (isIsolatedMode && selectedObject && selectedObject.name === id) {
        renderButtons(id, data);
        return; 
    }

    if (isIsolatedMode) {
        isolarObjeto(id); 
    } else {
        scene.traverse(obj => {
            if(obj.isMesh && obj.name === id) {
                highlightObject(obj);
            }
        });
        renderButtons(id, data);
    }

    window.swTab('desc', document.querySelector('.tab-btn'));
    if (typeof renderizarRecursos === 'function') renderizarRecursos(data);
};


window.resetScene = () => {
    isIsolatedMode = false;
    clearHighlight();
    selectedObject = null;

    scene.traverse(obj => {
        if (obj.isMesh) obj.visible = true;
    });

    setDefaultCamera();
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
    const intersects = raycaster.intersectObjects(models, true).filter(i => i.object.visible);

    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        window.focarParte(clicked.name);
    } else {
        if (!isIsolatedMode) {
            clearHighlight();
            selectedObject = null;
            document.querySelector('.desc-tx').innerHTML = `<p>${objectData.objdescription}</p>`;
        }
    }
}


function highlightObject(object) {
    if (isIsolatedMode) return;

    if (selectedObject && selectedObject.material) {
        selectedObject.material.emissive.copy(originalEmissive);
        selectedObject.material.emissiveIntensity = 0.5;
    }

    selectedObject = object;

    if (selectedObject.material) {
        selectedObject.material = selectedObject.material.clone();
        originalEmissive.copy(selectedObject.material.emissive);
        
        selectedObject.material.emissive.setHex(0xffffff); 
        selectedObject.material.emissiveIntensity = 0.2; 
        
        selectedObject.material.transparent = false;
        selectedObject.material.opacity = 0.8; 
    }
}

function clearHighlight() {
    if (selectedObject && selectedObject.material) {
        selectedObject.material.emissive.copy(originalEmissive);
        selectedObject.material.emissiveIntensity = 1.0;
    }
}

window.isolarObjeto = (id) => {
    const targetObj = id ? scene.getObjectByName(id) : selectedObject;
    if (!targetObj) return;

    visibilidadeAntesDoIsolamento = {};
    scene.traverse(obj => {
        if (obj.isMesh) {
            visibilidadeAntesDoIsolamento[obj.name] = obj.visible;
        }
    });

    const data = objectData[targetObj.name];
    clearHighlight();
    selectedObject = targetObj;
    isIsolatedMode = true;

    scene.traverse(obj => {
        if (obj.isMesh) {
            obj.visible = (obj.name === targetObj.name);
        }
    });

    renderButtons(targetObj.name, data);
    window.aproximarObjeto(targetObj.name);
};

window.voltarDoIsolamento = (id) => {
    isIsolatedMode = false;

    scene.traverse(obj => {
        if (obj.isMesh && visibilidadeAntesDoIsolamento[obj.name] !== undefined) {
            obj.visible = visibilidadeAntesDoIsolamento[obj.name];
        }
    });
    
    setDefaultCamera();

    const data = objectData[id];
    renderButtons(id, data);
};

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}

const RESOURCE_CONFIG = {
    pdf: { icon: '📄', color: '#f1f5f9' },
    doc: { icon: '📄', color: '#f1f5f9' },
    video: { icon: '🎥', color: 'var(--accent2-lt)' },
    image: { icon: '📊', color: '#f0eef8' },
    link: { icon: '🔗', color: '#fef5ec' },
    podcast: { icon: '🎙️', color: '#eefcf0' }
};

function renderizarRecursosGlobais(data) {
    const container = document.getElementById('tc-res');
    if (!container || !data.resources) return;

    container.innerHTML = data.resources.map(res => {
        const config = RESOURCE_CONFIG[res.type] || RESOURCE_CONFIG.link;
        return `
            <div class="res-item" onclick='abrirMedia(${JSON.stringify(res)})'>
                <div class="res-ic" style="background:${config.color}">${config.icon}</div>
                <div>
                    <div class="res-name">${res.name}</div>
                    <div class="res-type">${res.info}</div>
                </div>
            </div>
        `;
    }).join('');
}

window.abrirMedia = (res) => {
    const modal = document.getElementById('media-modal');
    const body = document.getElementById('modal-body');
    const title = document.getElementById('modal-title');
    
    title.innerText = res.name;
    body.innerHTML = ''; 

    const isExternal = res.url.startsWith('http');
    const finalPath = isExternal ? res.url : `models/${res.url}`;

    if (res.type === 'video') {
        let embedUrl = finalPath;
        
        // Mantemos a conversão para Embed caso seja link externo de YouTube/Vimeo
        if (isExternal) {
            if (res.url.includes('youtube.com/watch?v=')) {
                embedUrl = res.url.replace('watch?v=', 'embed/');
            } else if (res.url.includes('vimeo.com/')) {
                embedUrl = res.url.replace('vimeo.com/', 'player.vimeo.com/video/');
            }
        }

        body.innerHTML = `
            <iframe src="${embedUrl}" 
                style="width:100%; aspect-ratio:16/9; border:none; display:block;" 
                allowfullscreen>
            </iframe>`;
    } 
    else if (res.type === 'image') {
        body.innerHTML = `
            <img src="${finalPath}" 
                style="display:block; max-height:80vh; width:100%; object-fit:contain; border:none;" 
            />`;
    }
    else if (res.type === 'podcast') {
        body.innerHTML = `
            <div style="padding: 40px; background: #f8f9fa; display: flex; justify-content: center;">
                <audio controls src="${finalPath}" style="width: 100%;"></audio>
            </div>`;
    }
    else {
        // PDF, DOC e outros continuam abrindo em nova aba
        window.open(finalPath, '_blank');
        return;
    }

    modal.style.display = 'flex';
};

window.closeMediaModal = () => {
    const modal = document.getElementById('media-modal');
    const body = document.getElementById('modal-body');
    body.innerHTML = '';
    modal.style.display = 'none';
};

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

window.toggleVisibility = (id, action) => {
    scene.traverse(obj => {
        if (obj.isMesh && obj.name === id) {
            obj.visible = (action === 'show');
        }
    });
    
    const data = objectData[id];
    renderButtons(id, data);
};

function renderButtons(id, data) {
    let isVisible = true;
    scene.traverse(obj => {
        if (obj.isMesh && obj.name === id) isVisible = obj.visible;
    });

    let botoesHtml = "";

    if (isIsolatedMode) {
        botoesHtml = `
            <button class="dp-act" style="background:#555; color:#fff;" onclick="resetScene()">Geral</button>
            <button class="dp-act" style="background:#f1c40f; color:#000;" onclick="voltarDoIsolamento('${id}')">Voltar</button>
        `;
    } else {
        const hideShowBtn = isVisible 
            ? `<button class="dp-act btn-hide" onclick="toggleVisibility('${id}', 'hide')">Esconder</button>`
            : `<button class="dp-act btn-show" onclick="toggleVisibility('${id}', 'show')">Mostrar</button>`;

        botoesHtml = `
            <button class="dp-act" style="background:#555; color:#fff;" onclick="resetScene()">Geral</button>
            <button class="dp-act" style="background:#00ffff; color:#000;" onclick="isolarObjeto('${id}')">Isolar</button>
            ${hideShowBtn}
        `;
    }

    let htmlContent = `
        <h3>${data.objname || id}</h3>
        <p>${data.description || 'Sem descrição.'}</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
            ${botoesHtml}
        </div>
    `;

    document.querySelector('.desc-tx').innerHTML = htmlContent;
}

window.aproximarObjeto = (id) => {
    const targetObj = scene.getObjectByName(id);
    if (!targetObj) return;

    const box = new THREE.Box3().setFromObject(targetObj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;

    controls.target.copy(center);
    
    camera.position.set(center.x, center.y, center.z + cameraZ);
    
    controls.update();
};

initViewer(); 