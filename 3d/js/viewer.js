import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

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
let mixer, clock;
let currentAction = null;
let isLooping = true;
let animationSpeed = 1.0;
let isPaused = false;
let animContainer = null;
let isProgressBarDragging = false;
let previousModelId = null;
let isSecondaryModel = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const params = new URLSearchParams(window.location.search);
const gltfLoader = new GLTFLoader();
const modelCache = new Map();
const jsonCache = new Map();

modelId = params.get('id');

async function initViewer() {
    if (params.get('theme') === 'dark') document.body.classList.add('dark-mode');
    if (params.get('modal') === 'true') document.body.classList.add('is-modal');
    if (!modelId) return;

    clock = new THREE.Clock();

    try {

        objectData = await loadObjectData(modelId);

        document.getElementById('det-title').textContent = objectData.objname;
        document.getElementById('det-bc').textContent = objectData.objname;
        document.getElementById('det-sys').textContent = objectData.objsystem;
        document.querySelector('.desc-tx').innerHTML = parseDescriptionMedia(objectData.objdescription);

        const tagsCont = document.getElementById('det-tags');

        if(tagsCont) tagsCont.innerHTML = `<span class="tag">ID: #${modelId}</span><span class="tag">${objectData.objsystem}</span>`;

        renderizarCapitulos(objectData);

        renderizarRecursosGlobais(objectData);

        atualizarBotaoModeloSecundario();

        if (objectData.linkedModel?.id) {

            preloadModel(objectData.linkedModel.id);

        }

        initThree();

        load3DModel(modelId);

    } catch (e) { console.error("Erro no setup:", e); }

    window.focus();
}


function initThree() {
    const container = document.getElementById('three-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (height === 0) {
        setTimeout(initThree, 100);
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
    controls.dampingFactor = 0.03;
    controls.screenSpacePanning = true;
    controls.enablePan = true;

    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    };

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

    const finishSetup = (gltf) => {

        const model = SkeletonUtils.clone(gltf.scene);

        model.traverse(obj => {

            if (obj.isMesh) {

                obj.castShadow = false;
                obj.receiveShadow = false;

                obj.frustumCulled = false;
            }
        });

        scene.add(model);

        models.push(model);

        const loadingEl = document.getElementById('loading-3d');

        if (loadingEl) {

            loadingEl.style.display = 'none';

        }

        if (gltf.animations && gltf.animations.length > 0) {

            mixer = new THREE.AnimationMixer(model);

            currentAction = mixer.clipAction(gltf.animations[0]);

            currentAction.clampWhenFinished = true;

            currentAction.setLoop(
                isLooping ? THREE.LoopRepeat : THREE.LoopOnce
            );

            currentAction.play();

            isPaused = false;

            injectAnimationControls();

            mixer.addEventListener('finished', (e) => {

                if (e.action === currentAction && !isLooping) {

                    isPaused = true;

                    updatePlayPauseUI();

                }
            });

        } else {

            removeAnimationControls();

        }
    };

    // =========================
    // USA CACHE SE EXISTIR
    // =========================

    if (modelCache.has(id)) {

        console.log(`[CACHE] Modelo ${id} carregado do cache`);

        finishSetup(modelCache.get(id));

        return;
    }

    // =========================
    // CARREGAMENTO NORMAL
    // =========================

    gltfLoader.load(

        `models/${id}.glb`,

        (gltf) => {

            modelCache.set(id, gltf);

            finishSetup(gltf);

        },

        undefined,

        (error) => {

            console.error("Erro ao carregar GLB:", error);

        }
    );
}

function injectAnimationControls() {
    const bar = document.querySelector('.v-bot-bar');
    if (!bar || document.getElementById('anim-group')) return; // Evita duplicar

    const animControlsHTML = `
        <div id="anim-group" style="display: flex; align-items: center; gap: 10px; flex-grow: 1; margin: 0 15px;">
            <div class="bt-sep"></div>
            <button class="bt-btn" id="btn-play" title="Play/Pause" onclick="window.togglePlayPause()">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <input type="range" id="anim-progress" min="0" max="100" value="0" step="0.1" 
                style="flex-grow: 1; cursor: pointer; height: 4px; accent-color: #00ffff;">
            <button class="bt-btn" id="btn-loop" title="Alternar Loop" onclick="window.toggleLoop()" style="color: #00ffff;">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4M7 23l-4-4 4-4M21 13a9 9 0 0 1-18 0m0-2a9 9 0 0 1 18 0"/></svg>
            </button>
            <select class="sort-sel" onchange="window.changeSpeed(this.value)" style="width: 60px; padding: 2px;">
                <option value="1">1x</option>
                <option value="0.5">0.5x</option>
                <option value="0.25">0.25x</option>
            </select>
        </div>
    `;

    const colorSelect = bar.querySelector('select');
    if (colorSelect) colorSelect.insertAdjacentHTML('afterend', animControlsHTML);

    const progressBar = document.getElementById('anim-progress');
    if (!progressBar) return;

    progressBar.addEventListener('pointerdown', () => {
        isProgressBarDragging = true;
    });

    progressBar.addEventListener('pointerup', () => {
    isProgressBarDragging = false;

        if (currentAction) {
            currentAction.paused = isPaused;
        }
    });

    progressBar.addEventListener('pointerleave', () => {
        isProgressBarDragging = false;
    });

    progressBar.addEventListener('input', (e) => {
    if (!currentAction || !mixer) return;

        isProgressBarDragging = true;

        const duration = currentAction.getClip().duration;
        const targetTime = (parseFloat(e.target.value) / 100) * duration;

        currentAction.paused = false;

        mixer.setTime(targetTime);

        mixer.update(0);
    });

    progressBar.addEventListener('change', () => { 
        isProgressBarDragging = false;
        
        if (!isPaused && currentAction) {
            currentAction.paused = false;
        }
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

    if (currentAction) {
        currentAction.reset();
        currentAction.play();
        isPaused = false;
        updatePlayPauseUI(); // Adicione isso aqui
    }

    scene.traverse(obj => {
        if (obj.isMesh) obj.visible = true;
    });

    document.querySelector('.desc-tx').innerHTML = `
        ${parseDescriptionMedia(objectData.objdescription)}
    `;

    window.swTab('desc', document.querySelector('.tab-btn'));

    setDefaultCamera();
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

    if (event.button !== 0) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(models, true).filter(i => i.object.visible);

    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        window.focarParte(clicked.name);
    } else {
        /*if (!isIsolatedMode) {
            clearHighlight();
            selectedObject = null;
            document.querySelector('.desc-tx').innerHTML = parseDescriptionMedia(objectData.objdescription);
        }*/
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

    const targetObj = id
        ? scene.getObjectByName(id)
        : selectedObject;

    if (!targetObj) return;

    visibilidadeAntesDoIsolamento = {};

    scene.traverse(obj => {

        if (obj.isMesh || obj.isSkinnedMesh) {

            visibilidadeAntesDoIsolamento[obj.uuid] = obj.visible;

        }
    });

    const data = objectData[targetObj.name];

    clearHighlight();

    selectedObject = targetObj;

    isIsolatedMode = true;

    // =========================
    // PEGA OBJETO PAI
    // =========================

    let root = targetObj;

// sobe apenas até encontrar um Group útil
while (
    root.parent &&
    root.parent !== scene &&
    !root.parent.isScene
) {

    // para se o pai tiver muitos filhos
    // evitando pegar o modelo inteiro
    if (root.parent.children.length > 5) {
        break;
    }

    root = root.parent;
}

    // =========================
    // ESCONDE TUDO
    // =========================

    scene.traverse(obj => {

    if (obj.isMesh || obj.isSkinnedMesh) {

        obj.visible = false;

    }
});

// =========================
// MOSTRA APENAS O OBJETO
// E SEUS FILHOS
// =========================

targetObj.traverse(obj => {

    if (obj.isMesh || obj.isSkinnedMesh) {

        obj.visible = true;

    }
});

    renderButtons(targetObj.name, data);

    window.aproximarObjeto(targetObj.name);
};

window.voltarDoIsolamento = (id) => {

    isIsolatedMode = false;

    scene.traverse(obj => {

        if (
            (obj.isMesh || obj.isSkinnedMesh) &&
            visibilidadeAntesDoIsolamento[obj.uuid] !== undefined
        ) {

            obj.visible =
                visibilidadeAntesDoIsolamento[obj.uuid];

        }
    });

    setDefaultCamera();

    const data = objectData[id];

    renderButtons(id, data);
};

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    if (mixer) {
        if (isProgressBarDragging) {
            mixer.update(0);
        } 
        else if (!isPaused) {
            mixer.update(delta);
        }

        const progressBar = document.getElementById('anim-progress');
        if (progressBar && currentAction && !isProgressBarDragging) {
            const progress = (mixer.time % currentAction.getClip().duration) / currentAction.getClip().duration * 100;
            progressBar.value = progress;
        }
    }
    
    if (controls) controls.update();
    if (composer) composer.render();
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
        
        if (isExternal) {
            if (res.url.includes('youtube.com/watch?v=')) {
                embedUrl = res.url.replace('watch?v=', 'embed/');
            } else if (res.url.includes('vimeo.com/')) {

                const cleanUrl = res.url.replace(/\/$/, '');

                const parts = cleanUrl.split('/');

                const videoId = parts[3];

                const hash = parts[4];

                embedUrl = hash
                    ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
                    : `https://player.vimeo.com/video/${videoId}`;
            }
        }

        body.innerHTML = `
            <iframe 
                src="${embedUrl}"
                style="width:100%; aspect-ratio:16/9; border:none; display:block;"
                allow="autoplay; fullscreen; picture-in-picture"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
            </iframe>
        `;
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

    if (!camera || !renderer || !composer) return;

    const container = document.getElementById('three-container');

    if (!container) return;

    camera.aspect =
        container.offsetWidth / container.offsetHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        container.offsetWidth,
        container.offsetHeight
    );

    composer.setSize(
        container.offsetWidth,
        container.offsetHeight
    );
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
        ${parseDescriptionMedia(data.description || 'Sem descrição.')}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
            ${botoesHtml}
        </div>
    `;

    document.querySelector('.desc-tx').innerHTML = htmlContent;
}

window.togglePlayPause = () => {
    if (!currentAction) return;

    const duration = currentAction.getClip().duration;

    if (isPaused && currentAction.time >= duration - 0.05) {
        currentAction.time = 0;
        mixer.setTime(0);
    }

    isPaused = !isPaused;
    currentAction.paused = isPaused;

    if (!isPaused) {
        currentAction.play();
    }

    updatePlayPauseUI();
};

function updatePlayPauseUI() {
    const btn = document.getElementById('btn-play');
    if (!btn) return;
    btn.innerHTML = isPaused 
        ? `<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
        : `<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
}

window.toggleLoop = () => {
    if (!currentAction) return;

    isLooping = !isLooping;
    
    currentAction.setLoop(isLooping ? THREE.LoopRepeat : THREE.LoopOnce);
    currentAction.clampWhenFinished = true; 
    
    const btn = document.getElementById('btn-loop');
    if (btn) {
        btn.style.color = isLooping ? "#00ffff" : "#888";
        btn.style.opacity = isLooping ? "1" : "0.5";
    }
};

window.changeSpeed = (val) => {
    if (!mixer) return;
    const speed = parseFloat(val);
    mixer.timeScale = speed;
    
    if (controls) {
        controls.rotateSpeed = speed < 1 ? 0.5 : 1.0;
    }
};

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

function parseDescriptionMedia(description = '') {

    let embedHtml = '';
    let cleanText = description;

    const ytMatch = description.match(
        /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+))/i
    );

    if (ytMatch) {

        const videoId = ytMatch[2];

        embedHtml = `
            <iframe
                src="https://www.youtube.com/embed/${videoId}"
                style="width:100%; aspect-ratio:16/9; border:none; border-radius:12px; margin-bottom:15px;"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen>
            </iframe>
        `;

        cleanText = cleanText.replace(ytMatch[1], '').trim();
    }

    const vimeoMatch = description.match(
        /https?:\/\/(?:www\.)?vimeo\.com\/(\d+)(?:\/([a-zA-Z0-9]+))?/i
    );

    if (vimeoMatch) {

        const videoId = vimeoMatch[1];
        const hash = vimeoMatch[2];

        const embedUrl = hash
            ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
            : `https://player.vimeo.com/video/${videoId}`;

        embedHtml = `
            <iframe
                src="${embedUrl}"
                style="width:100%; aspect-ratio:16/9; border:none; border-radius:12px; margin-bottom:15px;"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen>
            </iframe>
        `;

        cleanText = cleanText.replace(vimeoMatch[0], '').trim();
    }

    return `
        ${embedHtml}
        <p>${cleanText}</p>
    `;
}

async function carregarNovoModelo(id, voltar = false) {

    previousModelId = voltar ? null : modelId;

    modelId = id;

    models.forEach(model => {

        scene.remove(model);

    });

    models = [];

    if (mixer) {
        mixer.stopAllAction();
        mixer = null;
    }

    currentAction = null;

    removeAnimationControls();

    isPaused = false;
    isLooping = true;

    try {

        objectData = await loadObjectData(modelId);

        document.getElementById('det-title').textContent = objectData.objname;
        document.getElementById('det-bc').textContent = objectData.objname;
        document.getElementById('det-sys').textContent = objectData.objsystem;

        document.querySelector('.desc-tx').innerHTML =
            parseDescriptionMedia(objectData.objdescription);

        renderizarCapitulos(objectData);

        renderizarRecursosGlobais(objectData);

        atualizarBotaoModeloSecundario();

        if (objectData.linkedModel?.id) {

            preloadModel(objectData.linkedModel.id);

        }

        load3DModel(modelId);

        resetScene();

    } catch (e) {

        console.error("Erro ao carregar novo modelo:", e);

    }
}

function atualizarBotaoModeloSecundario() {

    const btn = document.getElementById('btn-linked-model');

    if (!btn) return;

    if (previousModelId) {

        btn.style.display = 'flex';

        btn.innerHTML = '⬅️';

        btn.title = 'Voltar ao modelo principal';

        btn.onclick = () => {

            carregarNovoModelo(previousModelId, true);

        };

        return;
    }

    if (objectData.linkedModel) {

        btn.style.display = 'flex';

        btn.innerHTML = '<img src="css/icone.png" alt="Logo BioExplora" class="logo-img">';

        btn.title =
            objectData.linkedModel.label || 'Modelo relacionado';

        btn.onclick = () => {

            carregarNovoModelo(objectData.linkedModel.id);

        };

    } else {

        btn.style.display = 'none';

    }
}

function removeAnimationControls() {

    const animGroup = document.getElementById('anim-group');

    if (animGroup) {
        animGroup.remove();
    }

}

async function loadObjectData(id) {

    if (jsonCache.has(id)) {

        return jsonCache.get(id);

    }

    const response = await fetch(`models/${id}.json`);

    const data = await response.json();

    jsonCache.set(id, data);

    return data;
}

function preloadModel(id) {

    if (!id || modelCache.has(id)) return;

    gltfLoader.load(`models/${id}.glb`, (gltf) => {

        modelCache.set(id, gltf);

        console.log(`[PRELOAD] Modelo ${id} carregado em cache`);

    });
}

initViewer(); 