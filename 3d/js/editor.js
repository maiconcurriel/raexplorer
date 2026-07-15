
        // Inicializa a estrutura base com a array de linkedModels vazia
        let dados = { objname: "", objsystem: "", objdescription: "", linkedModels: [], resources: [] };
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
                    
                    // Garante a existência das arrays necessárias
                    if (!dados.resources) dados.resources = [];
                    
                    // Converte linkedModel antigo (objeto) para linkedModels (array) caso encontre um arquivo antigo
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
            document.getElementById('objsystem').value = dados.objsystem || "";
            document.getElementById('objdescription').value = dados.objdescription || "";
            renderizarModelosRelacionados();
            renderizarPecas();
            renderizarRecursos();
            atualizarCodigo();
        }

        // Função para Renderizar a Lista de Modelos Relacionados
        function renderizarModelosRelacionados() {
            const container = document.getElementById('containerRelacionados');
            container.innerHTML = "";
            
            dados.linkedModels.forEach((modelo, index) => {
                const div = document.createElement('div');
                div.className = 'link-item';
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
                    <button class="btn-delete" onclick="removerModeloRelacionado(${index})">Remover Relacionado</button>
                `;
                container.appendChild(div);
            });
        }

        function renderizarPecas() {
            const container = document.getElementById('containerPecas');
            container.innerHTML = "";
            Object.keys(dados).forEach(key => {
                // Modificado para usar o array chavesGlobais dinamicamente
                if (typeof dados[key] === 'object' && !chavesGlobais.includes(key)) {
                    const div = document.createElement('div');
                    div.className = 'mesh-item';
                    div.innerHTML = `
                        <label>ID da Mesh:</label>
                        <input type="text" value="${key}" onchange="renomearChave('${key}', this.value)">
                        <label>Nome Exibição:</label>
                        <input type="text" value="${dados[key].objname || ''}" oninput="dados['${key}'].objname = this.value; sincronizar()">
                        <label>Descrição:</label>
                        <textarea class="small" oninput="dados['${key}'].description = this.value; sincronizar()">${dados[key].description || ''}</textarea>
                        <button class="btn-delete" onclick="removerPeca('${key}')">Excluir Peça</button>
                    `;
                    container.appendChild(div);
                }
            });
        }

        function renderizarRecursos() {
            const container = document.getElementById('containerRecursos');
            container.innerHTML = "";
            dados.resources.forEach((res, index) => {
                const div = document.createElement('div');
                div.className = 'res-item';
                
                let optionsHtml = tiposRecurso.map(t => `<option value="${t.id}" ${res.type === t.id ? 'selected' : ''}>${t.label}</option>`).join('');

                div.innerHTML = `
                    <div style="display:grid; grid-template-columns: 1fr 1.5fr 1fr 1fr; gap: 10px; align-items: end;">
                        <div>
                            <label>Tipo:</label>
                            <select onchange="dados.resources[${index}].type = this.value; sincronizar()">${optionsHtml}</select>
                        </div>
                        <div>
                            <label>Nome do Recurso:</label>
                            <input type="text" value="${res.name}" oninput="dados.resources[${index}].name = this.value; sincronizar()">
                        </div>
                        <div>
                            <label>Info (Ex: Vídeo · 10 min):</label>
                            <input type="text" value="${res.info}" oninput="dados.resources[${index}].info = this.value; sincronizar()">
                        </div>
                        <div>
                            <label>URL / Arquivo:</label>
                            <input type="text" value="${res.url}" oninput="dados.resources[${index}].url = this.value; sincronizar()">
                        </div>
                    </div>
                    <button class="btn-delete" onclick="removerRecurso(${index})">Remover Recurso</button>
                `;
                container.appendChild(div);
            });
        }

        function addModeloRelacionado() {
            dados.linkedModels.push({ id: "", label: "" });
            renderizarModelosRelacionados();
            sincronizar();
        }

        function addPeca() {
            const id = "nova_mesh_" + Date.now();
            dados[id] = { objname: "Nova Peça", description: "" };
            renderizarPecas();
            sincronizar();
            window.scrollTo(0, document.body.scrollHeight);
        }

        function addRecurso() {
            dados.resources.push({ type: "video", name: "", info: "Vídeo · 0 min", url: "" });
            renderizarRecursos();
            sincronizar();
        }

        function removerModeloRelacionado(index) { dados.linkedModels.splice(index, 1); renderizarModelosRelacionados(); sincronizar(); }
        function removerPeca(id) { delete dados[id]; renderizarPecas(); sincronizar(); }
        function removerRecurso(index) { dados.resources.splice(index, 1); renderizarRecursos(); sincronizar(); }
        
        function renomearChave(antiga, nova) {
            if (nova !== antiga && nova.trim() !== "") {
                dados[nova] = dados[antiga];
                delete dados[antiga];
                renderizarPecas();
                sincronizar();
            }
        }

        function sincronizar() {
            dados.objname = document.getElementById('objname').value;
            dados.objsystem = document.getElementById('objsystem').value;
            dados.objdescription = document.getElementById('objdescription').value;
            atualizarCodigo();
        }

        function atualizarCodigo() { document.getElementById('jsonOutput').value = JSON.stringify(dados, null, 2); }

        function baixarJSON() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
            const dl = document.createElement('a');
            dl.setAttribute("href", dataStr);
            dl.setAttribute("download", nomeArquivoOriginal);
            document.body.appendChild(dl);
            dl.click();
            document.body.removeChild(dl);
        }

window.lerArquivo = lerArquivo;
window.baixarJSON = baixarJSON;
window.sincronizar = sincronizar;
window.addModeloRelacionado = addModeloRelacionado;
window.addPeca = addPeca;
window.addRecurso = addRecurso;