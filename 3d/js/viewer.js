import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

const ColorBlindShader = {
    uniforms: { 
        tDiffuse: { value: null }, 
        uMatrix: { value: new THREE.Matrix3() } 
    },
    vertexShader: `
        varying vec2 vUv; 
        void main() { 
            vUv = uv; 
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse; 
        uniform mat3 uMatrix; 
        varying vec2 vUv; 

        void main() { 
            vec4 color = texture2D(tDiffuse, vUv); 
            
            vec3 corrected = uMatrix * color.rgb; 
            
            corrected = pow(corrected, vec3(1.0 / 2.2));
            
            gl_FragColor = vec4(corrected, color.a); 
        }
    `
};

const COLOR_FILTERS = {
    normal: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    protanopia: [0.56667, 0.43333, 0.0, 0.55833, 0.44167, 0.0, 0.0, 0.24167, 0.75833],
    protanomalia: [0.81667, 0.18333, 0.0, 0.33333, 0.66667, 0.0, 0.0, 0.125, 0.875],
    deuteranopia: [0.625, 0.375, 0.0, 0.70, 0.30, 0.0, 0.0, 0.30, 0.70],
    deuteranomalia: [0.80, 0.20, 0.0, 0.25, 0.75, 0.0, 0.0, 0.14167, 0.85833],
    tritanopia: [0.95, 0.05, 0.0, 0.0, 0.43333, 0.56667, 0.0, 0.475, 0.525],
    tritanomalia: [0.96667, 0.03333, 0.0, 0.0, 0.73333, 0.26667, 0.0, 0.18333, 0.81667],
    acromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
    acromanomalia: [0.6112, 0.3556, 0.0332, 0.2112, 0.7156, 0.0732, 0.0212, 0.1456, 0.8332]
};

let scene, camera, renderer, controls, composer, colorPass, modelId;
let saoPass, smaaPass, outlinePass;
let qualidadeAtual = 'media';
let models = [];
let objectData = {};
let selectedObjects = [];
let originalEmissive = new THREE.Color();
let isIsolatedMode = false;
let visibilidadeAntesDoIsolamento = {};
let mixer, clock;
let currentAction = null;
let isLooping = true;
let isPaused = false;
let isProgressBarDragging = false;
let previousModelId = null;
let progressBarEl = null;
let labelRenderer, labelLine, labelDot, label2DObject;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const params = new URLSearchParams(window.location.search);
const gltfLoader = new GLTFLoader();
const modelCache = new Map();
const jsonCache = new Map();

window.toggleDarkMode = toggleDarkMode;
let isDark = false;

modelId = params.get('id');

// Inicializa o visualizador, processa parâmetros da URL (ID, tema, modal) e carrega os metadados JSON do modelo.
async function initViewer() {
    const btn = document.getElementById('theme-icon');
    if (params.get('theme') === 'dark') {document.body.classList.add('dark-mode'); btn.textContent = '☀️'; isDark = true;} else {btn.textContent = '🌙'};
    if (params.get('modal') === 'true') document.body.classList.add('is-modal');
    if (!modelId) return;

    clock = new THREE.Clock();

    try {
        objectData = await loadObjectData(modelId);

        document.getElementById('det-title').textContent = objectData.objname;
        document.getElementById('det-bc').textContent = objectData.objname;
        document.getElementById('det-sys').textContent = objectData.objsystem;
        
        renderizarDescricaoComAlternador();

        const tagsCont = document.getElementById('det-tags');
        if(tagsCont) tagsCont.innerHTML = `<span class="tag">ID: #${modelId}</span><span class="tag">${objectData.objsystem}</span>`;

        renderizarCapitulos(objectData);
        renderizarRecursosGlobais(objectData);

        if (objectData.linkedModel?.id) {
            preloadModel(objectData.linkedModel.id);
        }

        initThree();
        load3DModel(modelId);
    } catch (e) { 
        console.error("Erro no setup:", e); 
    }

    window.focus();
}

// Configura o ambiente Three.js (Scene, Camera, Renderers, Luzes, OrbitControls e o pipeline de Pós-Processamento).
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

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 2, 3);

    renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance'
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(1);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    scene.environmentIntensity = 0.2;

    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    //scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = null;
    pmremGenerator.dispose();

    const isDark = document.body.classList.contains('dark-mode');
    scene.background = new THREE.Color(isDark ? 0x0f172a : 0xf2f2f2);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(-5, -5, -5);
    scene.add(rimLight);

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
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    composer.addPass(new RenderPass(scene, camera));

    outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
    );

    // Configuração do efeito estilo raio-X (visível através de outras malhas)
    outlinePass.edgeStrength = 4.0;      // Intensidade da borda
    outlinePass.edgeGlow = 0.5;          // Suavização do contorno
    outlinePass.edgeThickness = 1.0;     // Espessura da linha
    outlinePass.visibleEdgeColor.set(0x007bff); // Cor quando VISÍVEL (Verde)
    outlinePass.hiddenEdgeColor.set(0x007bff);  // Cor quando OCULTO ATRÁS DE OUTRAS MESHES (Verde)

    composer.addPass(outlinePass);

    saoPass = new SAOPass(scene, camera, false, true);

    saoPass.params.saoBias = 0.5;
    saoPass.params.saoIntensity = 0.002;
    saoPass.params.saoScale = 10;
    saoPass.params.saoKernelRadius = 50;

    composer.addPass(saoPass);

    colorPass = new ShaderPass(ColorBlindShader);
    composer.addPass(colorPass);

    smaaPass = new SMAAPass(width, height);
    composer.addPass(smaaPass);

    setColorBlindMode('normal');
    setDefaultCamera();

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    animate();
}

// Gerencia o carregamento assíncrono do arquivo .GLB do modelo 3D, tratando clonagem de meshes e inicialização de animações.
function load3DModel(id) {
    const finishSetup = (gltf) => {
        const model = SkeletonUtils.clone(gltf.scene);

        model.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = false;
                obj.receiveShadow = false;
                obj.frustumCulled = true;
                //obj.material.roughness = 0.4;
                //obj.material.metalness = 0.1;

                if (obj.material) {
                    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
                    
                    if (obj.material.map) {
                        obj.material.map.anisotropy = Math.min(
                        renderer.capabilities.getMaxAnisotropy(),
                        qualidadeAtual === 'alta' ? 16 :
                        qualidadeAtual === 'equilibrada' ? 8 :
                        qualidadeAtual === 'media' ? 4 : 2
                    );
                        obj.material.map.needsUpdate = true;
                    }
                }
            }
        });



        scene.add(model);
        models.push(model);

        const loadingEl = document.getElementById('loading-3d');
        if (loadingEl) loadingEl.style.display = 'none';

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            currentAction = mixer.clipAction(gltf.animations[0]);
            currentAction.clampWhenFinished = true;
            currentAction.setLoop(isLooping ? THREE.LoopRepeat : THREE.LoopOnce);
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

    if (modelCache.has(id)) {
        console.log(`[CACHE] Modelo ${id} carregado do cache`);
        finishSetup(modelCache.get(id));
        return;
    }

    gltfLoader.load(
        `https://maiconcurriel.github.io/raexplorer/3d/models/${id}.glb`,
        (gltf) => {
            modelCache.set(id, gltf);
            finishSetup(gltf);
        },
        undefined,
        (error) => { console.error("Erro ao carregar GLB:", error); }
    );
}

// Injeta dinamicamente na interface HTML os controles de reprodução, linha de tempo (slider) e velocidade da animação.
function injectAnimationControls() {
    const bar = document.querySelector('.v-bot-bar');
    if (!bar || document.getElementById('anim-group')) return;

    const animControlsHTML = `
        <div id="anim-group" style="display: flex; align-items: center; gap: 10px; flex-grow: 1; margin: 0 15px;">
            <div class="bt-sep"></div>
            <button class="bt-btn" id="btn-play" title="Play/Pause" onclick="window.togglePlayPause()">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <input type="range" id="anim-progress" min="0" max="100" value="0" step="0.1" style="flex-grow: 1; cursor: pointer; height: 4px; accent-color: #00ffff;">
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
    progressBarEl = document.getElementById('anim-progress');
}

// Renderiza a lista de capítulos/partes anatômicas na barra lateral baseando-se nos nós do arquivo JSON.
function renderizarCapitulos(data) {
    const container = document.getElementById('tc-ch');
    const ignoreKeys = ['objname', 'objsystem', 'objdescription', 'id', 'resources'];
    
    const html = Object.keys(data)
        .filter(key => {
            const isNotIgnored = !ignoreKeys.includes(key);

            const hasDescription =
                data[key] &&
                data[key].description &&
                data[key].description.trim() !== "";

            const isInteractive = !key.includes('+ninteract');

            return isNotIgnored && hasDescription && isInteractive;
        })
        .map(key => `
            <div class="ch-item" onclick="focarParte('${key}')">
                <div>
                    <div class="ch-name">${data[key].objname || key}</div>
                </div>
            </div>`).join('');   

    container.innerHTML = html || '<p>Nenhum capítulo disponível.</p>';
}

// Evento global para focar em uma parte específica, aplicando realce (highlight), gerando o callout e atualizando a descrição.
window.focarParte = (id, intersectionPoint = null) => {
    const chaveJson = Object.keys(objectData).find(key => {
        if (key === id) return true;
        
        const chaveLimpa = key.replace('+nisolar', '');
        if (chaveLimpa === id) return true;
        
        const partes = chaveLimpa.split('+');
        return partes.includes(id);
    }) || id;

    const data = objectData[chaveJson];
    
    if (!data) {
        console.warn("BioExplora: Dados não encontrados no JSON para a chave:", chaveJson);
        return;
    }

    const ehIsolavel = !chaveJson.includes('+nisolar');

    let nomeParaBuscar = id;
    if (id.includes('+')) {
        nomeParaBuscar = id.replace('+nisolar', '').split('+')[0];
    }
    
    let objTarget = null;
    scene.traverse(child => {
        if ((child.isMesh || child.isSkinnedMesh) && child.name === nomeParaBuscar) {
            objTarget = child;
        }
    });

    if (!objTarget) {
        const malhasDoGrupo = chaveJson.replace('+nisolar', '').split('+');
        scene.traverse(child => {
            if (child.isMesh || child.isSkinnedMesh) {
                if (malhasDoGrupo.includes(child.name) && !objTarget) {
                    objTarget = child;
                }
            }
        });
    }

    if (!objTarget) {
        console.warn("BioExplora: Mesh física correspondente não encontrada na cena para:", nomeParaBuscar);
        return;
    }

    const nomeDoObjeto = data.objname || chaveJson;
    
    if (isIsolatedMode) {
        removerCallout();
    } else {
        criarCallout(objTarget, nomeDoObjeto, intersectionPoint, chaveJson);
    }
    
    if (isIsolatedMode && selectedObjects.some(obj => obj.name === objTarget.name)) {
        renderButtons(chaveJson, data);
        return;
    }

    if (isIsolatedMode) {
        if (ehIsolavel) {
            isolarObjeto(chaveJson);
        } else {
            renderButtons(chaveJson, data);
        }
    } else {
        highlightObject(chaveJson);
        renderButtons(chaveJson, data);
    }

    window.swTab('desc', document.querySelector('.tab-btn'));
    if (typeof renderizarRecursos === 'function') renderizarRecursos(data);
};

// Restaura toda a cena 3D para o estado inicial, limpando isolamentos, destaques, callouts e reposicionando a câmera.
window.resetScene = () => {
    isIsolatedMode = false;
    clearHighlight();

    if (currentAction) {
        currentAction.reset();
        currentAction.play();
        isPaused = false;
        updatePlayPauseUI();
    }

    scene.traverse(obj => {
        if (obj.isMesh) obj.visible = true;
    });

    renderizarDescricaoComAlternador();
    setDefaultCamera();

    removerCallout();
};

window.botaoGeral = () => {
    isIsolatedMode = false;
    clearHighlight();

    /*scene.traverse(obj => {
        if (obj.isMesh || obj.isSkinnedMesh) {
            obj.visible = true;
        }
    });*/

    //setDefaultCamera();

    removerCallout();

    renderizarDescricaoComAlternador();
};

// Define a posição e o alvo (target) padrão da câmera de visualização.
function setDefaultCamera() {
    camera.position.set(0, 2, 3);
    controls.target.set(0, 1, 0);
    controls.update();
}

// Alterna a exibição das abas laterais da interface (Capítulos, Descrição ou Recursos).
window.swTab = (id, btn) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    ['ch', 'desc', 'res'].forEach(t => {
        const el = document.getElementById('tc-' + t);
        if (el) el.style.display = (t === id) ? 'block' : 'none';
    });
};

// Altera a matriz de transformação de cor do shader de pós-processamento para simular/corrigir tipos de daltonismo.
window.setColorBlindMode = (mode) => {
    const m = COLOR_FILTERS[mode] || COLOR_FILTERS.normal;
    colorPass.uniforms.uMatrix.value.set(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]);
};

window.alterarQualidade = function (qualidade) {

    qualidadeAtual = qualidade;

    const configuracoes = {

        baixa: {
            pixelRatio: 1,
            sao: false,
            smaa: false,
            anisotropy: 4
        },

        media: {
            pixelRatio: Math.min(window.devicePixelRatio, 1.5),
            sao: true,
            smaa: true,
            anisotropy: 8
        },

        alta: {
            pixelRatio: Math.min(window.devicePixelRatio, 2),
            sao: true,
            smaa: true,
            anisotropy: 16
        }
    };

    const config = configuracoes[qualidade] || configuracoes.media;

    renderer.setPixelRatio(config.pixelRatio);
    composer.setPixelRatio(config.pixelRatio);

    saoPass.enabled = config.sao;

    smaaPass.enabled = config.smaa;

    scene.traverse(obj => {

        if (obj.isMesh && obj.material) {

            const materiais = Array.isArray(obj.material)
                ? obj.material
                : [obj.material];

            materiais.forEach(material => {

                if (material.map) {
                    material.map.anisotropy =
                        Math.min(
                            renderer.capabilities.getMaxAnisotropy(),
                            config.anisotropy
                        );

                    material.map.needsUpdate = true;
                }

            });
        }
    });

    const container = document.getElementById('three-container');

    if (container) {
        const width = container.clientWidth;
        const height = container.clientHeight;

        renderer.setSize(width, height);
        composer.setSize(width, height);

        if (labelRenderer) {
            labelRenderer.setSize(width, height);
        }
    }

    const btn = document.getElementById('quality-btn');

    if (btn) {
        const nomes = {
            baixa: 'Baixa',
            media: 'Média',
            equilibrada: 'Equilibrada',
            alta: 'Alta'
        };

        btn.title = `Qualidade: ${nomes[qualidade]}`;
    }

    toggleQualityMenu();
};

window.toggleQualityMenu = function () {

    const menu = document.getElementById('quality-menu');

    if (!menu) return;

    menu.classList.toggle('open');
};

document.addEventListener('click', (event) => {

    const menu = document.getElementById('quality-menu');
    const button = document.getElementById('quality-btn');

    if (!menu || !button) return;

    if (
        !menu.contains(event.target) &&
        !button.contains(event.target)
    ) {
        menu.classList.remove('open');
    }

});

// Alterna o estado da janela do navegador entre modo tela cheia (Fullscreen) e modo normal.
window.toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
};

// Remove parâmetros estéticos da URL e copia o link limpo do modelo atual para a área de transferência do usuário.
window.shareModel = (btnEl) => {
    const url = new URL(window.location.href);
    
    url.searchParams.delete('title');
    url.searchParams.delete('sys');
    url.searchParams.delete('modal');

    navigator.clipboard.writeText(url.toString()).then(() => {
        const original = btnEl.innerHTML;
        btnEl.innerHTML = '✅ Copiado!';
        btnEl.classList.add('copied');
        
        setTimeout(() => { 
            btnEl.innerHTML = original; 
            btnEl.classList.remove('copied'); 
        }, 2000);
    });
};

// Captura o clique do mouse no canvas, converte para coordenadas normalizadas e dispara o Raycaster para detectar a mesh clicada.
function onPointerDown(event) {
    if (event.button !== 0) return;

    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster
        .intersectObjects(models, true)
        .filter(i => i.object.visible);

    const intersecaoValida = intersects.find(i => {
        const nomeMesh = i.object.name;

        const chaveJson = Object.keys(objectData).find(key => {
            const chaveLimpa = key
                .replace('+nisolar', '')
                .replace('+ninteract', '');

            return chaveLimpa === nomeMesh ||
                   chaveLimpa.split('+').includes(nomeMesh);
        });

        if (chaveJson && chaveJson.includes('+ninteract')) {
            return false;
        }

        return true;
    });

    if (intersecaoValida) {
        const clicked = intersecaoValida.object;
        const intersectionPoint = intersecaoValida.point;

        window.focarParte(clicked.name, intersectionPoint);
    }
}

// Aplica um efeito de brilho verde (emissive) temporário na sub-mesh selecionada para destacá-la visualmente.
function highlightObject(chaveJson) {
    if (isIsolatedMode) return;

    clearHighlight();

    const malhasDoGrupo = chaveJson.replace('+nisolar', '').split('+');
    const objetosParaDestacar = [];

    scene.traverse(child => {
        if ((child.isMesh || child.isSkinnedMesh) && malhasDoGrupo.includes(child.name)) {
            objetosParaDestacar.push(child);
            selectedObjects.push(child);
        }
    });

    // Atribui as malhas encontradas diretamente ao OutlinePass
    if (outlinePass) {
        outlinePass.selectedObjects = objetosParaDestacar;
    }
}

// Remove o contorno e limpa a seleção
function clearHighlight() {
    if (outlinePass) {
        outlinePass.selectedObjects = [];
    }
    selectedObjects = [];
}

// Oculta todas as outras meshes da cena e foca a câmera exclusivamente na peça anatômica selecionada.
window.isolarObjeto = (id) => {
    const chaveJson = obterChaveJson(id);
    
    if (chaveJson.includes('+nisolar')) {
        console.warn("Este objeto foi configurado para não ser isolado.");
        return;
    }

    const malhasParaExibir = chaveJson.split('+');
    
    const targetObj = scene.getObjectByName(malhasParaExibir[0]);
    if (!targetObj) return;

    visibilidadeAntesDoIsolamento = {};
    scene.traverse(obj => {
        if (obj.isMesh || obj.isSkinnedMesh) {
            visibilidadeAntesDoIsolamento[obj.uuid] = obj.visible;
        }
    });

    const data = objectData[chaveJson];
    
    clearHighlight();
    
    isIsolatedMode = true;

    scene.traverse(obj => {
        if (obj.isMesh || obj.isSkinnedMesh) obj.visible = false;
    });

    // Limpa a lista antes de repopular
    selectedObjects = [];

    scene.traverse(obj => {
        if (obj.isMesh || obj.isSkinnedMesh) {
            if (malhasParaExibir.includes(obj.name)) {
                obj.visible = true;
                selectedObjects.push(obj); // Popula a lista
            }
        }
    });

    renderButtons(chaveJson, data);
    
    // MUDANÇA AQUI: Passamos a lista de objetos realmente visíveis para o zoom
    window.aproximarObjeto(selectedObjects);
    removerCallout();
};

// Desativa o modo isolamento, restaurando a visibilidade original de todas as peças e recriando o callout do objeto ativo.
window.voltarDoIsolamento = (id) => {
    isIsolatedMode = false;

    scene.traverse(obj => {
        if ((obj.isMesh || obj.isSkinnedMesh) && visibilidadeAntesDoIsolamento[obj.uuid] !== undefined) {
            obj.visible = visibilidadeAntesDoIsolamento[obj.uuid];
        }
    });

    const chaveJson = Object.keys(objectData).find(key => {
        return key === id || key.split('+').includes(id);
    }) || id;

    const data = objectData[chaveJson];
    renderButtons(chaveJson, data);

    if (selectedObjects.length > 0) {
        const principalMesh = selectedObjects[0];
        
        const chavePeca = Object.keys(objectData).find(key => {
            return key === principalMesh.name || key.split('+').includes(principalMesh.name);
        }) || principalMesh.name;

        const dataPeca = objectData[chavePeca];
        if (dataPeca) {
            const nomeDoObjeto = dataPeca.objname || principalMesh.name;
            criarCallout(principalMesh, nomeDoObjeto, null, chavePeca);
        }
        
        highlightObject(chaveJson);
    }
};

// Loop principal de renderização (60fps) que atualiza o relógio, o mixer de animações, os controles de órbita e renderiza os seletores.
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (mixer) {
        if (isProgressBarDragging) {
            mixer.update(0);
        } else if (!isPaused) {
            mixer.update(delta);
        }

        if (progressBarEl && currentAction && !isProgressBarDragging) {
            const progress =
                (mixer.time % currentAction.getClip().duration) /
                currentAction.getClip().duration * 100;

            progressBarEl.value = progress;
        }
    }

    if (controls) controls.update();

    // Atualiza TODO o callout antes de renderizar
    if (objetoAlvoCallout) {
        objetoAlvoCallout.updateMatrixWorld(true);

        atualizarLimiteCallout();

        if (labelDot) {
            atualizarTamanhoCalloutDot();
        }
    }

    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }

    if (labelRenderer) {
        labelRenderer.render(scene, camera);
    }
}

const RESOURCE_CONFIG = {
    doc: { icon: '📄', color: '#f1f5f9' },
    video: { icon: '🎥', color: 'var(--accent2-lt)' },
    image: { icon: '📊', color: '#f0eef8' },
    link: { icon: '🔗', color: '#fef5ec' },
    audio: { icon: '🎙️', color: '#eefcf0' },
    model: { icon: '🧬', color: '#eefcf0' }
};

// Renderiza na aba correspondente a lista de mídias e materiais de apoio globais atrelados ao modelo.
function renderizarRecursosGlobais(data) {
    const container = document.getElementById('tc-res');
    if (!container) return;

    let html = '';

    const relacionados = data.linkedModels ||
        (data.linkedModel ? [data.linkedModel] : []);

    relacionados.forEach((modelo, index) => {
    const targetId = modelo.id;
    const nameobj = modelo.label || `Modelo relacionado ${index + 1}`;

    if (typeof preloadModel === 'function') {
        preloadModel(targetId);
    }

    html += `
        <div class="res-item" onclick="window.carregarNovoModelo('${targetId}')">
            <div class="res-ic" style="background:#eefcf0; overflow:hidden;">
                <img 
                    src="models/${targetId}.png" 
                    style="width:100%; height:100%; object-fit:cover; border-radius:6px;"
                    onerror="this.style.display='none'"
                >
            </div>
            <div>
                <div class="res-name">${nameobj}</div>
                <div class="res-type">Modelo anatômico relacionado</div>
            </div>
        </div>
    `;
});

    if (data.resources) {
        html += data.resources.map(res => {
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

    container.innerHTML = html;
}

function fazerDownload(url, nomeArquivo) {
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo || 'download';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

window.abrirMedia = (res) => {
    const modal = document.getElementById('media-modal');
    const body = document.getElementById('modal-body');
    const title = document.getElementById('modal-title');
    const downloadBtn = document.getElementById('modal-download-btn');
    
    title.innerText = res.name;
    body.innerHTML = ''; 

    const isExternal = res.url.startsWith('http');
    const finalPath = isExternal ? res.url : `models/${res.url}`;

    if (downloadBtn) {
        if (res.type === 'image' || res.type === 'audio') {
            downloadBtn.style.display = 'inline-block';
            downloadBtn.onclick = () => fazerDownload(finalPath, res.name);
        } else {
            downloadBtn.style.display = 'none';
            downloadBtn.onclick = null;
        }
    }

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
                embedUrl = hash ? `https://player.vimeo.com/video/${videoId}?h=${hash}` : `https://player.vimeo.com/video/${videoId}`;
            }
        }

        body.innerHTML = `<iframe src="${embedUrl}" style="width:100%; aspect-ratio:16/9; border:none; display:block;" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } 
    else if (res.type === 'image') {
        body.innerHTML = `<img src="${finalPath}" style="display:block; max-height:80vh; width:100%; object-fit:contain; border:none;" />`;
    }
    else if (res.type === 'audio') {
        body.innerHTML = `
            <div style="padding: 30px; background: #1e293b; display: flex; flex-direction: column; align-items: center; gap: 20px; border-radius: 8px;">
                <audio id="audio-player" controls src="${finalPath}" style="width: 100%;"></audio>
                <div id="audio-caption-box" style="width: 100%; min-height: 50px; text-align: center; color: #38bdf8; font-family: sans-serif; font-size: 16px; font-weight: 500; line-height: 1.4; transition: all 0.2s; padding: 10px; border-radius: 6px; background: rgba(15, 23, 42, 0.6); display: none;">
                    ...
                </div>
            </div>
        `;

        const srtPath = finalPath.substring(0, finalPath.lastIndexOf('.')) + '.srt';
        
        fetch(srtPath)
            .then(response => {
                if (!response.ok) throw new Error('SRT não encontrado');
                return response.text();
            })
            .then(srtText => {
                const captions = parseSRT(srtText);
                const audio = document.getElementById('audio-player');
                const captionBox = document.getElementById('audio-caption-box');
                
                captionBox.style.display = 'block';
                captionBox.innerText = 'Legendas carregadas.';

                audio.addEventListener('timeupdate', () => {
                    const currentTime = audio.currentTime;
                    const activeCaption = captions.find(c => currentTime >= c.start && currentTime <= c.end);
                    captionBox.innerHTML = activeCaption ? activeCaption.text : '';
                });
            })
            .catch(err => {
                console.log('Sem legendas para este áudio:', err.message);
            });
    }
    else {
        window.open(finalPath, '_blank');
        return;
    }

    modal.style.display = 'flex';
};

// Função auxiliar para converter o formato de tempo do SRT (00:00:00,000) para segundos decimais
function timeToSeconds(timeString) {
    const parts = timeString.replace(',', '.').split(':');
    const hours = parseFloat(parts[0]) * 3600;
    const minutes = parseFloat(parts[1]) * 60;
    const seconds = parseFloat(parts[2]);
    return hours + minutes + seconds;
}

// Função auxiliar para processar a string bruta do SRT e transformá-la em um Array de objetos interativos
function parseSRT(data) {
    const regex = /(\d+)\r?\n(\d\d:\d\d:\d\d[,\.]\d\d\d) --> (\d\d:\d\d:\d\d[,\.]\d\d\d)\r?\n([\s\S]*?)(?=\n{2,}|\r?\n\r?\n|\n*$)/g;
    const captions = [];
    let matches;

    data = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    while ((matches = regex.exec(data)) !== null) {
        captions.push({
            id: matches[1],
            start: timeToSeconds(matches[2]),
            end: timeToSeconds(matches[3]),
            text: matches[4].replace(/\n/g, '<br>') // Preserva quebras de linha na legenda se houver
        });
    }
    return captions;
}

// Fecha a modal de exibição de mídias e limpa o contêiner interno para interromper reproduções em background.
window.closeMediaModal = () => {
    const modal = document.getElementById('media-modal');
    const body = document.getElementById('modal-body');
    body.innerHTML = '';
    modal.style.display = 'none';
};

// Evento que escuta a tecla 'Escape' (ESC) para fechar a modal do visualizador chamando a função correspondente na janela pai (portal).
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.parent && typeof window.parent.closeDet === 'function') {
        window.parent.closeDet();
    }
});

// Ajusta dinamicamente a proporção da câmera (aspect) e o tamanho dos renderizadores 3D e 2D sempre que a janela for redimensionada.
window.addEventListener('resize', () => {
    if (!camera || !renderer || !composer) return;
    const container = document.getElementById('three-container');
    if (!container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
    
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 

    if (labelRenderer) labelRenderer.setSize(width, height);
});

// Alterna a visibilidade (visible = true/false) de uma sub-mesh específica na cena tridimensional.
window.toggleVisibility = (id, action) => {
    const chaveJson = Object.keys(objectData).find(key => {
        if (key === id) return true;
        const chaveLimpa = key.replace('+nisolar', '');
        return chaveLimpa === id || chaveLimpa.split('+').includes(id);
    }) || id;

    const malhasDoGrupo = chaveJson.replace('+nisolar', '').split('+');

    scene.traverse(obj => {
        if ((obj.isMesh || obj.isSkinnedMesh) && malhasDoGrupo.includes(obj.name)) {
            obj.visible = (action === 'show');
        }
    });

    if (action === 'hide') {
        removerCallout();
    }

    const data = objectData[chaveJson];
    renderButtons(chaveJson, data);
};

// Constrói e injeta o bloco de texto descritivo do objeto focado junto com seus botões de ação contextual (Isolar/Esconder/Mostrar).
function renderButtons(id, data) {
    const malhasDoGrupo = id.replace('+nisolar', '').split('+');
    
    let isVisible = true;
    scene.traverse(obj => {
        if (obj.isMesh && obj.name === malhasDoGrupo[0]) isVisible = obj.visible;
    });

    const naoPodeIsolar = id.includes('+nisolar');

    let botoesHtml = "";
    let colunasGrid = "1fr 1fr 1fr";

    if (isIsolatedMode) {
        botoesHtml = `
            <button class="dp-act" style="background:#f1c40f; color:#000;" onclick="voltarDoIsolamento('${id}')">Voltar</button>
        `;
        colunasGrid = "1fr 1fr";
    } else {
        if (naoPodeIsolar) {
            botoesHtml = `
                <button class="dp-act" style="background:#555; color:#fff;" onclick="botaoGeral()">Geral</button>
            `;
            colunasGrid = "1fr";
        } else {
            const hideShowBtn = isVisible 
                ? `<button class="dp-act btn-hide" onclick="toggleVisibility('${id}', 'hide')">Esconder</button>`
                : `<button class="dp-act btn-show" onclick="toggleVisibility('${id}', 'show')">Mostrar</button>`;

            botoesHtml = `
                <button class="dp-act" style="background:#555; color:#fff;" onclick="botaoGeral()">Geral</button>
                <button class="dp-act" style="background:#00ffff; color:#000;" onclick="isolarObjeto('${id}')">Isolar</button>
                ${hideShowBtn}
            `;
        }
    }

    document.querySelector('.desc-tx').innerHTML = `
        <h3>${data.objname || id}</h3>
        ${parseDescriptionMedia(data.description || 'Sem descrição.')}
        <div style="display: grid; grid-template-columns: ${colunasGrid}; gap: 10px; margin-top: 15px;">
            ${botoesHtml}
        </div>
    `;
}

// Controla os estados de Play e Pause da animação do modelo, reiniciando o clipe caso ele já tenha chegado ao fim.
window.togglePlayPause = () => {
    if (!currentAction) return;
    const duration = currentAction.getClip().duration;

    if (isPaused && currentAction.time >= duration - 0.05) {
        currentAction.time = 0;
        mixer.setTime(0);
    }

    isPaused = !isPaused;
    currentAction.paused = isPaused;

    if (!isPaused) currentAction.play();
    updatePlayPauseUI();
};

// Altera o ícone do botão de Play/Pause na interface para condizer com o estado atual da animação.
function updatePlayPauseUI() {
    const btn = document.getElementById('btn-play');
    if (!btn) return;
    btn.innerHTML = isPaused 
        ? `<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
        : `<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
}

// Ativa ou desativa a reprodução contínua (looping) da animação do modelo e atualiza o estilo visual do botão.
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

// Altera a escala de velocidade do mixer de animação (ex: 1x, 0.5x) e suaviza a velocidade de rotação da câmera em câmera lenta.
window.changeSpeed = (val) => {
    if (!mixer) return;
    const speed = parseFloat(val);
    mixer.timeScale = speed;
    if (controls) controls.rotateSpeed = speed < 1 ? 0.5 : 1.0;
};

// Calcula a caixa delimitadora (Box3) do objeto e translada suavemente a câmera na coordenada Z para enquadrá-lo perfeitamente na tela.
window.aproximarObjeto = (id) => {
    const targetObj = scene.getObjectByName(id);
    if (!targetObj) return;

    const box = new THREE.Box3().setFromObject(targetObj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 0.25 / Math.tan(fov / 2)) * 1.5;

    controls.target.copy(center);
    camera.position.set(center.x, center.y, center.z + cameraZ);
    controls.update();
};

// Analisa a string de descrição do JSON procurando links do YouTube/Vimeo para gerar e injetar players de vídeo automaticamente.
function parseDescriptionMedia(description = '') {
    let embedHtml = '';
    let cleanText = description;

    const ytMatch = description.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+))/i);
    if (ytMatch) {
        embedHtml = `<iframe src="https://www.youtube.com/embed/${ytMatch[2]}" style="width:100%; aspect-ratio:16/9; border:none; border-radius:12px; margin-bottom:15px;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        cleanText = cleanText.replace(ytMatch[1], '').trim();
    }

    const vimeoMatch = description.match(/https?:\/\/(?:www\.)?vimeo\.com\/(\d+)(?:\/([a-zA-Z0-9]+))?/i);
    if (vimeoMatch) {
        const embedUrl = vimeoMatch[2] ? `https://player.vimeo.com/video/${vimeoMatch[1]}?h=${vimeoMatch[2]}` : `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        embedHtml = `<iframe src="${embedUrl}" style="width:100%; aspect-ratio:16/9; border:none; border-radius:12px; margin-bottom:15px;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        cleanText = cleanText.replace(vimeoMatch[0], '').trim();
    }

    return `${embedHtml}<p>${cleanText}</p>`;
}

// Executa a transição completa de modelos limpando meshes antigas, resetando mixers de animação e carregando um novo ID estruturado.
window.carregarNovoModelo = async function(id, voltar = false) {
    previousModelId = voltar ? null : modelId;
    modelId = id;

    models.forEach(model => { scene.remove(model); });
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

        renderizarDescricaoComAlternador();
        renderizarCapitulos(objectData);
        renderizarRecursosGlobais(objectData);

        if (objectData.linkedModel?.id) preloadModel(objectData.linkedModel.id);

        load3DModel(modelId);
        resetScene();
    } catch (e) {
        console.error("Erro ao carregar novo modelo:", e);
    }
};

// Remove o contêiner HTML dos controles de animação da interface e limpa sua referência em memória.
function removeAnimationControls() {
    const animGroup = document.getElementById('anim-group');
    if (animGroup) animGroup.remove();
    progressBarEl = null;
}

// Realiza a requisição fetch do arquivo .json de metadados do modelo e armazena o resultado em um cache local Map().
async function loadObjectData(id) {
    if (jsonCache.has(id)) return jsonCache.get(id);

    const response = await fetch(`models/${id}.json`);
    const data = await response.json();
    jsonCache.set(id, data);
    return data;
}

// Carrega de forma silenciosa e antecipada o arquivo .glb de modelos vinculados ou relacionados para acelerar a troca de telas.
function preloadModel(id) {
    if (!id || modelCache.has(id)) return;
    gltfLoader.load(`https://maiconcurriel.github.io/raexplorer/3d/models/${id}.glb`, (gltf) => {
        modelCache.set(id, gltf);
        console.log(`[PRELOAD] Modelo ${id} carregado em cache`);
    });
}

// Constrói o layout interno da seção de descrição, injetando os botões de alternância de modelos relacionados/principais.
function renderizarDescricaoComAlternador() {
    const descContainer = document.querySelector('.desc-tx');
    if (!descContainer) return;

    descContainer.innerHTML = `
        ${parseDescriptionMedia(objectData.objdescription)}
    `;
}

// Variáveis de controle globais (coloque no topo do seu script se já não estiverem lá)
let objetoAlvoCallout = null;
let pontoLocalClique = null;
let vetorDeslocamentoEtiqueta = null;

// Cria e posiciona no espaço 3D a bolinha indicadora, a linha conectora e a etiqueta flutuante HTML (CSS2D) no ponto especificado.
function criarCallout(object, texto, clickPoint = null, chaveJson = null) {
    removerCallout();

    objetoAlvoCallout = object;
    
    const box = new THREE.Box3().setFromObject(object);
    const pontoMundoBase = clickPoint ? clickPoint.clone() : box.getCenter(new THREE.Vector3());
    pontoLocalClique = object.worldToLocal(pontoMundoBase.clone());

    const direcaoCamera = new THREE.Vector3();
    camera.getWorldDirection(direcaoCamera);
    
    const vetorCima = new THREE.Vector3(0, 1, 0);
    const vetorDireita = new THREE.Vector3().crossVectors(direcaoCamera, vetorCima).normalize();
    
    vetorDeslocamentoEtiqueta = vetorDireita.clone().multiplyScalar(0.25).add(vetorCima.clone().multiplyScalar(0.2));
    
    const labelPosition = pontoMundoBase.clone().add(vetorDeslocamentoEtiqueta);

    const dotGeo = new THREE.SphereGeometry(0.006, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x007bff, depthTest: false });
    labelDot = new THREE.Mesh(dotGeo, dotMat);
    labelDot.renderOrder = 999;
    labelDot.position.copy(pontoMundoBase);
    scene.add(labelDot);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([pontoMundoBase, labelPosition]);
    const lineMat = new THREE.LineBasicMaterial({ 
        color: 0x007bff, 
        linewidth: 2,
        depthTest: false 
    });
    labelLine = new THREE.Line(lineGeo, lineMat);
    labelLine.renderOrder = 998;
    scene.add(labelLine);

    const div = document.createElement('div');
    div.className = 'callout-label';
    const podeIsolar = chaveJson && !chaveJson.includes('+nisolar');

    div.innerHTML = `
        <div class="callout-arrow"></div>

        <div class="callout-content">
            <div class="callout-title">${texto}</div>

            ${chaveJson && podeIsolar ? `
            <div class="callout-actions">

                <button
                    class="callout-btn callout-isolate"
                    onclick="event.stopPropagation(); window.isolarObjeto('${chaveJson}')">
                    Isolar
                </button>

                <button
                    class="callout-btn callout-hide"
                    onclick="event.stopPropagation(); window.toggleVisibility('${chaveJson}', 'hide')">
                    Esconder
                </button>

            </div>
            ` : ''}

        </div>
    `;

    label2DObject = new CSS2DObject(div);
    label2DObject.position.copy(labelPosition);
    scene.add(label2DObject);
}

// Remove da cena e descarta da memória gráfica os vértices e materiais que compunham o callout anterior.
function removerCallout() {
    objetoAlvoCallout = null;
    pontoLocalClique = null;
    vetorDeslocamentoEtiqueta = null;

    if (labelDot) { scene.remove(labelDot); labelDot.geometry.dispose(); labelDot.material.dispose(); labelDot = null; }
    if (labelLine) { scene.remove(labelLine); labelLine.geometry.dispose(); labelLine.material.dispose(); labelLine = null; }
    if (label2DObject) {
        if (label2DObject.element) {
            label2DObject.element.style.translate = '';
        }

        scene.remove(label2DObject);
        label2DObject = null;
    }
}

function atualizarPosicaoCallout() {
    if (!objetoAlvoCallout || !pontoLocalClique) return;

    const novaPosicaoBase = pontoLocalClique.clone().applyMatrix4(objetoAlvoCallout.matrixWorld);    
    const novaPosicaoEtiqueta = novaPosicaoBase.clone().add(vetorDeslocamentoEtiqueta);

    if (labelDot) {
        labelDot.position.copy(novaPosicaoBase);
    }
    if (label2DObject) {
        label2DObject.position.copy(novaPosicaoEtiqueta);
    }
    if (labelLine) {
        const positions = labelLine.geometry.attributes.position.array;
        
        positions[0] = novaPosicaoBase.x;
        positions[1] = novaPosicaoBase.y;
        positions[2] = novaPosicaoBase.z;

        positions[3] = novaPosicaoEtiqueta.x;
        positions[4] = novaPosicaoEtiqueta.y;
        positions[5] = novaPosicaoEtiqueta.z;

        labelLine.geometry.attributes.position.needsUpdate = true;
    }
}

function atualizarLimiteCallout() {
    if (!label2DObject || !camera || !objetoAlvoCallout || !pontoLocalClique) {
        return;
    }

    const container = document.getElementById('three-container');
    if (!container) return;

    const element = label2DObject.element;

    const largura = container.clientWidth;
    const altura = container.clientHeight;

    if (largura <= 0 || altura <= 0) return;

    // ========================================
    // 1. PONTO REAL CLICADO NO OBJETO
    // ========================================

    const origem = pontoLocalClique
        .clone()
        .applyMatrix4(objetoAlvoCallout.matrixWorld);

    // ========================================
    // 2. POSIÇÃO 3D NATURAL DO CARD
    // ========================================

    const posicaoNatural = origem
        .clone()
        .add(vetorDeslocamentoEtiqueta);

    // ========================================
    // 3. PROJETA O CARD PARA A TELA
    // ========================================

    const projetado = posicaoNatural
        .clone()
        .project(camera);

    let x = (projetado.x * 0.5 + 0.5) * largura;
    let y = (-projetado.y * 0.5 + 0.5) * altura;

    // ========================================
    // 4. LIMITES DO CARD
    // ========================================

    const cardWidth = element.offsetWidth;
    const cardHeight = element.offsetHeight;

    const margem = 15;

    const metadeW = cardWidth / 2;
    const metadeH = cardHeight / 2;

    const minX = margem + metadeW;
    const maxX = largura - margem - metadeW;

    const minY = margem + metadeH;
    const maxY = altura - margem - metadeH;

    // ========================================
    // 5. LIMITA À VIEWPORT
    // ========================================

    const xLimitado = THREE.MathUtils.clamp(
        x,
        minX,
        maxX
    );

    const yLimitado = THREE.MathUtils.clamp(
        y,
        minY,
        maxY
    );

    // ========================================
    // 6. CONVERTE DE VOLTA PARA NDC
    // ========================================

    const ndcX = (xLimitado / largura) * 2 - 1;
    const ndcY = -(yLimitado / altura) * 2 + 1;

    // Mantemos a profundidade original do card
    const posicaoFinal = new THREE.Vector3(
        ndcX,
        ndcY,
        projetado.z
    );

    posicaoFinal.unproject(camera);

    // ========================================
    // 7. MOVE O CSS2DOBJECT DE VERDADE
    // ========================================

    label2DObject.position.copy(posicaoFinal);

    // ========================================
    // 8. ATUALIZA A LINHA
    // ========================================

    if (labelLine) {

        const positions =
            labelLine.geometry.attributes.position.array;

        // início = ponto clicado
        positions[0] = origem.x;
        positions[1] = origem.y;
        positions[2] = origem.z;

        // final = posição REAL do card
        positions[3] = posicaoFinal.x;
        positions[4] = posicaoFinal.y;
        positions[5] = posicaoFinal.z;

        labelLine.geometry.attributes.position.needsUpdate = true;

        // Importante porque estamos alterando
        // manualmente os vértices da geometria
        labelLine.geometry.computeBoundingSphere();
    }

    // ========================================
    // 9. PONTO AZUL CONTINUA NO CLIQUE
    // ========================================

    if (labelDot) {
        labelDot.position.copy(origem);
    }
}

function atualizarTamanhoCalloutDot() {
    if (!labelDot || !camera) return;

    const distancia = camera.position.distanceTo(labelDot.position);

    // Quanto mais perto a câmera, menor a bolinha
    const escala = THREE.MathUtils.clamp(
        distancia * 0.35,
        0.15,
        1
    );

    labelDot.scale.setScalar(escala);
}

window.toggleFloatingSearch = toggleFloatingSearch;
window.filtrarItensFlutuantes = filtrarItensFlutuantes;
window.selecionarItemViaBusca = selecionarItemViaBusca;

// Controla a abertura e fechamento visual do painel flutuante de busca interna de peças do visualizador.
function toggleFloatingSearch() {
    const panel = document.getElementById('search-float-panel');
    const input = document.getElementById('search-float-input');
    const isOpen = panel.classList.toggle('open');
    
    if (isOpen) {
        input.value = "";
        gerarListaFlutuanteCompleta();
        setTimeout(() => input.focus(), 100);
        
        setTimeout(() => document.addEventListener('click', fecharBuscaAoClicarFora), 10);
    } else {
        document.removeEventListener('click', fecharBuscaAoClicarFora);
    }
}

// Escuta cliques no documento para fechar automaticamente o painel de busca flutuante caso o usuário clique fora dele.
function fecharBuscaAoClicarFora(e) {
    const container = document.querySelector('.search-floating-container');
    if (!container.contains(e.target)) {
        document.getElementById('search-float-panel').classList.remove('open');
        document.removeEventListener('click', fecharBuscaAoClicarFora);
    }
}

// Varre as chaves de peças válidas no JSON e gera a lista completa de botões de resultados dentro do menu flutuante.
function gerarListaFlutuanteCompleta() {
    const containerResultados = document.getElementById('search-float-results');
    if (!containerResultados || !objectData) return;

    const chavesIgnoradas = ['objname', 'objsystem', 'objdescription', 'linkedModels', 'resources', 'resources'];

    containerResultados.innerHTML = Object.keys(objectData)
        .filter(id => !chavesIgnoradas.includes(id))
        .map(id => {
            const item = objectData[id];
            const nomeExibicao = item.objname || id;
            return `
                <button class="search-item-btn" data-id="${id}" onclick="selecionarItemViaBusca('${id}')">
                    ${nomeExibicao}
                </button>
            `;
        }).join('');
}

// Compara o termo digitado pelo usuário com o texto dos botões da busca flutuante, aplicando display: none nos que não dão match.
function filtrarItensFlutuantes(termo) {
    const items = document.querySelectorAll('.search-item-btn');
    const filtro = termo.toLowerCase().trim();

    items.forEach(btn => {
        const texto = btn.textContent.toLowerCase();
        if (texto.includes(filtro)) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
        }
    });
}

// Seleciona o item clicado no resultado da busca, fecha o painel de pesquisa e dispara o foco e realce na peça anatômica.
function selecionarItemViaBusca(id) {
    document.getElementById('search-float-panel').classList.remove('open');
    document.removeEventListener('click', fecharBuscaAoClicarFora);

    if (typeof window.focarParte === 'function') {
        window.focarParte(id);
    }
}

// Alterna o tema da aplicação (classes de CSS) e atualiza a cor de fundo (background) da cena do Three.js entre claro e escuro.
function toggleDarkMode() {
    const btn = document.getElementById('theme-icon');
    if (isDark === false)
    {
        document.body.classList.add('dark-mode');
        btn.textContent = '☀️';
        scene.background = new THREE.Color(0x0f172a);
        isDark = true;
    }else{
        document.body.classList.remove('dark-mode');
        btn.textContent = '🌙';
        scene.background = new THREE.Color(0xf2f2f2);
        isDark = false;
    }
  }

window.abrirAjuda = abrirAjuda;
window.fecharAjuda = fecharAjuda;
window.switchHelpTab = switchHelpTab;

// Função auxiliar para encontrar a chave certa no JSON ignorando a tag de isolamento
function obterChaveJson(id) {
    return Object.keys(objectData).find(key => {
        const chaveLimpa = key
            .replace('+nisolar', '')
            .replace('+ninteract', '');

        return chaveLimpa === id || chaveLimpa.split('+').includes(id);
    }) || id;
}

function abrirAjuda() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.style.display = 'flex';
}

function fecharAjuda() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.style.display = 'none';
}

function switchHelpTab(tabId, btn) {
    document.querySelectorAll('.help-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    document.querySelectorAll('.help-tab-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    document.getElementById(tabId).style.display = 'block';
    btn.classList.add('active');
}

window.toggleDetailPanel = function () {
    const modal = document.querySelector('.det-modal');
    const button = document.getElementById('toggle-dp-btn');

    if (!modal || !button) return;

    modal.classList.toggle('panel-hidden');

    if (modal.classList.contains('panel-hidden')) {
        button.textContent = '◀';
        button.title = 'Mostrar painel';
    } else {
        button.textContent = '▶';
        button.title = 'Esconder painel';
    }

    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 300);
};

// Função auxiliar para baixar arquivos de mídia sem abrir no navegador
function baixarArquivo(url, nomeArquivo) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = nomeArquivo || 'recurso';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            a.remove();
        })
        .catch(err => console.error('Erro ao baixar o recurso:', err));
}

initViewer();