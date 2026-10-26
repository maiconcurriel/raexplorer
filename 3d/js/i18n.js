
const TRANSLATIONS = {
    "pt-BR": {
        "welcome.models3d": "Modelos interativos em 3D",
        "welcome.title": "Bem-vindo!",
        "welcome.subtitle": "Explore estruturas anatômicas em três dimensões e aprofunde sua compreensão a cada modelo.",
        "welcome.start": "Começar a explorar",

        "search.placeholder": "Buscar modelos anatômicos...",
        "header.theme": "Alternar tema",
        "header.grid": "Grade",
        "header.list": "Lista",
        "header.help": "Ajuda",

        "help.title": "Central de Ajuda",
        "help.close": "Fechar ajuda",
        "help.mainTab": "Plataforma Principal",
        "help.navigationTitle": "Como navegar pelos Modelos",
        "help.navigationText": "Utilize a barra de pesquisa no topo para buscar órgãos, sistemas ou peças específicas em tempo real.",
        "help.filtersTitle": "Filtros Avançados",
        "help.filtersText": "Clique no botão Filtrar para abrir a listagem de categorias por Sistemas Anatômicos (Cardiovascular, Nervoso, etc.). Você pode selecionar múltiplos filtros ao mesmo tempo.",

        "filter.button": "Filtrar",
        "filter.category": "Categoria",
        "filter.clear": "Limpar tudo",

        "category.all": "Todos",
        "category.nervoso": "Nervoso",
        "category.cardio": "Cardiovascular",
        "category.tegum": "Tegumentar",
        "category.celul": "Célula",
        "category.esqueletico": "Esquelético",
        "category.muscular": "Muscular",
        "category.resp": "Respiratório",
        "category.digest": "Digestivo",
        "category.urin": "Urinário",
        "category.senso": "Sensorial",
        "category.repro": "Reprodutor",
        "category.infec": "Infeccioso",
        "category.linf": "Linfático",
        "category.circ": "Circulatório",
        "category.audi": "Auditivo",
        "category.endoc": "Endócrino",
        "category.estom": "Estomatognático",

        "catalog.title": "Modelos Anatômicos",
        "catalog.showing": "Exibindo",
        "catalog.of": "de",
        "catalog.models": "modelos",
        "catalog.sortAZ": "Ordenar: A–Z",
        "catalog.sortZA": "Ordenar: Z–A"
    },

    "en": {
        "welcome.models3d": "Interactive 3D Models",
        "welcome.title": "Welcome!",
        "welcome.subtitle": "Explore anatomical structures in three dimensions and deepen your understanding with each model.",
        "welcome.start": "Start exploring",

        "search.placeholder": "Search anatomical models...",
        "header.theme": "Toggle theme",
        "header.grid": "Grid",
        "header.list": "List",
        "header.help": "Help",

        "help.title": "Help Center",
        "help.close": "Close help",
        "help.mainTab": "Main Platform",
        "help.navigationTitle": "How to Navigate Models",
        "help.navigationText": "Use the search bar at the top to find organs, systems, or specific anatomical structures in real time.",
        "help.filtersTitle": "Advanced Filters",
        "help.filtersText": "Click the Filter button to open the list of categories by anatomical system (Cardiovascular, Nervous, etc.). You can select multiple filters at the same time.",

        "filter.button": "Filter",
        "filter.category": "Category",
        "filter.clear": "Clear all",

        "category.all": "All",
        "category.nervoso": "Nervous",
        "category.cardio": "Cardiovascular",
        "category.tegum": "Integumentary",
        "category.celul": "Cell",
        "category.esqueletico": "Skeletal",
        "category.muscular": "Muscular",
        "category.resp": "Respiratory",
        "category.digest": "Digestive",
        "category.urin": "Urinary",
        "category.senso": "Sensory",
        "category.repro": "Reproductive",
        "category.infec": "Infectious",
        "category.linf": "Lymphatic",
        "category.circ": "Circulatory",
        "category.audi": "Auditory",
        "category.endoc": "Endocrine",
        "category.estom": "Stomatognathic",

        "catalog.title": "Anatomical Models",
        "catalog.showing": "Showing",
        "catalog.of": "of",
        "catalog.models": "models",
        "catalog.sortAZ": "Sort: A–Z",
        "catalog.sortZA": "Sort: Z–A"
    },

    "es": {
        "welcome.models3d": "Modelos interactivos en 3D",
        "welcome.title": "¡Bienvenido!",
        "welcome.subtitle": "Explora estructuras anatómicas en tres dimensiones y profundiza tus conocimientos con cada modelo.",
        "welcome.start": "Comenzar a explorar",

        "search.placeholder": "Buscar modelos anatómicos...",
        "header.theme": "Cambiar tema",
        "header.grid": "Cuadrícula",
        "header.list": "Lista",
        "header.help": "Ayuda",

        "help.title": "Centro de ayuda",
        "help.close": "Cerrar ayuda",
        "help.mainTab": "Plataforma principal",
        "help.navigationTitle": "Cómo navegar por los modelos",
        "help.navigationText": "Utiliza la barra de búsqueda superior para encontrar órganos, sistemas o estructuras anatómicas específicas en tiempo real.",
        "help.filtersTitle": "Filtros avanzados",
        "help.filtersText": "Haz clic en el botón Filtrar para abrir la lista de categorías por sistemas anatómicos (cardiovascular, nervioso, etc.). Puedes seleccionar varios filtros al mismo tiempo.",

        "filter.button": "Filtrar",
        "filter.category": "Categoría",
        "filter.clear": "Limpiar todo",

        "category.all": "Todos",
        "category.nervoso": "Nervioso",
        "category.cardio": "Cardiovascular",
        "category.tegum": "Tegumentario",
        "category.celul": "Célula",
        "category.esqueletico": "Esquelético",
        "category.muscular": "Muscular",
        "category.resp": "Respiratorio",
        "category.digest": "Digestivo",
        "category.urin": "Urinario",
        "category.senso": "Sensorial",
        "category.repro": "Reproductor",
        "category.infec": "Infeccioso",
        "category.linf": "Linfático",
        "category.circ": "Circulatorio",
        "category.audi": "Auditivo",
        "category.endoc": "Endocrino",
        "category.estom": "Estomatognático",

        "catalog.title": "Modelos anatómicos",
        "catalog.showing": "Mostrando",
        "catalog.of": "de",
        "catalog.models": "modelos",
        "catalog.sortAZ": "Ordenar: A–Z",
        "catalog.sortZA": "Ordenar: Z–A"
    }
};

const urlParams = new URLSearchParams(window.location.search);
const urlLanguage = urlParams.get('lang');
const savedLanguage = localStorage.getItem('bioexplora_language');

let currentLanguage =
    (urlLanguage && TRANSLATIONS[urlLanguage] ? urlLanguage : null) ||
    (savedLanguage && TRANSLATIONS[savedLanguage] ? savedLanguage : null) ||
    'pt-BR';

// Salva o idioma resolvido para as próximas páginas
localStorage.setItem('bioexplora_language', currentLanguage);

if (!TRANSLATIONS[currentLanguage]) {
    currentLanguage = "pt-BR";
}

window.t = function(key) {
    return TRANSLATIONS[currentLanguage]?.[key]
        ?? TRANSLATIONS["pt-BR"]?.[key]
        ?? key;
};

window.translateInterface = function(root = document) {
    root.querySelectorAll("[data-i18n]").forEach(el => {
        el.textContent = window.t(el.dataset.i18n);
    });

    root.querySelectorAll("[data-i18n-title]").forEach(el => {
        el.title = window.t(el.dataset.i18nTitle);
    });

    root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        el.placeholder = window.t(el.dataset.i18nPlaceholder);
    });

    document.documentElement.lang = currentLanguage;
};

window.setLanguage = function(lang) {
    if (!TRANSLATIONS[lang]) return;

    currentLanguage = lang;
    localStorage.setItem("bioexplora_language", lang);

    window.translateInterface();
    window.updateLanguageButton();

    document.dispatchEvent(new CustomEvent("bioexplora:languagechange", {
        detail: { language: lang }
    }));

    const viewerFrame = document.getElementById('viewer-frame');

    if (viewerFrame?.contentWindow?.setLanguage) {
        viewerFrame.contentWindow.setLanguage(lang);
    }
};

const LANGUAGE_ORDER = ['pt-BR', 'en', 'es'];

const LANGUAGE_LABELS = {
    'pt-BR': 'PT',
    'en': 'EN',
    'es': 'ES'
};

// Atualiza o texto do botão com o idioma atual
window.updateLanguageButton = function() {
    const label = document.getElementById('language-label');
    if (!label) return;

    label.textContent = LANGUAGE_LABELS[currentLanguage] || 'PT';
};

// Alterna para o próximo idioma
window.nextLanguage = function() {
    const currentIndex = LANGUAGE_ORDER.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % LANGUAGE_ORDER.length;

    window.setLanguage(LANGUAGE_ORDER[nextIndex]);
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        window.translateInterface();
        window.updateLanguageButton();
    });
} else {
    window.translateInterface();
    window.updateLanguageButton();
}
