window.openDet = openDet;
window.closeDet = closeDet;
window.closeWelcome = closeWelcome;
window.toggleDarkMode = toggleDarkMode;
window.toggleFdd = toggleFdd;
window.toggleDdChip = toggleDdChip;
window.handleSort = handleSort;
window.removeFilter = removeFilter;
window.clearAllFilters = clearAllFilters;

const modelosIDs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];

const FILTER_LABELS = {
    all: 'Todos', 
    nervoso: 'Nervoso', 
    cardio: 'Cardiovascular', 
    tegum: 'Tegumentar', 
    celul: 'Célula', 
    esqueletico: 'Esquelético', 
    muscular: 'Muscular', 
    resp: 'Respiratório', 
    digest: 'Digestivo', 
    urin: 'Urinário', 
    senso: 'Sensorial', 
    repro: 'Reprodutor', 
    infec: 'Infeccioso',
    linf: 'Linfático',
    circ: 'Circulatório',
    audi: 'Auditivo',
    endoc: 'Endócrino',
    estom: 'Estomatognático'
};

let modelosData = [];
let currentView = 'grid'; 
let currentSort = 'az';
let activeFilters = new Set(['all']);
let isDark = false;
let currentOpenId = null;

// Realiza o fetch assíncrono dos arquivos JSON de metadados de cada modelo, categoriza por sistema e dispara o setup inicial da UI.
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
    // Transforma em array mesmo se no JSON for string única ou lista
    let sistemasBrutos = [];
    if (Array.isArray(data.objsystem)) {
        sistemasBrutos = data.objsystem;
    } else if (typeof data.objsystem === 'string') {
        sistemasBrutos = data.objsystem.split(/[,/]/).map(s => s.trim());
    }

    // Array de categorias correspondentes ao modelo
    let categoriasChave = [];

    sistemasBrutos.forEach(sis => {
        const sisLimpo = sis.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (sisLimpo.includes('nervoso') && !categoriasChave.includes('nervoso')) categoriasChave.push('nervoso');
    if (sisLimpo.includes('cardio') && !categoriasChave.includes('cardio')) categoriasChave.push('cardio');
    if (sisLimpo.includes('tegum') && !categoriasChave.includes('tegum')) categoriasChave.push('tegum');
    if (sisLimpo.includes('celul') && !categoriasChave.includes('celul')) categoriasChave.push('celul');
    if (sisLimpo.includes('esquel') && !categoriasChave.includes('esqueletico')) categoriasChave.push('esqueletico');
    if (sisLimpo.includes('muscular') && !categoriasChave.includes('muscular')) categoriasChave.push('muscular');
    if (sisLimpo.includes('respira') && !categoriasChave.includes('resp')) categoriasChave.push('resp');
    if (sisLimpo.includes('digest') && !categoriasChave.includes('digest')) categoriasChave.push('digest');
    if (sisLimpo.includes('urin') && !categoriasChave.includes('urin')) categoriasChave.push('urin');
    if (sisLimpo.includes('senso') && !categoriasChave.includes('senso')) categoriasChave.push('senso');
    if (sisLimpo.includes('repro') && !categoriasChave.includes('repro')) categoriasChave.push('repro');
    if (sisLimpo.includes('infec') && !categoriasChave.includes('infec')) categoriasChave.push('infec');
    if (sisLimpo.includes('linf') && !categoriasChave.includes('linf')) categoriasChave.push('linf');
    if (sisLimpo.includes('circ') && !categoriasChave.includes('circ')) categoriasChave.push('circ');
    if (sisLimpo.includes('audi') && !categoriasChave.includes('audi')) categoriasChave.push('audi');
    if (sisLimpo.includes('endoc') && !categoriasChave.includes('endoc')) categoriasChave.push('endoc');
    if (sisLimpo.includes('estom') && !categoriasChave.includes('estom')) categoriasChave.push('estom');

    });

    if (categoriasChave.length === 0) categoriasChave.push('all');

    return { 
        ...data, 
        id, 
        nome: data.objname || "Sem Nome",
        sistema: sistemasBrutos.join(' / '), // Exibe "Sensorial / Nervoso" no card
        img: `models/${id}.png`, 
        cat: categoriasChave // Agora é uma array de categorias!
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

// Evento disparado quando o DOM é totalmente carregado; inicializa filtros, estados de visualização e escuta cliques/atalhos de teclado.
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

  // Verifica se existe um ID de modelo na URL atual e, se houver, pula a tela de boas-vindas para abri-lo automaticamente.
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

// Salva as preferências atuais do usuário (modo de exibição, ordenação, tema e favoritos) no LocalStorage do navegador.
  function saveState() {
    const state = {
      view: currentView,
      sort: currentSort,
      dark: isDark,
      favorites: modelosData.filter(m => m.fav).map(m => m.id)
    };
    localStorage.setItem('ra_explorer_prefs', JSON.stringify(state));
  }

  // Recupera as configurações salvas no LocalStorage e as reaplica na interface durante a inicialização do app.
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

  // Atualiza o estado visual ativo dos botões seletores entre os modos de exibição em Grade (Grid) ou Lista (List).
  function updateViewButtons() {
    const btns = document.querySelectorAll('.vbtn');
    if (btns.length < 2) return;
    btns.forEach(b => b.classList.remove('active'));
    
    if (currentView === 'grid') btns[0].classList.add('active');
    else btns[1].classList.add('active');
  }

  // Função central de renderização que filtra, ordena e constrói dinamicamente o HTML dos cards dos modelos na tela principal.
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
      const sistema = m.sistema ? m.sistema.toLowerCase() : "";
      
      const matchesSearch = nome.includes(searchTerm) || sistema.includes(searchTerm);
      
      // Verifica se m.cat (que agora é Array) tem interseção com os filtros ativos
      const matchesCat = activeFilters.has('all') || m.cat.some(c => activeFilters.has(c));

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

// Alterna a abertura e fechamento do painel dropdown de filtros por sistema anatômico.
  function toggleFdd() {
    const btn = document.getElementById('filter-btn');
    const dd = document.getElementById('fdd');
    const open = dd.classList.toggle('open');
    btn.classList.toggle('open', open);
    
    syncDropdownUI();

    if (open) setTimeout(() => document.addEventListener('click', outsideFdd), 10);
  }

  // Monitora cliques na página para fechar automaticamente o dropdown de filtros caso o usuário clique fora da área do menu.
  function outsideFdd(e) {
    const wrap = document.querySelector('.fdd-wrap');
    if (!wrap.contains(e.target)) {
      document.getElementById('fdd').classList.remove('open');
      document.getElementById('filter-btn').classList.remove('open');
      document.removeEventListener('click', outsideFdd);
    }
  }

  // Adiciona ou remove um sistema anatômico do conjunto de filtros ativos ao interagir com as opções do dropdown.
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

  // Sincroniza as classes visuais do dropdown de filtros e atualiza os contadores numéricos de modelos em cada categoria.
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

  // Renderiza os "chips" (etiquetas removíveis) logo acima da grade para indicar quais filtros de sistemas estão ativos no momento.
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

  // Remove um filtro específico do conjunto de buscas ativas e atualiza a exibição da tela.
  function removeFilter(key) {
    activeFilters.delete(key);
    if (activeFilters.size === 0) activeFilters.add('all');
    renderActiveChips();
    render();
  }

  // Reseta todos os filtros aplicados de volta para o estado padrão ("Todos") e limpa as etiquetas da tela.
  function clearAllFilters() {
    activeFilters = new Set(['all']);
    renderActiveChips();
    render();
  }

  // Varre todos os modelos carregados para calcular e retornar a quantidade exata pertencente a cada sistema anatômico.
function getCounts() {
    const counts = {};
    Object.keys(FILTER_LABELS).forEach(key => counts[key] = 0);

    modelosData.forEach(m => {
        if (Array.isArray(m.cat)) {
            m.cat.forEach(categoria => {
                if (counts[categoria] !== undefined) {
                    counts[categoria]++;
                }
            });
        }
    });

    counts['all'] = modelosData.length;
    return counts;
}

  // Define o critério de ordenação dos modelos (A-Z ou Z-A) e dispara uma nova renderização na tela.
  function handleSort(value) {
    currentSort = value;
    saveState();
    render();
  }

  // Inverte o estado do modo escuro global do aplicativo, aplicando as mudanças visuais e salvando a preferência.
  function toggleDarkMode() {
    isDark = !isDark;
    applyTheme();
    saveState();
  }

  // Aplica as classes CSS corretas no corpo da página e altera o ícone indicador do tema baseado no estado atual.
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

  // Alterna o status de favorito (coração) de um modelo diretamente pelo card da tela principal e salva a alteração.
  function togFav(btn, id) {
    const item = modelosData.find(m => m.id === id);
    if (item) {
        item.fav = !item.fav;
        
        btn.classList.toggle('active', item.fav);
        btn.innerHTML = item.fav ? '❤️' : '🤍';

        saveState();
    }
  }

  // Abre a modal de detalhes injetando a URL do visualizador 3D com as queries correspondentes dentro do Iframe principal.
  function openDet(nome, sistema, id) {
    currentOpenId = id;
    const frame = document.getElementById('viewer-frame');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    
    const url = `viewer.html?title=${encodeURIComponent(nome)}&sys=${encodeURIComponent(sistema)}&id=${id}&theme=${isDark ? 'dark' : 'light'}&modal=true`;
    
    frame.src = url;
    document.getElementById('det-ov').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Fecha a modal de visualização 3D, limpa a origem do Iframe para liberar memória e restaura a rolagem da página.
  function closeDet() {
    const modal = document.getElementById('det-ov');
    const frame = document.getElementById('viewer-frame');
    modal.style.display = 'none';
    frame.src = "";
    document.body.style.overflow = 'auto';
  }

  // Executa a animação de esmaecimento e encerramento da tela de boas-vindas, exibindo a aplicação principal.
  function closeWelcome() {
    const o = document.getElementById('welcome-overlay');
    o.style.opacity = '0';
    setTimeout(() => { 
      o.style.display = 'none'; 
      document.getElementById('app').classList.add('visible'); 
    }, 310);
  }

  // Evento que intercepta a carga do DOM para ler parâmetros iniciais da URL e preencher os campos de títulos e cabeçalhos.
  window.addEventListener('DOMContentLoaded', () => {
    carregarModelos();
    const params = new URLSearchParams(window.location.search);
    
    const titulo = params.get('title');
    const sistema = params.get('sys');

    if (titulo) document.getElementById('det-title').textContent = titulo;
    if (sistema) document.getElementById('det-sys').textContent = sistema;
    
    if (titulo) document.getElementById('det-bc').textContent = titulo;
});

window.abrirAjuda = abrirAjuda;
window.fecharAjuda = fecharAjuda;
window.switchHelpTab = switchHelpTab;

function abrirAjuda() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.style.display = 'flex';
}

function fecharAjuda() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.style.display = 'none';
}

function switchHelpTab(tabId, btn) {
    // Esconde todos os conteúdos de abas de ajuda
    document.querySelectorAll('.help-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Desativa todos os botões de abas de ajuda
    document.querySelectorAll('.help-tab-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    // Exibe o conteúdo selecionado e ativa o botão atual
    document.getElementById(tabId).style.display = 'block';
    btn.classList.add('active');
}