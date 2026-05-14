window.openDet = openDet;
window.closeDet = closeDet;
window.closeWelcome = closeWelcome;
window.toggleDarkMode = toggleDarkMode;
window.toggleFdd = toggleFdd;
window.toggleDdChip = toggleDdChip;
window.handleSort = handleSort;
window.removeFilter = removeFilter;
window.clearAllFilters = clearAllFilters;

const modelosIDs = [1, 2, 3, 4];

const FILTER_LABELS = {
    all: 'Todos', nervoso: 'Nervoso', cardio: 'Cardiovascular',
    esqueletico: 'Esquelético', muscular: 'Muscular', resp: 'Respiratório',
    digest: 'Digestivo', urin: 'Urinário', senso: 'Sensorial'
};

let modelosData = [];
let currentView = 'grid'; 
let currentSort = 'az';
let activeFilters = new Set(['all']);
let pendingFilters = new Set(['all']);
let isDark = false;
let currentOpenId = null;

async function carregarModelos() {
    const grid = document.querySelector('.cards-grid');
    if (grid) grid.innerHTML = '<p>Carregando modelos...</p>';

    try {
        const promessas = modelosIDs.map(id => 
            fetch(`models/${id}.json`)
                .then(res => {
                    if (!res.ok) throw new Error(`Arquivo ${id}.json não encontrado`);
                    return res.json();
                })
                .then(data => {
    const sistemaBruto = data.objsystem || "";
    let categoriaChave = 'all';

    // Traduz o nome do sistema para a chave usada no FILTER_LABELS
    if (sistemaBruto.toLowerCase().includes('nervoso')) categoriaChave = 'nervoso';
    else if (sistemaBruto.toLowerCase().includes('cardio')) categoriaChave = 'cardio';
    else if (sistemaBruto.toLowerCase().includes('esquel')) categoriaChave = 'esqueletico';
    else if (sistemaBruto.toLowerCase().includes('muscular')) categoriaChave = 'muscular';
    else if (sistemaBruto.toLowerCase().includes('respira')) categoriaChave = 'resp';
    else if (sistemaBruto.toLowerCase().includes('digest')) categoriaChave = 'digest';
    else if (sistemaBruto.toLowerCase().includes('urin')) categoriaChave = 'urin';
    else if (sistemaBruto.toLowerCase().includes('senso')) categoriaChave = 'senso';

    return { 
        ...data, 
        id, 
        nome: data.objname || "Sem Nome",
        sistema: sistemaBruto,
        img: `models/${id}.png`, 
        cat: categoriaChave
    };
})
        );

        modelosData = await Promise.all(promessas);

        const spanTotal = document.getElementById('count-total');
        if (spanTotal) spanTotal.textContent = modelosData.length;
        
        loadState(); 
        syncDropdownUI();
        renderActiveChips(); 
        render();
        if (typeof verificarUrlParaAbrir === 'function') verificarUrlParaAbrir();
        
    } catch (error) {
        console.error("Erro ao carregar arquivos JSON:", error);
        if (grid) grid.innerHTML = `<p>Erro: ${error.message}</p>`;
    }
}

function inicializarApp() {
    loadState(); 
    renderActiveChips(); 
    render();

    const urlParams = new URLSearchParams(window.location.search);
    const idParaAbrir = urlParams.get('id');

    if (idParaAbrir) {
        const welcomeModal = document.getElementById('welcome-overlay');
        if (welcomeModal) welcomeModal.style.display = 'none';
        document.getElementById('app').classList.add('visible');

        const modelo = modelosData.find(m => m.id == idParaAbrir);
        if (modelo) {
            setTimeout(() => openDet(modelo.objname, modelo.objsystem, modelo.id), 100);
        }
    }

    const searchInput = document.querySelector('.hd-search input');
    if (searchInput) searchInput.addEventListener('input', render);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDet();
    });
}


function renderizarCards(lista) {
    const grid = document.getElementById('cards-grid');
    grid.innerHTML = lista.map(modelo => `
        <div class="m-card" onclick="openDet('${modelo.objname}', '${modelo.objsystem}', ${modelo.id})">
            <div class="c-thumb">
                <img src="models/${modelo.id}.png" class="thumb-img" alt="${modelo.objname}">
                <div class="c-overlay">
                    <button class="v3d-btn">Visualizar 3D</button>
                </div>
            </div>
            <div class="c-body">
                <div class="c-name">${modelo.objname}</div>
                <div class="c-sys">${modelo.objsystem}</div>
            </div>
        </div>
    `).join('');
}

  window.onload = () => {
    carregarModelos();
    loadState(); 
    renderActiveChips(); 
    render();

    const urlParams = new URLSearchParams(window.location.search);
    const idParaAbrir = urlParams.get('id');

    if (idParaAbrir) {
        const welcomeModal = document.getElementById('welcome-overlay');
        if (welcomeModal) {
            welcomeModal.style.display = 'none';
        }
        document.getElementById('app').classList.add('visible');

        const modelo = modelosData.find(m => m.id == idParaAbrir);
        if (modelo) {
            setTimeout(() => openDet(modelo.nome, modelo.sistema, modelo.id), 100);
        }
    } else {
        
    }

    const searchInput = document.querySelector('.hd-search input');
    if (searchInput) {
      searchInput.addEventListener('input', render);
    }

    const vBtns = document.querySelectorAll('.vbtn');
    vBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        currentView = idx === 0 ? 'grid' : 'list';
        updateViewButtons();
        saveState();
        render();
      });
    });

    document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDet();
      }
    });
    document.addEventListener('keydown', (event) => {
    const welcomeModal = document.getElementById('welcome-overlay');
    
    if (welcomeModal && welcomeModal.style.display !== 'none') {
        if (event.key === 'Enter') {
            closeWelcome();
        }
    }
  });
  };

  function verificarUrlParaAbrir() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParaAbrir = urlParams.get('id');

    if (idParaAbrir) {
        const welcomeModal = document.getElementById('welcome-overlay');
        if (welcomeModal) welcomeModal.style.display = 'none';
        document.getElementById('app').classList.add('visible');

        const modelo = modelosData.find(m => m.id == idParaAbrir);
        if (modelo) {
            setTimeout(() => openDet(modelo.nome, modelo.sistema, modelo.id), 100);
        }
    }
}

  function saveState() {
    const state = {
      view: currentView,
      sort: currentSort,
      dark: isDark,
      favorites: modelosData.filter(m => m.fav).map(m => m.id)
    };
    localStorage.setItem('ra_explorer_prefs', JSON.stringify(state));
  }

  function loadState() {
    const saved = localStorage.getItem('ra_explorer_prefs');
    if (saved) {
      const state = JSON.parse(saved);
      isDark = state.dark || false;
      applyTheme();
      currentView = state.view || 'grid';
      currentSort = state.sort || 'az';

      const sortSelect = document.querySelector('.sort-sel');
      if (sortSelect) sortSelect.value = currentSort;

      if (state.favorites) {
        modelosData.forEach(m => {
          m.fav = state.favorites.includes(m.id);
        });
      }
    }
    updateViewButtons();
  }

  function updateViewButtons() {
    const btns = document.querySelectorAll('.vbtn');
    if (btns.length < 2) return;
    btns.forEach(b => b.classList.remove('active'));
    
    if (currentView === 'grid') btns[0].classList.add('active');
    else btns[1].classList.add('active');
  }

  function render() {
    const grid = document.querySelector('.cards-grid');
    if (!grid) return;

    const spanTotal = document.getElementById('count-total');
    if (spanTotal) spanTotal.textContent = modelosData.length;

    const searchInput = document.querySelector('.hd-search input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

    grid.className = `cards-grid ${currentView === 'list' ? 'list-mode' : ''}`;

    let filtrados = modelosData.filter(m => {
        const nome = m.objname ? m.objname.toLowerCase() : "";
        const sistema = m.objsystem ? m.objsystem.toLowerCase() : "";
        
        const matchesSearch = nome.includes(searchTerm) || sistema.includes(searchTerm);
        const matchesCat = activeFilters.has('all') || activeFilters.has(m.cat);

        return matchesSearch && matchesCat;
    });

    const spanFiltrados = document.getElementById('count-filtrados');
    if (spanFiltrados) spanFiltrados.textContent = filtrados.length;

    if (currentSort === 'az') {
        filtrados.sort((a, b) => (a.objname || "").localeCompare(b.objname || ""));
    } else if (currentSort === 'za') {
        filtrados.sort((a, b) => (b.objname || "").localeCompare(a.objname || ""));
    }

    grid.innerHTML = "";

    setTimeout(() => {
        if (filtrados.length === 0) {
            grid.innerHTML = '<div class="no-results">Nenhum modelo encontrado para esta busca.</div>';
            return;
        }

        grid.innerHTML = filtrados.map((m, index) => {
            return `
                <div class="m-card" 
                     style="animation-delay: ${index * 30}ms" 
                     onclick="openDet('${m.objname}','${m.objsystem}', ${m.id})">
                    <div class="c-thumb">
                        <img class="thumb-img" src="models/${m.id}.png" alt="${m.objname}" onerror="this.src='placeholder.png'">
                        <div class="c-overlay">
                            <button class="v3d-btn">
                                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                </svg>
                                Ver 3D
                            </button>
                        </div>
                    </div>
                    <div class="c-body">
                        <div class="c-name">${m.objname}</div>
                        <div class="c-sys">${m.objsystem}</div>
                    </div>
                </div>
            `;
        }).join('');
    }, 10);
}

  function toggleFdd() {
    const btn = document.getElementById('filter-btn');
    const dd = document.getElementById('fdd');
    const open = dd.classList.toggle('open');
    btn.classList.toggle('open', open);
    
    pendingFilters = new Set(activeFilters);
    syncDropdownUI();

    if (open) setTimeout(() => document.addEventListener('click', outsideFdd), 10);
  }

  function outsideFdd(e) {
    const wrap = document.querySelector('.fdd-wrap');
    if (!wrap.contains(e.target)) {
      document.getElementById('fdd').classList.remove('open');
      document.getElementById('filter-btn').classList.remove('open');
      document.removeEventListener('click', outsideFdd);
    }
  }

  function toggleDdChip(el, key) {
    if (key === 'all') {
        activeFilters = new Set(['all']);
    } else {
        activeFilters.delete('all');
        if (activeFilters.has(key)) {
            activeFilters.delete(key);
            if (activeFilters.size === 0) activeFilters.add('all');
        } else {
            activeFilters.add(key);
        }
    }

    syncDropdownUI();
    renderActiveChips();
    render();
  }

  function syncDropdownUI() {
    const counts = getCounts(); 
    
    document.querySelectorAll('.ddchip').forEach(c => {
        const key = c.getAttribute('onclick').match(/'([^']+)'/)[1];
        
        c.classList.toggle('active', activeFilters.has(key));
        
        const count = counts[key] || 0;
        const spanCnt = c.querySelector('.ddcnt');
        if (spanCnt) spanCnt.textContent = `(${count})`;
    });
  }

  function applyFilters() {
    activeFilters = new Set(pendingFilters);
    document.getElementById('fdd').classList.remove('open');
    document.getElementById('filter-btn').classList.remove('open');
    renderActiveChips();
    render();
  }

  function renderActiveChips() {
    const row = document.getElementById('active-chips-row');
    const badge = document.getElementById('filter-badge');
    const clearBtn = document.getElementById('clear-all-btn');
    const isDefault = activeFilters.has('all') && activeFilters.size === 1;

    if (isDefault) {
      row.innerHTML = '';
      badge.style.display = 'none';
      clearBtn.style.display = 'none';
      return;
    }

    const visualFilters = [...activeFilters].filter(k => k !== 'all');
    badge.textContent = visualFilters.length;
    badge.style.display = 'inline-flex';
    clearBtn.style.display = 'inline-block';

    row.innerHTML = visualFilters.map(key => `
      <div class="fchip active">
        ${FILTER_LABELS[key]}
        <span class="fx" onclick="removeFilter('${key}')">×</span>
      </div>
    `).join('');
  }

  function removeFilter(key) {
    activeFilters.delete(key);
    if (activeFilters.size === 0) activeFilters.add('all');
    pendingFilters = new Set(activeFilters);
    renderActiveChips();
    render();
  }

  function clearAllFilters() {
    activeFilters = new Set(['all']);
    pendingFilters = new Set(['all']);
    renderActiveChips();
    render();
  }

  function getCounts() {
    const counts = {};
    Object.keys(FILTER_LABELS).forEach(key => counts[key] = 0);

    modelosData.forEach(m => {
        if (counts[m.cat] !== undefined) {
            counts[m.cat]++;
        }
    });

    counts['all'] = modelosData.length;
    return counts;
  }

  function handleSort(value) {
    currentSort = value;
    saveState();
    render();
  }

  function toggleDarkMode() {
    isDark = !isDark;
    applyTheme();
    saveState();
  }

  function applyTheme() {
      const btn = document.getElementById('theme-icon');
      if (isDark) {
          document.body.classList.add('dark-mode');
          btn.textContent = '☀️';
      } else {
          document.body.classList.remove('dark-mode');
          btn.textContent = '🌙';
      }
  }

  function togFav(btn, id) {
    const item = modelosData.find(m => m.id === id);
    if (item) {
        item.fav = !item.fav;
        
        btn.classList.toggle('active', item.fav);
        btn.innerHTML = item.fav ? '❤️' : '🤍';

        saveState();
    }
  }

  function openDet(nome, sistema, id) {
    currentOpenId = id;
    const frame = document.getElementById('viewer-frame');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    
    const url = `viewer.html?title=${encodeURIComponent(nome)}&sys=${encodeURIComponent(sistema)}&id=${id}&theme=${isDark ? 'dark' : 'light'}&modal=true`;
    
    frame.src = url;
    document.getElementById('det-ov').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

  function shareModel(id, btnEl) {
    const targetId = id || currentOpenId;
    if (!targetId) return;

    const baseUrl = window.location.href.split('?')[0];
    const shareUrl = `${baseUrl}?id=${targetId}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
        if (btnEl) {
            const originalHTML = btnEl.innerHTML;
            
            btnEl.innerHTML = "✅ Copiado!";
            btnEl.classList.add('copied');
            
            setTimeout(() => {
                btnEl.innerHTML = originalHTML;
                btnEl.classList.remove('copied');
            }, 2000);
        }
    }).catch(err => {
        console.error('Erro ao copiar:', err);
    });
  }

  function togFavModal(btn) {
    if (currentOpenId === null) return;
    
    const item = modelosData.find(m => m.id === currentOpenId);
    if (item) {
        item.fav = !item.fav;
        
        btn.classList.toggle('active', item.fav);
        btn.innerHTML = item.fav ? '❤️ Favoritado' : '🤍 Favoritar';
        
        saveState();
        render();
    }
  }

  function openModel(modelId) {
    const modal = document.getElementById('det-ov');
    const frame = document.getElementById('viewer-frame');
    
    const viewerUrl = `viewer.html?id=${modelId}`;
    
    frame.src = viewerUrl;
    modal.style.display = 'flex';
    
}

  function closeDet() {
    const modal = document.getElementById('det-ov');
    const frame = document.getElementById('viewer-frame');
    modal.style.display = 'none';
    frame.src = "";
  }

  function closeWelcome() {
    const o = document.getElementById('welcome-overlay');
    o.style.opacity = '0';
    setTimeout(() => { 
      o.style.display = 'none'; 
      document.getElementById('app').classList.add('visible'); 
    }, 310);
  }

  function swTab(id, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ['ch','desc','res'].forEach(t => { 
      document.getElementById('tc-'+t).style.display = t === id ? 'block' : 'none'; 
    });
  }

  function toggleSearch() {
    const searchPanel = document.getElementById('anatomy-search');
    if (!searchPanel) return;

    const isOpen = searchPanel.classList.toggle('open');

    if (isOpen) {
        const input = searchPanel.querySelector('input');
        if (input) setTimeout(() => input.focus(), 100);
    }
  }

  function filterAnatomy(term) {
      const items = document.querySelectorAll('.as-item');
      const filter = term.toLowerCase();

      items.forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(filter) ? 'flex' : 'none';
      });
  }

  function selectAnatomy(el) {
      document.querySelectorAll('.as-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
      
      console.log("Estrutura selecionada:", el.textContent);
  }

  function toggleFullscreen() {
    const elem = document.getElementById('det-ov'); 

    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    carregarModelos();
    const params = new URLSearchParams(window.location.search);
    
    const titulo = params.get('title');
    const sistema = params.get('sys');

    if (titulo) document.getElementById('det-title').textContent = titulo;
    if (sistema) document.getElementById('det-sys').textContent = sistema;
    
    if (titulo) document.getElementById('det-bc').textContent = titulo;
});