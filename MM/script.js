// script.js - Mindmap (version B) - pan, zoom focused, themes, save/load/export/import

// block browser zoom when ctrl+wheel (prevent default)
document.addEventListener('wheel', function (e) {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

// STATE
let state = { nodes: [], links: [], theme: "dark", view: { panX: 0, panY: 0, scale: 1 } };

let isPanning = false;
let panStart = { x: 0, y: 0 };
let viewStart = { x: 0, y: 0 };

let scale = 1;
let zoom = 1;
let panX = 0, panY = 0;

const canvas = document.getElementById("canvas");
const canvasContainer = document.getElementById("canvasContainer");
const svg = document.getElementById('svg');

const STORAGE_KEY = 'mindmap-v3';

const addNodeBtn = document.getElementById('addNode');
const dropdown = document.querySelector('.dropdown');
const themeOptions = document.querySelectorAll('.dropdown-content div');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const clearBtn = document.getElementById('clearBtn');

// helper uid
function uid() { return 'id_' + Math.random().toString(36).substr(2, 9); }

// create node DOM (no append here)
function createNode(n) {
  const el = document.createElement('div');
  el.className = 'node';
  el.style.left = n.x + 'px';
  el.style.top = n.y + 'px';
  el.dataset.id = n.id;

  const ta = document.createElement('textarea');
  ta.value = n.text || '';
  ta.addEventListener('input', () => { n.text = ta.value; save(false); });

  const controls = document.createElement('div');
  controls.className = 'controls';

  const btnConnect = document.createElement('button');
  btnConnect.className = 'connect-btn';
  btnConnect.textContent = 'C';
  btnConnect.title = 'Conectar';
  btnConnect.onclick = (e) => { e.stopPropagation(); startConnection(n.id); };

  const btnDelete = document.createElement('button');
  btnDelete.className = 'delete-btn';
  btnDelete.textContent = 'D';
  btnDelete.title = 'Deletar nó';
  btnDelete.onclick = (e) => { e.stopPropagation(); deleteNode(n.id); };

  controls.append(btnConnect, btnDelete);
  el.append(ta, controls);

  // pointerdown: begin drag unless clicking on textarea or buttons
  el.addEventListener('pointerdown', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
      // don't start dragging when editing text or clicking a control
      return;
    }
    selectNode(n.id);
    startDrag(e, el, n);
  });

  return el;
}

// add new node (center-ish)
function addNode() {
  const n = { id: uid(), x: 300 + Math.random() * 200, y: 200 + Math.random() * 200, text: 'Novo nó' };
  state.nodes.push(n);
  canvas.appendChild(createNode(n));
  renderLinks();
  save(false);
}

// drag logic (works in world coordinates)
function startDrag(e, el, n) {
  e.preventDefault();
  const startX = e.clientX;
  const startY = e.clientY;
  const ox = n.x;
  const oy = n.y;

  function move(ev) {
    // move in screen space then convert to world (canvas is transformed)
    // Because nodes positions are in world coordinates, and canvas transform is separate,
    // we update node world position using delta in screen / scale.
    const dx = (ev.clientX - startX) / scale;
    const dy = (ev.clientY - startY) / scale;
    n.x = ox + dx;
    n.y = oy + dy;
    el.style.left = n.x + 'px';
    el.style.top = n.y + 'px';
    renderLinks();
  }

  function up() {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    save(false);
  }

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
}

// selection
let selected = null;
function selectNode(id) {
  document.querySelectorAll('.node').forEach(nd => nd.classList.remove('selected'));
  const el = document.querySelector(`.node[data-id="${id}"]`);
  if (el) el.classList.add('selected');
  selected = id;
}

// connection creation
let connectFrom = null;
function startConnection(id) {
  if (!connectFrom) {
    connectFrom = id;
    // visual cue could be added
    return;
  }
  if (connectFrom !== id) {
    state.links.push({ id: uid(), from: connectFrom, to: id });
    connectFrom = null;
    renderLinks();
    save(false);
  }
}

// delete node
function deleteNode(id) {
  state.nodes = state.nodes.filter(n => n.id !== id);
  state.links = state.links.filter(l => l.from !== id && l.to !== id);
  document.querySelector(`.node[data-id="${id}"]`)?.remove();
  renderLinks();
  save(false);
}

// render links (paths + delete circle)
function renderLinks() {
  // remove previous svg children
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  for (const l of state.links) {
    const a = state.nodes.find(n => n.id === l.from);
    const b = state.nodes.find(n => n.id === l.to);
    if (!a || !b) continue;

    const ax = a.x + (a.width || 80);
    const ay = a.y + 40;
    const bx = b.x + (b.width || 80);
    const by = b.y + 40;
    const dx = Math.abs(bx - ax) / 2;

    const d = `M ${ax} ${ay} C ${ax + dx} ${ay} ${bx - dx} ${by} ${bx} ${by}`;

    // path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', 'var(--accent)');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.95');
    path.style.pointerEvents = 'none'; // don't capture clicks

    svg.appendChild(path);

    // midpoint (approx)
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;

    // clickable delete circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', mx);
    circle.setAttribute('cy', my);
    circle.setAttribute('r', '8');
    circle.setAttribute('fill', 'var(--danger)');
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '1.5');
    circle.classList.add('delete-link-btn'); // enables pointer-events
    circle.onclick = () => {
      state.links = state.links.filter(x => x.id !== l.id);
      renderLinks();
      save(false);
    };

    svg.appendChild(circle);
  }
}

// SAVE / LOAD (localStorage)
function save(show = true) {
  // store view as well
  state.view = { panX, panY, scale, canvasWidth: canvas.offsetWidth, canvasHeight: canvas.offsetHeight };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (show) console.log('Mapa salvo');
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
  // apply theme
  if (state.theme) document.body.className = state.theme;
  // apply view
  if (state.view) {
    panX = state.view.panX || 0;
    panY = state.view.panY || 0;
    scale = state.view.scale || 1;
    applyTransform();
  }
}

// rebuild DOM nodes from state
function rebuild() {
  document.querySelectorAll('.node').forEach(n => n.remove());
  for (const n of state.nodes) {
    const el = createNode(n);
    canvas.appendChild(el);
  }
  renderLinks();
}

// export / import
exportBtn.onclick = () => {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'mindmap.json'; a.click();
  URL.revokeObjectURL(url);
};

importBtn.onclick = () => importFile.click();

importFile.onchange = async (e) => {
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
};

// clear all
clearBtn.onclick = () => {
  if (!confirm('Tem certeza que deseja apagar tudo?')) return;
  state = { nodes: [], links: [], theme: state.theme || 'dark', view: { panX: 0, panY: 0, scale: 1 } };
  document.querySelectorAll('.node').forEach(n => n.remove());
  renderLinks();
  save(true);
};

// APPLY CSS transform according to panX/panY/scale
function applyTransform() {
  canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

// ZOOM (Ctrl + wheel) centered on mouse
canvasContainer.addEventListener("wheel", (e) => {
    if (!e.ctrlKey) return; // só dá zoom com CTRL+scroll
    e.preventDefault();

    const scaleFactor = 1.1;
    const mouseX = e.clientX - canvasContainer.offsetLeft;
    const mouseY = e.clientY - canvasContainer.offsetTop;

    const oldZoom = zoom;
    zoom *= e.deltaY < 0 ? scaleFactor : 1 / scaleFactor;

    // Mantém o ponto do mouse estável na tela
    panX -= (mouseX / oldZoom - mouseX / zoom);
    panY -= (mouseY / oldZoom - mouseY / zoom);

    canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
}, { passive: false });

let startX, startY;

// PAN with middle mouse (button === 1)
canvasContainer.addEventListener("mousedown", (e) => {
    if (e.button !== 1) return; // botão do meio
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    canvasContainer.style.cursor = "grab";
});

window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
});

window.addEventListener("mouseup", () => {
    isPanning = false;
    canvasContainer.style.cursor = "default";
});

// dropdown behavior & theme selection
document.querySelector('.drop-btn').onclick = () => { dropdown.classList.toggle('active'); };
themeOptions.forEach(opt => {
  opt.onclick = () => {
    const theme = opt.dataset.theme;
    document.body.className = theme;
    state.theme = theme;
    save(false);
    dropdown.classList.remove('active');
  };
});

// allow clicking delete on svg circles (pointer-events had been disabled on svg)
document.querySelectorAll('.delete-link-btn').forEach(n => n.style.pointerEvents = 'all');

// initial buttons
addNodeBtn.onclick = addNode;
saveBtn.onclick = () => save(true);
loadBtn.onclick = load;

// load stored state on start
load();

// ensure canvas initial transform applied
applyTransform();
