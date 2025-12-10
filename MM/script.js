document.addEventListener('wheel', function (e) {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

let state = { nodes: [], links: [], theme: "dark", view: { panX: 0, panY: 0, scale: 1 } };

let isPanning = false;
let panStart = { x: 0, y: 0 };

let scale = 1;
let panX = 0, panY = 0;

const canvas = document.getElementById("canvas");
const canvasContainer = document.getElementById("canvasContainer");
const selectionBox = document.getElementById("selectionBox");
const svg = document.getElementById('svg');

const STORAGE_KEY = 'mindmap-v3';

const nodeDropdownContainer = document.getElementById('nodeDropdownContainer');
const addNodeBtn = document.getElementById('addNodeBtn');
const nodeFormatDropdown = document.getElementById('nodeFormatDropdown');
const nodeOptions = nodeFormatDropdown ? nodeFormatDropdown.querySelectorAll('div') : [];

const themeDropdownContainer = document.getElementById('themeDropdownContainer');
const themeDropBtn = document.getElementById('themeDropBtn');
const themeOptions = themeDropdownContainer ? themeDropdownContainer.querySelectorAll('.dropdown-content div') : []; 

const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const clearBtn = document.getElementById('clearBtn');
const exportPNGbtn = document.getElementById('exportPNG');
const zoomWrapper = document.getElementById("canvas");

exportPNGbtn.addEventListener('click', exportPNG);

canvas.addEventListener("mousedown", (e) => {
  // garante que não foi clique em um nó ou conexão
  if (e.target === canvas || e.target.id === "canvas") {
    clearSelection();
  }
});

canvasContainer.addEventListener("mousedown", (e) => {
  // se clicou diretamente no container ou no canvas ou no svg “vazio”
  if (e.target.id === "canvasContainer" || 
      e.target.id === "canvas" ||
      e.target.id === "svg") {

    clearSelection();
  }
});

function clearSelection() {
  // limpa o set que realmente usamos para seleção
  multiSelected.clear();
  selected = null;

  // remove destaque visual
  document.querySelectorAll(".node.selected").forEach(el => el.classList.remove("selected"));
}

let multiSelected = new Set();
let selected = null;

let connectFrom = null;

function uid() { return 'id_' + Math.random().toString(36).substr(2, 9); }

function getNodeDimensions(nodeId) {
    const nodeElement = document.querySelector(`.node[data-id="${nodeId}"]`);
    if (nodeElement) {
        return { 
            width: nodeElement.offsetWidth, 
            height: nodeElement.offsetHeight 
        };
    }
    return { width: 220, height: 120 }; 
}

function getCenterPoint(nodeId) {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    const dims = getNodeDimensions(nodeId);
    
    const centerX = node.x + (dims.width / 2);
    const centerY = node.y + (dims.height / 2);
    
    return { x: centerX, y: centerY };
}


function applyTransform() {
  canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  
  updateGrid();
}

function clientToWorld(clientX, clientY) {
  const rect = canvasContainer.getBoundingClientRect();
  const cx = clientX - rect.left;
  const cy = clientY - rect.top;
  const wx = (cx - panX) / scale;
  const wy = (cy - panY) / scale;
  return { x: wx, y: wy };
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function updateGrid() {
  
  const baseSize = 40;
  const size = baseSize * scale;

  canvasContainer.style.backgroundSize = `${size}px ${size}px`;
  canvasContainer.style.backgroundPosition = `${panX}px ${panY}px`;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = r || 8;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/);
  let line = '';
  let ty = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line.length ? line + ' ' + words[n] : words[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && line.length) {
      ctx.fillText(line, x, ty);
      line = words[n];
      ty += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.length) ctx.fillText(line, x, ty);
}

function createNodeElement(n) {
  const el = document.createElement('div');
  el.className = 'node';
  el.style.left = n.x + 'px';
  el.style.top = n.y + 'px';
  el.dataset.id = n.id;

  el.classList.add(`format-${n.format || 'rect'}`);
  el.classList.add(`size-${n.size || 'default'}`);

  const ta = document.createElement('textarea');
  ta.value = n.text || '';
  ta.maxLength = 100;
  ta.addEventListener('input', () => { 
    
    if (ta.value.length > 100) {
      ta.value = ta.value.substring(0, 100);
    }
    
    n.text = ta.value; 
    save(false); 
  });

  const controls = document.createElement('div');
  controls.className = 'controls';

  const btnConnect = document.createElement('button');
  btnConnect.className = 'connect-btn';
  btnConnect.textContent = 'C';
  btnConnect.title = 'Conectar';
  btnConnect.addEventListener('click', (e) => { e.stopPropagation(); startConnection(n.id); });

  const btnDelete = document.createElement('button');
  btnDelete.className = 'delete-btn';
  btnDelete.textContent = 'D';
  btnDelete.title = 'Deletar nó';
  btnDelete.addEventListener('click', (e) => { e.stopPropagation(); deleteNode(n.id); });

  controls.appendChild(btnConnect);
  controls.appendChild(btnDelete);

  el.appendChild(ta);
  el.appendChild(controls);

  el.addEventListener("pointerdown", (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
        return;
    }

    selectNodeByElement(el, e);
    startNodeDrag(e, el, n);
  });

  return el;
}

function addNode(format = 'rect', size = 'default') {
  const rect = canvasContainer.getBoundingClientRect();
  const centerClientX = rect.left + rect.width / 2;
  const centerClientY = rect.top + rect.height / 2;
  const world = clientToWorld(centerClientX, centerClientY);

  const n = { 
    id: uid(), 
    x: world.x,
    y: world.y, 
    text: 'Novo nó',
    format: format,
    size: size
  };
  state.nodes.push(n);
  const el = createNodeElement(n);
  canvas.appendChild(el);
  renderLinks();
  save(false);
}

function startNodeDrag(e, el, n) {
  e.preventDefault();
  el.setPointerCapture?.(e.pointerId);

  const isMulti = multiSelected.size > 0 && multiSelected.has(n.id);

  const nodesToMove = isMulti
    ? [...multiSelected].map(id => state.nodes.find(nd => nd.id === id)).filter(Boolean)
    : [n];

  const startClientX = e.clientX;
  const startClientY = e.clientY;

  const startPositions = nodesToMove.map(node => ({ x: node.x, y: node.y }));

  function onMove(ev) {
    const dx = (ev.clientX - startClientX) / scale;
    const dy = (ev.clientY - startClientY) / scale;

    nodesToMove.forEach((node, i) => {
      node.x = startPositions[i].x + dx;
      node.y = startPositions[i].y + dy;

      const elem = document.querySelector(`.node[data-id="${node.id}"]`);
      if (elem) {
        elem.style.left = node.x + 'px';
        elem.style.top = node.y + 'px';
      }
    });

    renderLinks();
  }

  function onUp(ev) {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    el.releasePointerCapture?.(e.pointerId);
    save(false);
  }

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

function deleteNode(id) {
  state.nodes = state.nodes.filter(n => n.id !== id);
  state.links = state.links.filter(l => l.from !== id && l.to !== id);
  const el = document.querySelector(`.node[data-id="${id}"]`);
  if (el) el.remove();
  renderLinks();
  save(false);
}

function startConnection(id) {
  if (!connectFrom) {
    connectFrom = id;
    const el = document.querySelector(`.node[data-id="${id}"]`);
    el?.classList.add('selected');
    return;
  }

  if (connectFrom === id) {
    connectFrom = null;
    document.querySelectorAll('.node').forEach(nd => nd.classList.remove('selected'));
    return;
  }

  const exists = state.links.some(l =>
    (l.from === connectFrom && l.to === id) ||
    (l.from === id && l.to === connectFrom)
  );

  if (exists) {
    console.warn("Ligação já existe entre estes nós.");
    connectFrom = null;
    document.querySelectorAll('.node').forEach(nd => nd.classList.remove('selected'));
    return;
  }

  // criar novo link
  state.links.push({ id: uid(), from: connectFrom, to: id });

  connectFrom = null;
  renderLinks();
  save(false);
}

function renderLinks() {
  // limpa o SVG
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  for (const l of state.links) {
    const a = state.nodes.find(n => n.id === l.from);
    const b = state.nodes.find(n => n.id === l.to);
    if (!a || !b) continue;

    const pointA = getCenterPoint(a.id);
    const pointB = getCenterPoint(b.id);

    const ax = pointA.x;
    const ay = pointA.y;
    const bx = pointB.x;
    const by = pointB.y;
    const dx = Math.abs(bx - ax) / 2;

    const d = `M ${ax} ${ay} C ${ax + dx} ${ay} ${bx - dx} ${by} ${bx} ${by}`;

    // path principal (visível)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', 'var(--accent)');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.95');
    path.classList.add('link-path');

    // IMPORTANT: enable pointer events on the stroke so hover works
    path.style.pointerEvents = 'stroke';

    svg.appendChild(path);

    // handle invisível/maior para facilitar hover (opcional)
    // cria um path "fat" transparente por cima para área de hover (não visível)
    const hoverPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hoverPath.setAttribute('d', d);
    hoverPath.setAttribute('stroke', 'transparent');
    hoverPath.setAttribute('stroke-width', '16'); // área generosa de hover
    hoverPath.setAttribute('fill', 'none');
    hoverPath.style.pointerEvents = 'stroke';
    hoverPath.classList.add('link-hover-path');
    svg.appendChild(hoverPath);

    // bolinha no meio (handle)
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', mx);
    circle.setAttribute('cy', my);
    circle.setAttribute('r', '8');
    circle.setAttribute('fill', 'var(--danger)');
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '1.5');
    circle.classList.add('link-handle');

    // estilos iniciais da bolinha (invisível)
    circle.style.opacity = '0';
    circle.style.transition = 'opacity 0.15s ease';
    circle.style.cursor = 'pointer';
    circle.style.pointerEvents = 'auto'; // permite clicar na bolinha

    // clique na bolinha de deletar
    circle.addEventListener('click', (e) => {
      e.stopPropagation();
      state.links = state.links.filter(x => x.id !== l.id);
      renderLinks();
      save(false);
    });

    svg.appendChild(circle);

    let hoveringLine = false;
    let hoveringCircle = false;

    // quando o mouse entra na linha
    hoverPath.addEventListener('mouseenter', () => {
      hoveringLine = true;
      circle.style.opacity = '1';
    });
    hoverPath.addEventListener('mouseleave', () => {
      hoveringLine = false;
      if (!hoveringCircle) circle.style.opacity = '0';
    });

    path.addEventListener('mouseenter', () => {
      hoveringLine = true;
      circle.style.opacity = '1';
    });
    path.addEventListener('mouseleave', () => {
      hoveringLine = false;
      if (!hoveringCircle) circle.style.opacity = '0';
    });

    // quando o mouse entra na bolinha
    circle.addEventListener('mouseenter', () => {
      hoveringCircle = true;
      circle.style.opacity = '1';
    });

    // quando o mouse sai da bolinha
    circle.addEventListener('mouseleave', () => {
      hoveringCircle = false;
      if (!hoveringLine) circle.style.opacity = '0';
    });
  }
}


function save(show = true) {
  state.view = { panX, panY, scale, canvasWidth: canvas.offsetWidth, canvasHeight: canvas.offsetHeight };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (show) {
    console.log('Mapa salvo no localStorage.');
  }
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    state = JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao carregar state:', e);
    state = { nodes: [], links: [], theme: 'dark', view: { panX: 0, panY: 0, scale: 1 } };
  }
  rebuild();
  if (state.theme) document.body.className = state.theme;
  if (state.view) {
    panX = state.view.panX || 0;
    panY = state.view.panY || 0;
    scale = state.view.scale || 1;
    applyTransform();
  }
}

function rebuild() {
  document.querySelectorAll('.node').forEach(n => n.remove());
  for (const n of state.nodes) {
    const el = createNodeElement(n);
    canvas.appendChild(el);
  }
  renderLinks();
}

exportBtn.addEventListener('click', () => {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const filename = `mapamental-${day}-${month}-${year}-${hours}h${minutes}.json`;

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => importFile.click());

importFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    state = JSON.parse(text);
    rebuild();
    if (state.theme) document.body.className = state.theme;
    if (state.view) {
      panX = state.view.panX || 0;
      panY = state.view.panY || 0;
      scale = state.view.scale || 1;
      applyTransform();
    }
    save(false);
  } catch (err) {
    alert('JSON inválido!');
    console.error(err);
  }
  importFile.value = '';
});

clearBtn.addEventListener('click', () => {
  if (!confirm('Tem certeza que deseja apagar tudo?')) return;
  state = { nodes: [], links: [], theme: state.theme || 'dark', view: { panX: 0, panY: 0, scale: 1 } };
  document.querySelectorAll('.node').forEach(n => n.remove());
  renderLinks();
  save(true);
});

canvasContainer.addEventListener("wheel", (e) => {
  if (!e.ctrlKey) return;
  e.preventDefault();

  const scaleFactor = 1.12;
  const rect = canvasContainer.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const oldScale = scale;
  scale *= e.deltaY < 0 ? scaleFactor : (1 / scaleFactor);
  scale = Math.max(0.2, Math.min(3, scale));

  panX -= (mouseX / oldScale - mouseX / scale);
  panY -= (mouseY / oldScale - mouseY / scale);

  applyTransform();
  renderLinks();
}, { passive: false });

let startX = 0, startY = 0;
canvasContainer.addEventListener("mousedown", (e) => {
  if (e.button !== 1) return;
  isPanning = true;
  startX = e.clientX - panX;
  startY = e.clientY - panY;
  canvasContainer.style.cursor = "grabbing";
  e.preventDefault();
});
window.addEventListener("mousemove", (e) => {
  if (!isPanning) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  applyTransform();
});
window.addEventListener("mouseup", () => {
  if (isPanning) save(false);
  isPanning = false;
  canvasContainer.style.cursor = "default";
});

let touchZooming = false;
let touchPanning = false;
let touchStartDist = 0;
let lastScale = 1;
let lastTouchCenter = null;

function touchDist(t0, t1) {
  return Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
}

function touchCenter(t0, t1) {
  return { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
}

canvasContainer.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    touchZooming = true;
    touchPanning = true;
    touchStartDist = touchDist(e.touches[0], e.touches[1]);
    lastScale = scale;
    lastTouchCenter = touchCenter(e.touches[0], e.touches[1]);
  }
}, { passive: false });

canvasContainer.addEventListener('touchmove', (e) => {
  if (e.touches.length !== 2) return;
  e.preventDefault();

  const t0 = e.touches[0], t1 = e.touches[1];
  const newDist = touchDist(t0, t1);
  const center = touchCenter(t0, t1);

  if (touchZooming) {
    const pinchScale = newDist / touchStartDist;
    const newScale = Math.min(3, Math.max(0.2, lastScale * pinchScale));

    const rect = canvasContainer.getBoundingClientRect();
    const centerClientX = center.x - rect.left;
    const centerClientY = center.y - rect.top;

    const oldScale = scale;
    scale = newScale;

    panX -= (centerClientX / oldScale - centerClientX / scale);
    panY -= (centerClientY / oldScale - centerClientY / scale);

    applyTransform();
    renderLinks();
  }

  if (touchPanning && lastTouchCenter) {
    const dx = center.x - lastTouchCenter.x;
    const dy = center.y - lastTouchCenter.y;
    panX += dx;
    panY += dy;
    lastTouchCenter = center;
    applyTransform();
    renderLinks();
  }
}, { passive: false });

canvasContainer.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    touchZooming = false;
    touchPanning = false;
    lastTouchCenter = null;
    save(false);
  }
}, { passive: false });

themeDropBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (nodeDropdownContainer) nodeDropdownContainer.classList.remove('active');
  themeDropdownContainer.classList.toggle('active');
});

themeOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    const theme = opt.dataset.theme;
    document.body.className = theme;
    state.theme = theme;
    save(false);
    themeDropdownContainer.classList.remove('active');
  });
});

document.querySelector('#addNodeBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  nodeFormatDropdown.parentElement.classList.toggle('active');
});

nodeOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    const format = opt.dataset.format;
    const size = opt.dataset.size;
    addNode(format, size);
    nodeFormatDropdown.parentElement.classList.remove('active');
  });
});

load();
applyTransform();

window.addEventListener('pointerdown', (e) => {
  if (nodeDropdownContainer && !nodeDropdownContainer.contains(e.target)) {
    nodeDropdownContainer.classList.remove('active');
  }
  if (themeDropdownContainer && !themeDropdownContainer.contains(e.target)) {
    themeDropdownContainer.classList.remove('active');
  }
});

function selectNodeByElement(el, e) {
    const id = el.dataset.id;

    if (e.shiftKey) {
        if (multiSelected.has(id)) {
            multiSelected.delete(id);
            el.classList.remove("selected");
        } else {
            multiSelected.add(id);
            el.classList.add("selected");
        }
    } else {
        multiSelected.clear();
        document.querySelectorAll(".node").forEach(nd => nd.classList.remove("selected"));

        multiSelected.add(id);
        el.classList.add("selected");
    }
}

function getGlobalBoundingBox(nodes) {
    if (nodes.length === 0) {
        return { x: 0, y: 0, width: 100, height: 100 };
    }

    let minX = nodes[0].x;
    let minY = nodes[0].y;
    let maxX = nodes[0].x;
    let maxY = nodes[0].y;

    nodes.forEach(n => {
        const dims = getNodeDimensions(n.id);
        const nw = dims.width;
        const nh = dims.height;

        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + nw);
        maxY = Math.max(maxY, n.y + nh);
    });

    const padding = 100;
    
    const finalMinX = minX - padding;
    const finalMinY = minY - padding;
    const finalWidth = (maxX - finalMinX) + padding;
    const finalHeight = (maxY - finalMinY) + padding;


    return {
        x: finalMinX,
        y: finalMinY,
        width: finalWidth,
        height: finalHeight
    };
}

async function exportPNG() {
  const node = document.getElementById("canvas");

  // pega o tema do local correto (body)
  const themeElement = document.body;

  const bg = getComputedStyle(themeElement)
                .getPropertyValue('--bg')
                .trim();

  const dataUrl = await htmlToImage.toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: bg
  });

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Janeiro = 0
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const filename = `mapamental-${day}-${month}-${year}-${hours}h${minutes}.json`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Delete") {
        selectedNodes.forEach(n => {
            // remove conexões do nó
            deleteConnectionsOfNode(n.dataset.id);

            // remove o nó
            n.remove();
        });
        selectedNodes.clear();
        updateConnections();
    }
});
/*
// =============================
// SELEÇÃO POR ARRASTE (DRAG BOX) - substitua o bloco antigo por este
// =============================
let isSelecting = false;
let selectStartX = 0;
let selectStartY = 0;

canvasContainer.addEventListener("mousedown", (e) => {
  // só inicia seleção se for botão esquerdo
  if (e.button !== 0) return;

  // impedir seleção quando clicar em cima de um nó/controle
  if (e.target.closest(".node") || e.target.closest(".controls")) return;

  // inicia seleção
  isSelecting = true;

  const rect = canvasContainer.getBoundingClientRect();
  // converte o ponto clicado para COORDENADAS DO MUNDO (antes do transform)
  selectStartX = (e.clientX - rect.left - panX) / scale;
  selectStartY = (e.clientY - rect.top - panY) / scale;

  // desenha box na tela (em coords de tela)
  selectionBox.style.left = `${e.clientX - rect.left}px`;
  selectionBox.style.top = `${e.clientY - rect.top}px`;
  selectionBox.style.width = "0px";
  selectionBox.style.height = "0px";
  selectionBox.style.display = "block";

  // limpar seleção antiga (se quiser que shift mantenha, trate aqui)
  multiSelected.clear();
  document.querySelectorAll(".node").forEach(nd => nd.classList.remove("selected"));
});

window.addEventListener("mousemove", (e) => {
  if (!isSelecting) return;

  const rect = canvasContainer.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left);
  const mouseY = (e.clientY - rect.top);

  const startX = (selectStartX * scale + panX);
  const startY = (selectStartY * scale + panY);

  const w = mouseX - startX;
  const h = mouseY - startY;

  selectionBox.style.left = `${Math.min(startX, mouseX)}px`;
  selectionBox.style.top = `${Math.min(startY, mouseY)}px`;
  selectionBox.style.width = `${Math.abs(w)}px`;
  selectionBox.style.height = `${Math.abs(h)}px`;
});

window.addEventListener("mouseup", (e) => {
  if (!isSelecting) return;
  isSelecting = false;
  selectionBox.style.display = "none";

  const rect = canvasContainer.getBoundingClientRect();

  const boxScreen = {
    x: parseFloat(selectionBox.style.left),
    y: parseFloat(selectionBox.style.top),
    w: parseFloat(selectionBox.style.width),
    h: parseFloat(selectionBox.style.height)
  };

  // converte a caixa para COORDENADAS DO MUNDO (antes do transform)
  const boxWorld = {
    x: (boxScreen.x - panX) / scale,
    y: (boxScreen.y - panY) / scale,
    w: boxScreen.w / scale,
    h: boxScreen.h / scale
  };

  // calcula colisão usando as coordenadas dos nós que você já guarda (state.nodes)
  multiSelected.clear();

  for (const n of state.nodes) {
    const dims = getNodeDimensions(n.id);
    const nx1 = n.x;
    const ny1 = n.y;
    const nx2 = n.x + dims.width;
    const ny2 = n.y + dims.height;

    const intersects =
      nx2 >= boxWorld.x &&
      nx1 <= boxWorld.x + boxWorld.w &&
      ny2 >= boxWorld.y &&
      ny1 <= boxWorld.y + boxWorld.h;

    if (intersects) {
      multiSelected.add(n.id);
    }
  }

  // aplicar visual
  document.querySelectorAll(".node").forEach(nd => {
    const id = nd.dataset.id;
    nd.classList.toggle("selected", multiSelected.has(id));
  });
});

let selectedNodes = new Set();
let isDraggingNode = false;
let draggingNode = null;
let dragStartGroup = [];

nodeElement.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return; // apenas botão esquerdo

    draggingNode = nodeElement;

    // SE NÃO estiver segurando Ctrl → limpa seleção e seleciona só esse nó
    if (!e.ctrlKey) {
        selectedNodes.forEach(n => n.classList.remove("selected"));
        selectedNodes.clear();
    }

    // Marca ele como selecionado se já não estiver
    if (!selectedNodes.has(nodeElement)) {
        nodeElement.classList.add("selected");
        selectedNodes.add(nodeElement);
    }

    // Prepara arrasto em grupo
    dragStartGroup = [];
    selectedNodes.forEach(n => {
        dragStartGroup.push({
            el: n,
            x: parseFloat(n.style.left),
            y: parseFloat(n.style.top)
        });
    });

    isDraggingNode = true;
    e.stopPropagation();
});
*/