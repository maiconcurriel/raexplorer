let dados = { objname: "", objsystem: [], objdescription: "", linkedModels: [], resources: [] };
let nomeArquivoOriginal = "modelo.json";

const chavesGlobais = ['objname', 'objsystem', 'objdescription', 'linkedModel', 'linkedModels', 'resources', 'resourses'];

const tiposRecurso = [
    { id: 'video', label: '🎥 Vídeo' },
    { id: 'image', label: '📊 Imagem' },
    { id: 'doc', label: '📄 Documento' },
    { id: 'link', label: '🔗 Link Externo' },
    { id: 'audio', label: '🎙️ Áudio' }
];

function lerArquivo() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return alert("Selecione um arquivo!");

    nomeArquivoOriginal = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            dados = JSON.parse(e.target.result);
            
            if (!dados.resources) dados.resources = [];
            
            if (dados.linkedModel && !dados.linkedModels) {
                dados.linkedModels = [dados.linkedModel];
                delete dados.linkedModel;
            }
            if (!dados.linkedModels) dados.linkedModels = [];

            preencherFormulario();
        } catch (err) { alert("Erro ao ler JSON: " + err); }
    };
    reader.readAsText(file);
}

function preencherFormulario() {
    document.getElementById('objname').value = dados.objname || "";
    document.getElementById('objsystem').value = Array.isArray(dados.objsystem) ? dados.objsystem.join(', ') : (dados.objsystem || "");
    document.getElementById('objdescription').value = dados.objdescription || "";
    renderizarModelosRelacionados();
    renderizarPecas();
    renderizarRecursos();
    atualizarCodigo();
}

function renderizarModelosRelacionados() {
    const container = document.getElementById('containerRelacionados');
    container.innerHTML = "";
    
    dados.linkedModels.forEach((modelo, index) => {
        const div = document.createElement('div');
        div.className = 'link-item';
        div.style.marginBottom = "15px";
        div.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: end;">
                <div>
                    <label>ID do Modelo (Pasta/ID):</label>
                    <input type="text" value="${modelo.id || ''}" oninput="dados.linkedModels[${index}].id = this.value; sincronizar()">
                </div>
                <div>
                    <label>Texto de Exibição (Label):</label>
                    <input type="text" value="${modelo.label || ''}" oninput="dados.linkedModels[${index}].label = this.value; sincronizar()">
                </div>
            </div>
            <button class="btn-delete" style="margin-top: 5px;" onclick="removerModeloRelacionado(${index})">Remover Relacionado</button>
        `;
        container.appendChild(div);
    });
}

function renderizarPecas() {
    const container = document.getElementById('containerPecas');
    container.innerHTML = "";

    Object.keys(dados).forEach(key => {
        if (typeof dados[key] === 'object' && !Array.isArray(dados[key]) && !chavesGlobais.includes(key)) {
            
            // Separa o ID base das tags +nisolar e +ninteract
            const temNIsolar = key.includes('+nisolar');
            const temNInteract = key.includes('+ninteract');
            const baseKey = key.replace(/\+nisolar/g, '').replace(/\+ninteract/g, '');

            const div = document.createElement('div');
            div.className = 'mesh-item';
            div.style.border = "1px solid #ccc";
            div.style.padding = "10px";
            div.style.marginBottom = "10px";
            div.style.borderRadius = "5px";

            div.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
                    <div style="flex: 1;">
                        <label>ID da Mesh:</label>
                        <input type="text" class="mesh-base-id" value="${baseKey}" onchange="atualizarChavePeca(this)">
                    </div>
                    <div style="display: flex; gap: 15px; margin-top: 15px;">
                        <label style="cursor: pointer;">
                            <input type="checkbox" class="chk-nisolar" ${temNIsolar ? 'checked' : ''} onchange="atualizarChavePeca(this)"> +nisolar
                        </label>
                        <label style="cursor: pointer;">
                            <input type="checkbox" class="chk-ninteract" ${temNInteract ? 'checked' : ''} onchange="atualizarChavePeca(this)"> +ninteract
                        </label>
                    </div>
                </div>
                <div style="margin-bottom: 8px;">
                    <label>Nome Exibição:</label>
                    <input type="text" style="width: 100%;" value="${dados[key].objname || ''}" oninput="dados['${key}'].objname = this.value; sincronizar()">
                </div>
                <div style="margin-bottom: 8px;">
                    <label>Descrição:</label>
                    <textarea class="small" style="width: 100%;" oninput="dados['${key}'].description = this.value; sincronizar()">${dados[key].description || ''}</textarea>
                </div>
                <button class="btn-delete" onclick="removerPeca('${key}')">Excluir Peça</button>
            `;
            container.appendChild(div);
        }
    });
}

function atualizarChavePeca(elemento) {
    const div = elemento.closest('.mesh-item');
    const inputBaseId = div.querySelector('.mesh-base-id');
    const chkNisolar = div.querySelector('.chk-nisolar');
    const chkNinteract = div.querySelector('.chk-ninteract');

    let baseId = inputBaseId.value.trim().replace(/\+/g, '');
    if (!baseId) baseId = "mesh_sem_nome";

    let novaChave = baseId;
    if (chkNisolar.checked) novaChave += '+nisolar';
    if (chkNinteract.checked) novaChave += '+ninteract';

    salvarDadosDosCampos();
    renderizarPecas();
    sincronizar();
}

function renderizarRecursos() {
    const container = document.getElementById('containerRecursos');
    container.innerHTML = "";
    dados.resources.forEach((res, index) => {
        const div = document.createElement('div');
        div.className = 'res-item';
        div.style.marginBottom = "15px";
        
        let optionsHtml = tiposRecurso.map(t => `<option value="${t.id}" ${res.type === t.id ? 'selected' : ''}>${t.label}</option>`).join('');

        div.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 1.5fr 1fr 1fr; gap: 10px; align-items: end;">
                <div>
                    <label>Tipo:</label>
                    <select onchange="dados.resources[${index}].type = this.value; sincronizar()">${optionsHtml}</select>
                </div>
                <div>
                    <label>Nome do Recurso:</label>
                    <input type="text" value="${res.name || ''}" oninput="dados.resources[${index}].name = this.value; sincronizar()">
                </div>
                <div>
                    <label>Info:</label>
                    <input type="text" value="${res.info || ''}" oninput="dados.resources[${index}].info = this.value; sincronizar()">
                </div>
                <div>
                    <label>URL / Arquivo:</label>
                    <input type="text" value="${res.url || ''}" oninput="dados.resources[${index}].url = this.value; sincronizar()">
                </div>
            </div>
            <button class="btn-delete" style="margin-top: 5px;" onclick="removerRecurso(${index})">Remover Recurso</button>
        `;
        container.appendChild(div);
    });
}

function addModeloRelacionado() {
    salvarDadosDosCampos();
    dados.linkedModels.push({ id: "", label: "" });
    renderizarModelosRelacionados();
    sincronizar();
}

function addPeca() {
    salvarDadosDosCampos();
    const id = "nova_mesh_" + Date.now();
    dados[id] = { objname: "?", description: "?" };
    renderizarPecas();
    sincronizar();
    window.scrollTo(0, document.body.scrollHeight);
}

function addRecurso() {
    salvarDadosDosCampos();
    dados.resources.push({ type: "video", name: "", info: "Vídeo · 0 min", url: "" });
    renderizarRecursos();
    sincronizar();
}

function removerModeloRelacionado(index) { dados.linkedModels.splice(index, 1); renderizarModelosRelacionados(); sincronizar(); }
function removerPeca(key) { delete dados[key]; renderizarPecas(); sincronizar(); }
function removerRecurso(index) { dados.resources.splice(index, 1); renderizarRecursos(); sincronizar(); }

function sincronizar() {
    dados.objname = document.getElementById('objname').value;
    
    const sistemaInput = document.getElementById('objsystem').value;
    dados.objsystem = sistemaInput.split(',').map(s => s.trim()).filter(Boolean);
    
    dados.objdescription = document.getElementById('objdescription').value;
    salvarDadosDosCampos();
    atualizarCodigo();
}

function atualizarCodigo() { 
    document.getElementById('jsonOutput').value = JSON.stringify(dados, null, 2); 
}

function baixarJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", nomeArquivoOriginal);
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
}

function salvarDadosDosCampos() {
    // 1. Salva Modelos Relacionados
    const containerRel = document.getElementById('containerRelacionados');
    if (containerRel) {
        const itens = containerRel.querySelectorAll('.link-item');
        itens.forEach((div, index) => {
            if (dados.linkedModels[index]) {
                const inputs = div.querySelectorAll('input[type="text"]');
                dados.linkedModels[index].id = inputs[0].value;
                dados.linkedModels[index].label = inputs[1].value;
            }
        });
    }

    // 2. Salva Peças
    const containerPecas = document.getElementById('containerPecas');
    if (containerPecas) {
        const novosDados = {
            objname: dados.objname,
            objsystem: dados.objsystem,
            objdescription: dados.objdescription,
            linkedModels: dados.linkedModels,
            resources: dados.resources
        };

        const itens = containerPecas.querySelectorAll('.mesh-item');
        itens.forEach((div) => {
            const inputBaseId = div.querySelector('.mesh-base-id');
            const chkNisolar = div.querySelector('.chk-nisolar');
            const chkNinteract = div.querySelector('.chk-ninteract');
            
            const inputs = div.querySelectorAll('input[type="text"]');
            const textarea = div.querySelector('textarea');

            let baseId = inputBaseId.value.trim().replace(/\+/g, '');
            if (!baseId) baseId = "mesh_sem_nome";

            let chaveComposta = baseId;
            if (chkNisolar.checked) chaveComposta += '+nisolar';
            if (chkNinteract.checked) chaveComposta += '+ninteract';

            novosDados[chaveComposta] = {
                objname: inputs[1].value,
                description: textarea.value
            };
        });

        dados = novosDados;
    }

    // 3. Salva Recursos
    const containerRes = document.getElementById('containerRecursos');
    if (containerRes) {
        const itens = containerRes.querySelectorAll('.res-item');
        itens.forEach((div, index) => {
            if (dados.resources[index]) {
                const select = div.querySelector('select');
                const inputs = div.querySelectorAll('input[type="text"]');
                dados.resources[index].type = select.value;
                dados.resources[index].name = inputs[0].value;
                dados.resources[index].info = inputs[1].value;
                dados.resources[index].url = inputs[2].value;
            }
        });
    }
}

// Exposição ao objeto global window para módulos ES6
window.lerArquivo = lerArquivo;
window.baixarJSON = baixarJSON;
window.sincronizar = sincronizar;
window.addModeloRelacionado = addModeloRelacionado;
window.addPeca = addPeca;
window.addRecurso = addRecurso;
window.removerModeloRelacionado = removerModeloRelacionado;
window.removerPeca = removerPeca;
window.removerRecurso = removerRecurso;
window.atualizarChavePeca = atualizarChavePeca;
window.salvarDadosDosCampos = salvarDadosDosCampos;