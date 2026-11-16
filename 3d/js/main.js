window.openDet = openDet;
window.closeDet = closeDet;
window.closeWelcome = closeWelcome;
window.toggleDarkMode = toggleDarkMode;
window.toggleFdd = toggleFdd;
window.toggleDdChip = toggleDdChip;
window.handleSort = handleSort;
window.removeFilter = removeFilter;
window.clearAllFilters = clearAllFilters;

const modelosIDs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
                    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
                    31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 
                    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 
                    51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
                    61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
                    71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
                    81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
                    91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
                    101, 102, 103, 104];

const FILTER_LABELS = {
    all: '<span data-i18n="category.all">Todos</span>', 
    nervoso: '<span data-i18n="category.nervoso">Nervoso</span>', 
    cardio: '<span data-i18n="category.cardio">Cardiovascular</span>', 
    tegum: '<span data-i18n="category.tegum">Tegumentar</span>', 
    celul: '<span data-i18n="category.celul">Célula</span>', 
    esqueletico: '<span data-i18n="category.esqueletico">Esquelético</span>', 
    muscular: '<span data-i18n="category.muscular">Muscular</span>', 
    resp: '<span data-i18n="category.resp">Respiratório</span>', 
    digest: '<span data-i18n="category.digest">Digestivo</span>', 
    urin: '<span data-i18n="category.urin">Urinário</span>', 
    senso: '<span data-i18n="category.senso">Sensorial</span>', 
    repro: '<span data-i18n="category.repro">Reprodutor</span>', 
    infec: '<span data-i18n="category.infec">Infeccioso</span>',
    linf: '<span data-i18n="category.linf">Linfático</span>',
    circ: '<span data-i18n="category.circ">Circulatório</span>',
    audi: '<span data-i18n="category.audi">Auditivo</span>',
    endoc: '<span data-i18n="category.endoc">Endócrino</span>',
    estom: '<span data-i18n="category.estom">Estomatognático</span>'
};

function traduzirSistema(chave) {
    const lang = getCurrentLanguage();
    const key = String(chave ?? '').trim();
    const mapaLegado = {
        cardiovascular: 'cardio', nervoso: 'nervoso', tegumentar: 'tegum',
        célula: 'celul', celula: 'celul', esquelético: 'esqueletico',
        esqueletico: 'esqueletico', muscular: 'muscular', respiratório: 'resp',
        respiratorio: 'resp', digestivo: 'digest', digestório: 'digest',
        digestorio: 'digest', urinário: 'urin', urinario: 'urin',
        sensorial: 'senso', reprodutor: 'repro', infeccioso: 'infec',
        linfático: 'linf', linfatico: 'linf', circulatório: 'circ',
        circulatorio: 'circ', auditivo: 'audi', endócrino: 'endoc',
        endocrino: 'endoc', estomatognático: 'estom', estomatognatico: 'estom'
    };
    const categoria = Object.hasOwn(FILTER_LABELS, key) ? key : (mapaLegado[key.toLowerCase()] ?? key);
    const chaveTraducao = `category.${categoria}`;
    const idiomas = [lang, lang === 'pt-BR' ? 'pt' : null, 'pt-BR', 'pt'].filter(Boolean);
    for (const idioma of idiomas) {
        const texto = typeof TRANSLATIONS !== 'undefined' ? TRANSLATIONS?.[idioma]?.[chaveTraducao] : null;
        if (typeof texto === 'string') return texto;
    }
    const rotulo = FILTER_LABELS[categoria];
    return typeof rotulo === 'string' ? rotulo.replace(/<[^>]*>/g, '') : key;
}

let modelosData = [];
let currentView = 'grid'; 
let currentSort = 'az';
let activeFilters = new Set(['all']);
let isDark = false;
let currentOpenId = null;

// Retorna o idioma selecionado, normalizado para as chaves dos JSONs.
function getCurrentLanguage() {
    const lang = localStorage.getItem('bioexplora_language') || 'pt-BR';
    return lang === 'pt' ? 'pt-BR' : lang;
}

// Aceita textos simples (JSON antigo) e objetos multilíngues (JSON novo).
function traduzirCampo(valor, lang = getCurrentLanguage(), fallback = '') {
    if (typeof valor === 'string') return valor;
    if (valor == null) return fallback;
    if (Array.isArray(valor)) return valor.map(item => traduzirCampo(item, lang)).filter(Boolean);
    if (typeof valor === 'object') {
        const texto = valor[lang] ?? valor['pt-BR'] ?? valor.pt ?? valor.en ?? valor.es;
        return typeof texto === 'string' ? texto : fallback;
    }
    return String(valor);
}

// Converte os metadados para strings sem modificar o JSON original.
function getTranslatedModel(modelo) {
    const lang = getCurrentLanguage();
    const antiga = modelo.translations?.[lang] ?? modelo.translations?.[lang === 'pt-BR' ? 'pt' : 'pt-BR'];
    const nome = traduzirCampo(antiga?.objname ?? modelo.objname, lang, 'Sem Nome');
    const sistemas = antiga?.objsystem ?? modelo.objsystem ?? [];
    const lista = (Array.isArray(sistemas) ? sistemas : [sistemas])
        .flatMap(item => typeof item === 'string' ? item.split(/[,/]/) : [item])
        .map(item => traduzirCampo(item, lang))
        .filter(Boolean)
        .map(traduzirSistema);
    return {
        nome,
        sistema: lista,
        descricao: traduzirCampo(antiga?.objdescription ?? modelo.objdescription, lang)
    };
}

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
                    const sistema = Array.isArray(data.objsystem) ? data.objsystem : [data.objsystem];
                    const sistemasBrutos = sistema
                        .flatMap(item => typeof item === 'string' ? item.split(/[,/]/) : [item])
                        .map(item => traduzirCampo(item))
                        .filter(Boolean);
                    const categoriasChave = [...new Set(sistemasBrutos.map(sis => {
                        const key = sis.trim().toLowerCase();
                        if (Object.hasOwn(FILTER_LABELS, key) && key !== 'all') return key;
                        const normal = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        const aliases = {
                            cardiovascular: 'cardio', nervoso: 'nervoso', tegumentar: 'tegum',
                            celula: 'celul', esqueletico: 'esqueletico', muscular: 'muscular',
                            respiratorio: 'resp', digestivo: 'digest', digestorio: 'digest',
                            urinario: 'urin', sensorial: 'senso', reprodutor: 'repro',
                            infeccioso: 'infec', linfatico: 'linf', circulatorio: 'circ',
                            auditivo: 'audi', endocrino: 'endoc', estomatognatico: 'estom'
                        };
                        return aliases[normal] ?? null;
                    }).filter(Boolean))];
                    return {
                        ...data,
                        id,
                        nome: traduzirCampo(data.objname, getCurrentLanguage(), 'Sem Nome'),
                        sistema: sistemasBrutos.join(' / '),
                        img: `models/${id}.png`,
                        cat: categoriasChave
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
    // carregarModelos() é executado em DOMContentLoaded.

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
            setTimeout(() => openDetById(modelo.id), 100);
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
    const traduzido = getTranslatedModel(m);

    const nome = traduzido.nome.toLowerCase();
    const sistema = Array.isArray(traduzido.sistema)
        ? traduzido.sistema.join(' / ').toLowerCase()
        : String(traduzido.sistema).toLowerCase();
      
      const matchesSearch = nome.includes(searchTerm) || sistema.includes(searchTerm);
      
      // Verifica se m.cat (que agora é Array) tem interseção com os filtros ativos
      const matchesCat = activeFilters.has('all') || m.cat.some(c => activeFilters.has(c));

      return matchesSearch && matchesCat;
  });

    const spanFiltrados = document.getElementById('count-filtrados');
    if (spanFiltrados) spanFiltrados.textContent = filtrados.length;

    const lang = getCurrentLanguage();

    if (currentSort === 'az') {
        filtrados.sort((a, b) =>
            getTranslatedModel(a).nome.localeCompare(
                getTranslatedModel(b).nome, lang
            )
        );
    } else if (currentSort === 'za') {
        filtrados.sort((a, b) =>
            getTranslatedModel(b).nome.localeCompare(
                getTranslatedModel(a).nome, lang
            )
        );
    }

    grid.innerHTML = "";

    setTimeout(() => {
        if (filtrados.length === 0) {
            grid.innerHTML = '<div class="no-results">Nenhum modelo encontrado para esta busca.</div>';
            return;
        }

        grid.innerHTML = filtrados.map((m, index) => {
        const traduzido = getTranslatedModel(m);

        const nome = traduzido.nome;
        const sistema = Array.isArray(traduzido.sistema)
            ? traduzido.sistema.join(' / ')
            : traduzido.sistema;

        return `
                <div class="m-card" 
                     style="animation-delay: ${index * 30}ms" 
                     onclick="openDetById(${m.id})">
                    <div class="c-thumb">
                        <img class="thumb-img" src="models/${m.id}.png" alt="${nome}" onerror="this.src='placeholder.png'">
                        <div class="c-overlay">
                            <button class="v3d-btn">
                                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z" stroke="currentColor" stroke-linecap="round"/>
<path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" stroke-linecap="round"/>
                                </svg>
                                Ver 3D
                            </button>
                        </div>
                    </div>
                    <div class="c-body">
                        <div class="c-name">${nome}</div>
                        <div class="c-sys">${sistema}</div>
                    </div>
                </div>
            `;
        }).join('');
    }, 10);
}

window.openDetById = function(id) {
    const modelo = modelosData.find(m => m.id === id);
    if (!modelo) return;

    const traduzido = getTranslatedModel(modelo);
    const sistema = Array.isArray(traduzido.sistema)
        ? traduzido.sistema.join(' / ')
        : traduzido.sistema;

    openDet(traduzido.nome, sistema, id);
};

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

        <span data-i18n="category.${key}">
            ${traduzirSistema(key)}
        </span>
        
        <span class="fx" onclick="removeFilter('${key}')">×</span>
      </div>
    `).join('');
  }

  //${FILTER_LABELS[key]}

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
    document.body.classList.toggle('dark-mode', isDark);

    const btn = document.getElementById('theme-icon');

    if (btn) {
        btn.dataset.icon = isDark ? 'sun' : 'moon';
        window.renderBioIcons(btn);
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
    
    const lang = getCurrentLanguage();
    const url = `viewer.html?title=${encodeURIComponent(nome)}&sys=${encodeURIComponent(sistema)}&id=${id}&theme=${isDark ? 'dark' : 'light'}&modal=true&lang=${encodeURIComponent(lang)}`;
    
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

function abrirAjuda() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.style.display = 'flex';
}

function fecharAjuda() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.style.display = 'none';
}

document.addEventListener('bioexplora:languagechange', (event) => {
    const lang = event.detail.language;
    
    render();

    renderActiveChips();

    if (currentOpenId !== null) {
        const modelo = modelosData.find(m => m.id === currentOpenId);

        if (modelo) {
            const traduzido = getTranslatedModel(modelo);

            const titulo = document.getElementById('det-title');
            const breadcrumb = document.getElementById('det-bc');
            const sistema = document.getElementById('det-sys');

            if (titulo) titulo.textContent = traduzido.nome;
            if (breadcrumb) breadcrumb.textContent = traduzido.nome;
            if (sistema) {
                sistema.textContent = Array.isArray(traduzido.sistema)
                    ? traduzido.sistema.join(' / ')
                    : traduzido.sistema;
            }
        }
    }
});