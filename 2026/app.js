const dadosIniciais = {
    grupos: {
        A: { nome: "Grupo A", selecoes: ["MEX", "RSA", "KOR", "CZE"], nomes: { "MEX": "🇲🇽", "RSA": "🇿🇦", "KOR": "🇰🇷", "CZE": "🇨🇿" } },
        B: { nome: "Grupo B", selecoes: ["CAN", "BIH", "QAT", "SUI"], nomes: { "CAN": "🇨🇦", "BIH": "🇧🇦", "QAT": "🇶🇦", "SUI": "🇨🇭" } },
        C: { nome: "Grupo C", selecoes: ["BRA", "MAR", "HAI", "SCO"], nomes: { "BRA": "🇧🇷", "MAR": "🇲🇦", "HAI": "🇭🇹", "SCO": "🏴󠁧󠁢󠁳󠁣󠁴󠁿" } },
        D: { nome: "Grupo D", selecoes: ["USA", "PAR", "AUS", "TUR"], nomes: { "USA": "🇺🇸", "PAR": "🇵🇾", "AUS": "🇦🇺", "TUR": "🇹🇷" } },
        E: { nome: "Grupo E", selecoes: ["GER", "CUW", "CIV", "ECU"], nomes: { "GER": "🇩🇪", "CUW": "🇨🇼", "CIV": "🇨🇮", "ECU": "🇪🇨" } },
        F: { nome: "Grupo F", selecoes: ["NED", "JPN", "SWE", "TUN"], nomes: { "NED": "🇳🇱", "JPN": "🇯🇵", "SWE": "🇸🇪", "TUN": "🇹🇳" } },
        G: { nome: "Grupo G", selecoes: ["BEL", "EGY", "IRN", "NZL"], nomes: { "BEL": "🇧🇪", "EGY": "🇪🇬", "IRN": "🇮🇷", "NZL": "🇳🇿" } },
        H: { nome: "Grupo H", selecoes: ["ESP", "CPV", "KSA", "URU"], nomes: { "ESP": "🇪🇸", "CPV": "🇨🇻", "KSA": "🇸🇦", "URU": "🇺🇾" } },
        I: { nome: "Grupo I", selecoes: ["FRA", "SEN", "IRQ", "NOR"], nomes: { "FRA": "🇫🇷", "SEN": "🇸🇳", "IRQ": "🇮🇶", "NOR": "🇳🇴" } },
        J: { nome: "Grupo J", selecoes: ["ARG", "ALG", "AUT", "JOR"], nomes: { "ARG": "🇦🇷", "ALG": "🇩🇿", "AUT": "🇦🇹", "JOR": "🇯🇴" } },
        K: { nome: "Grupo K", selecoes: ["POR", "COD", "UZB", "COL"], nomes: { "POR": "🇵🇹", "COD": "🇨🇩", "UZB": "🇺🇿", "COL": "🇨🇴" } },
        L: { nome: "Grupo L", selecoes: ["ENG", "CRO", "GHA", "PAN"], nomes: { "ENG": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "CRO": "🇭🇷", "GHA": "🇬🇭", "PAN": "🇵🇦" } }
    },
    jogos: [
        // 1ª RODADA
        { id: 1, g: "A", data: "Jogo 1 - 11/06 - 16h00", t1: "MEX", t2: "RSA", g1: "", g2: "" },
        { id: 2, g: "A", data: "Jogo 2 - 11/06 - 23h00", t1: "KOR", t2: "CZE", g1: "", g2: "" },
        { id: 3, g: "B", data: "Jogo 3 - 12/06 - 16h00", t1: "CAN", t2: "BIH", g1: "", g2: "" },
        { id: 4, g: "D", data: "Jogo 4 - 12/06 - 22h00", t1: "USA", t2: "PAR", g1: "", g2: "" },
        { id: 5, g: "B", data: "Jogo 5 - 13/06 - 16h00", t1: "QAT", t2: "SUI", g1: "", g2: "" },
        { id: 6, g: "C", data: "Jogo 6 - 13/06 - 19h00", t1: "BRA", t2: "MAR", g1: "", g2: "" },
        { id: 7, g: "C", data: "Jogo 7 - 13/06 - 22h00", t1: "HAI", t2: "SCO", g1: "", g2: "" },
        { id: 8, g: "D", data: "Jogo 8 - 14/06 - 01h00", t1: "AUS", t2: "TUR", g1: "", g2: "" },
        { id: 9, g: "E", data: "Jogo 9 - 14/06 - 14h00", t1: "GER", t2: "CUW", g1: "", g2: "" },
        { id: 10, g: "E", data: "Jogo 10 - 14/06 - 20h00", t1: "CIV", t2: "ECU", g1: "", g2: "" },
        { id: 11, g: "F", data: "Jogo 11 - 14/06 - 17h00", t1: "NED", t2: "JPN", g1: "", g2: "" },
        { id: 12, g: "F", data: "Jogo 12 - 14/06 - 23h00", t1: "SWE", t2: "TUN", g1: "", g2: "" },
        { id: 13, g: "H", data: "Jogo 13 - 14/06 - 13h00", t1: "ESP", t2: "CPV", g1: "", g2: "" },
        { id: 14, g: "H", data: "Jogo 14 - 14/06 - 19h00", t1: "KSA", t2: "URU", g1: "", g2: "" },
        { id: 15, g: "G", data: "Jogo 15 - 14/06 - 16h00", t1: "BEL", t2: "EGY", g1: "", g2: "" },
        { id: 16, g: "G", data: "Jogo 16 - 14/06 - 22h00", t1: "IRN", t2: "NZL", g1: "", g2: "" },
        { id: 17, g: "J", data: "Jogo 17 - 16/06 - 01h00", t1: "AUT", t2: "JOR", g1: "", g2: "" },
        { id: 18, g: "I", data: "Jogo 18 - 16/06 - 16h00", t1: "FRA", t2: "SEN", g1: "", g2: "" },
        { id: 19, g: "I", data: "Jogo 19 - 16/06 - 19h00", t1: "IRQ", t2: "NOR", g1: "", g2: "" },
        { id: 20, g: "J", data: "Jogo 20 - 16/06 - 22h00", t1: "ARG", t2: "ALG", g1: "", g2: "" },
        { id: 21, g: "K", data: "Jogo 21 - 17/06 - 14h00", t1: "POR", t2: "COD", g1: "", g2: "" },
        { id: 22, g: "L", data: "Jogo 22 - 17/06 - 17h00", t1: "ENG", t2: "CRO", g1: "", g2: "" },
        { id: 23, g: "L", data: "Jogo 23 - 17/06 - 20h00", t1: "GHA", t2: "PAN", g1: "", g2: "" },
        { id: 24, g: "K", data: "Jogo 24 - 17/06 - 21h00", t1: "UZB", t2: "COL", g1: "", g2: "" },

        // 2ª RODADA
        { id: 25, g: "A", data: "Jogo 25 - 18/06 - 13h00", t1: "CZE", t2: "RSA", g1: "", g2: "" },
        { id: 26, g: "B", data: "Jogo 26 - 18/06 - 16h00", t1: "SUI", t2: "BIH", g1: "", g2: "" },
        { id: 27, g: "B", data: "Jogo 27 - 18/06 - 19h00", t1: "CAN", t2: "QAT", g1: "", g2: "" },
        { id: 28, g: "A", data: "Jogo 28 - 18/06 - 22h00", t1: "MEX", t2: "KOR", g1: "", g2: "" },
        { id: 29, g: "D", data: "Jogo 29 - 19/06 - 00h00", t1: "TUR", t2: "PAR", g1: "", g2: "" },
        { id: 30, g: "D", data: "Jogo 30 - 19/06 - 16h00", t1: "USA", t2: "AUS", g1: "", g2: "" },
        { id: 31, g: "C", data: "Jogo 31 - 19/06 - 19h00", t1: "SCO", t2: "MAR", g1: "", g2: "" },
        { id: 32, g: "C", data: "Jogo 32 - 19/06 - 21h30", t1: "BRA", t2: "HAI", g1: "", g2: "" },
        { id: 33, g: "F", data: "Jogo 33 - 20/06 - 23h00", t1: "TUN", t2: "JPN", g1: "", g2: "" },
        { id: 34, g: "F", data: "Jogo 34 - 20/06 - 14h00", t1: "NED", t2: "SWE", g1: "", g2: "" },
        { id: 35, g: "E", data: "Jogo 35 - 20/06 - 17h00", t1: "GER", t2: "CIV", g1: "", g2: "" },
        { id: 36, g: "E", data: "Jogo 36 - 20/06 - 21h00", t1: "ECU", t2: "CUW", g1: "", g2: "" },
        { id: 37, g: "H", data: "Jogo 37 - 21/06 - 13h00", t1: "ESP", t2: "KSA", g1: "", g2: "" },
        { id: 38, g: "G", data: "Jogo 38 - 21/06 - 16h00", t1: "BEL", t2: "IRN", g1: "", g2: "" },
        { id: 39, g: "H", data: "Jogo 39 - 21/06 - 19h00", t1: "URU", t2: "CPV", g1: "", g2: "" },
        { id: 40, g: "G", data: "Jogo 40 - 21/06 - 22h00", t1: "NZL", t2: "EGY", g1: "", g2: "" },
        { id: 41, g: "J", data: "Jogo 41 - 22/06 - 14h00", t1: "ARG", t2: "AUT", g1: "", g2: "" },
        { id: 42, g: "I", data: "Jogo 42 - 22/06 - 18h00", t1: "FRA", t2: "IRQ", g1: "", g2: "" },
        { id: 43, g: "I", data: "Jogo 43 - 22/06 - 21h00", t1: "NOR", t2: "SEN", g1: "", g2: "" },
        { id: 44, g: "J", data: "Jogo 44 - 22/06 - 00h00", t1: "JOR", t2: "ALG", g1: "", g2: "" },
        { id: 45, g: "K", data: "Jogo 45 - 23/06 - 14h00", t1: "POR", t2: "UZB", g1: "", g2: "" },
        { id: 46, g: "L", data: "Jogo 46 - 23/06 - 17h00", t1: "ENG", t2: "GHA", g1: "", g2: "" },
        { id: 47, g: "L", data: "Jogo 47 - 23/06 - 20h00", t1: "PAN", t2: "CRO", g1: "", g2: "" },
        { id: 48, g: "K", data: "Jogo 48 - 23/06 - 23h00", t1: "COL", t2: "COD", g1: "", g2: "" },

        // 3ª RODADA
        { id: 49, g: "B", data: "Jogo 49 - 24/06 - 16h00", t1: "SUI", t2: "CAN", g1: "", g2: "" },
        { id: 50, g: "B", data: "Jogo 50 - 24/06 - 16h00", t1: "BIH", t2: "QAT", g1: "", g2: "" },
        { id: 51, g: "C", data: "Jogo 51 - 24/06 - 19h00", t1: "SCO", t2: "BRA", g1: "", g2: "" },
        { id: 52, g: "C", data: "Jogo 52 - 24/06 - 19h00", t1: "MAR", t2: "HAI", g1: "", g2: "" },
        { id: 53, g: "A", data: "Jogo 53 - 24/06 - 22h00", t1: "CZE", t2: "MEX", g1: "", g2: "" },
        { id: 54, g: "A", data: "Jogo 54 - 24/06 - 22h00", t1: "RSA", t2: "KOR", g1: "", g2: "" },
        { id: 55, g: "E", data: "Jogo 55 - 25/06 - 17h00", t1: "ECU", t2: "GER", g1: "", g2: "" },
        { id: 56, g: "E", data: "Jogo 56 - 25/06 - 17h00", t1: "CUW", t2: "CIV", g1: "", g2: "" },
        { id: 57, g: "F", data: "Jogo 57 - 25/06 - 20h00", t1: "JPN", t2: "SWE", g1: "", g2: "" },
        { id: 58, g: "F", data: "Jogo 58 - 25/06 - 20h00", t1: "TUN", t2: "NED", g1: "", g2: "" },
        { id: 59, g: "D", data: "Jogo 59 - 25/06 - 23h00", t1: "TUR", t2: "USA", g1: "", g2: "" },
        { id: 60, g: "D", data: "Jogo 60 - 25/06 - 23h00", t1: "PAR", t2: "AUS", g1: "", g2: "" },
        { id: 61, g: "I", data: "Jogo 61 - 26/06 - 16h00", t1: "NOR", t2: "FRA", g1: "", g2: "" },
        { id: 62, g: "I", data: "Jogo 62 - 26/06 - 16h00", t1: "SEN", t2: "IRQ", g1: "", g2: "" },
        { id: 63, g: "H", data: "Jogo 63 - 26/06 - 21h00", t1: "CPV", t2: "KSA", g1: "", g2: "" },
        { id: 64, g: "H", data: "Jogo 64 - 26/06 - 21h00", t1: "URU", t2: "ESP", g1: "", g2: "" },
        { id: 65, g: "G", data: "Jogo 65 - 27/06 - 00h00", t1: "EGY", t2: "IRN", g1: "", g2: "" },
        { id: 66, g: "G", data: "Jogo 66 - 27/06 - 00h00", t1: "NZL", t2: "BEL", g1: "", g2: "" },
        { id: 67, g: "L", data: "Jogo 67 - 27/06 - 18h00", t1: "PAN", t2: "ENG", g1: "", g2: "" },
        { id: 68, g: "L", data: "Jogo 68 - 27/06 - 18h00", t1: "CRO", t2: "GHA", g1: "", g2: "" },
        { id: 69, g: "K", data: "Jogo 69 - 27/06 - 20h30", t1: "COL", t2: "POR", g1: "", g2: "" },
        { id: 70, g: "K", data: "Jogo 70 - 27/06 - 20h30", t1: "COD", t2: "UZB", g1: "", g2: "" },
        { id: 71, g: "J", data: "Jogo 71 - 27/06 - 23h00", t1: "ALG", t2: "AUT", g1: "", g2: "" },
        { id: 72, g: "J", data: "Jogo 72 - 27/06 - 23h00", t1: "JOR", t2: "ARG", g1: "", g2: "" }
    ],
    mata32: [
        { id: 73, label: "Jogo 73 - Los Angeles", meta: "Dom, 28/06", t1: "", t2: "", g1: "", g2: "" },
        { id: 74, label: "Jogo 74 - Boston", meta: "Seg, 29/06", t1: "", t2: "", g1: "", g2: "" },
        { id: 75, label: "Jogo 75 - Monterrey", meta: "Seg, 29/06", t1: "", t2: "", g1: "", g2: "" },
        { id: 76, label: "Jogo 76 - Houston", meta: "Seg, 29/06", t1: "", t2: "", g1: "", g2: "" },
        { id: 77, label: "Jogo 77 - NY/NJ", meta: "Ter, 30/06", t1: "", t2: "", g1: "", g2: "" },
        { id: 78, label: "Jogo 78 - Dallas", meta: "Ter, 30/06", t1: "", t2: "", g1: "", g2: "" },
        { id: 79, label: "Jogo 79 - Cid. México", meta: "Ter, 30/06", t1: "", t2: "", g1: "", g2: "" },
        { id: 80, label: "Jogo 80 - Atlanta", meta: "Qua, 01/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 81, label: "Jogo 81 - Santa Clara", meta: "Qua, 01/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 82, label: "Jogo 82 - Seattle", meta: "Qua, 01/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 83, label: "Jogo 83 - Toronto", meta: "Qui, 02/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 84, label: "Jogo 84 - Los Angeles", meta: "Qui, 02/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 85, label: "Jogo 85 - Vancouver", meta: "Qui, 02/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 86, label: "Jogo 86 - Miami", meta: "Sex, 03/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 87, label: "Jogo 87 - Kansas City", meta: "Sex, 03/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 88, label: "Jogo 88 - Dallas", meta: "Sex, 03/07", t1: "", t2: "", g1: "", g2: "" }
    ],
    oitavas: [
        { id: 89, j1: 74, j2: 77, label: "Jogo 89 - Filadélfia", meta: "Sáb, 04/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 90, j1: 73, j2: 75, label: "Jogo 90 - Houston", meta: "Sáb, 04/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 91, j1: 76, j2: 78, label: "Jogo 91 - NY/NJ", meta: "Dom, 05/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 92, j1: 79, j2: 80, label: "Jogo 92 - Cid. México", meta: "Dom, 05/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 93, j1: 83, j2: 84, label: "Jogo 93 - Dallas", meta: "Seg, 06/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 94, j1: 81, j2: 82, label: "Jogo 94 - Seattle", meta: "Seg, 06/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 95, j1: 86, j2: 88, label: "Jogo 95 - Atlanta", meta: "Ter, 07/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 96, j1: 85, j2: 87, label: "Jogo 96 - Vancouver", meta: "Ter, 07/07", t1: "", t2: "", g1: "", g2: "" }
    ],
    quartas: [
        { id: 97, j1: 89, j2: 90, label: "Jogo 97 - Boston", meta: "Qui, 09/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 98, j1: 93, j2: 94, label: "Jogo 98 - L.A.", meta: "Sex, 10/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 99, j1: 91, j2: 92, label: "Jogo 99 - Miami", meta: "Sáb, 12/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 100, j1: 95, j2: 96, label: "Jogo 100 - K.C.", meta: "Sáb, 12/07", t1: "", t2: "", g1: "", g2: "" }
    ],
    semis: [
        { id: 101, j1: 97, j2: 98, label: "Jogo 101 - Dallas", meta: "Ter, 14/07", t1: "", t2: "", g1: "", g2: "" },
        { id: 102, j1: 99, j2: 100, label: "Jogo 102 - Atlanta", meta: "Qua, 15/07", t1: "", t2: "", g1: "", g2: "" }
    ],
    finais: {
        terceiro: { id: 103, label: "3º Lugar - Miami", meta: "Sáb, 18/07", t1: "", t2: "", g1: "", g2: "" },
        final: { id: 104, label: "FINAL - NY/NJ", meta: "Dom, 19/07", t1: "", t2: "", g1: "", g2: "" }
    }
};

let db = JSON.parse(localStorage.getItem('copa26_v6'));

if (!db || !db.jogos || db.jogos.length === 0 || db.jogos[62].t1 !== "CPV") {
    db = JSON.parse(JSON.stringify(dadosIniciais));
    localStorage.setItem('copa26_v6', JSON.stringify(db));
}

function mudarAba(aba) {
    document.querySelectorAll('.aba-conteudo').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.btn-nav').forEach(el => el.classList.remove('active'));
    document.getElementById('secao-' + aba).classList.add('active');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

function processarTudo() {
    let stats = {};
    Object.keys(db.grupos).forEach(g => {
        db.grupos[g].selecoes.forEach(s => {
            stats[s] = { id: s, nome: db.grupos[g].nomes[s], p: 0, sg: 0, gp: 0, gc: 0, j: 0 };
        });
    });

    // Processamento limpo de pontuação e saldo
    db.jogos.forEach(jogo => {
        if (jogo.g1 !== "" && jogo.g2 !== "") {
            let res1 = parseInt(jogo.g1), res2 = parseInt(jogo.g2);
            let t1 = stats[jogo.t1], t2 = stats[jogo.t2];
            
            t1.j++; t2.j++; 
            t1.gp += res1; t2.gp += res2;
            t1.gc += res2; t2.gc += res1;

            if (res1 > res2) { t1.p += 3; } 
            else if (res2 > res1) { t2.p += 3; } 
            else { t1.p += 1; t2.p += 1; }

            t1.sg = t1.gp - t1.gc;
            t2.sg = t2.gp - t2.gc;
        }
    });

    renderizarGrupos(stats);
    atualizarMataMata(stats);
    localStorage.setItem('copa26_v6', JSON.stringify(db));
}

function renderizarGrupos(stats) {
    const container = document.getElementById('container-grupos');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(db.grupos).forEach(gId => {
        let sels = db.grupos[gId].selecoes.map(s => stats[s]).sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp);
        let html = `<div class="grupo-card"><h3>Grupo ${gId}</h3><table><tr><th class="txt-l">Time</th><th>P</th><th>J</th><th>SG</th></tr>`;
        sels.forEach(s => {
            html += `<tr><td class="time-flag-left">${s.nome}</td><td>${s.p}</td><td>${s.j}</td><td>${s.sg}</td></tr>`;
        });
        html += `</table><div class="jogos-lista">`;

        db.jogos.filter(j => j.g === gId).forEach(j => {
            let idxOriginal = db.jogos.findIndex(jo => jo.id === j.id);
            html += `<div class="jogo-item"><div class="jogo-meta">${j.data}</div><div class="placar">
                <span class="time-flag-right">${db.grupos[gId].nomes[j.t1]}</span>
                <input type="number" value="${j.g1}" oninput="atuPlacar(${idxOriginal}, 'g1', this.value)">
                <input type="number" value="${j.g2}" oninput="atuPlacar(${idxOriginal}, 'g2', this.value)">
                <span class="time-flag-left">${db.grupos[gId].nomes[j.t2]}</span>
            </div></div>`;
        });
        container.innerHTML += html + `</div></div>`;
    });
}

function atualizarMataMata(stats) {
    let rankGeral = [];
    Object.keys(db.grupos).forEach(gId => {
        let ordenados = db.grupos[gId].selecoes.map(s => stats[s]).sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp);
        rankGeral.push({ grupo: gId, primeiro: ordenados[0], segundo: ordenados[1], terceiro: ordenados[2] });
    });

    let melhores3 = rankGeral.map(r => r.terceiro).sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp).slice(0, 8);

    // Mapeamento Oficial da Fase de 32 (Cruzamento estrito FIFA 2026)
    db.mata32[0].t1 = rankGeral[0].segundo.nome;  db.mata32[0].t2 = rankGeral[1].segundo.nome;  
    db.mata32[1].t1 = rankGeral[4].primeiro.nome; db.mata32[1].t2 = melhores3[0] ? melhores3[0].nome : "3º Colocado"; 
    db.mata32[2].t1 = rankGeral[5].primeiro.nome; db.mata32[2].t2 = rankGeral[2].segundo.nome;  
    db.mata32[3].t1 = rankGeral[2].primeiro.nome; db.mata32[3].t2 = rankGeral[5].segundo.nome;  
    db.mata32[4].t1 = rankGeral[8].primeiro.nome; db.mata32[4].t2 = melhores3[1] ? melhores3[1].nome : "3º Colocado"; 
    db.mata32[5].t1 = rankGeral[4].segundo.nome;  db.mata32[5].t2 = rankGeral[8].segundo.nome;  
    db.mata32[6].t1 = rankGeral[0].primeiro.nome; db.mata32[6].t2 = melhores3[2] ? melhores3[2].nome : "3º Colocado"; 
    db.mata32[7].t1 = rankGeral[11].primeiro.nome;db.mata32[7].t2 = melhores3[3] ? melhores3[3].nome : "3º Colocado"; 
    db.mata32[8].t1 = rankGeral[3].primeiro.nome; db.mata32[8].t2 = melhores3[4] ? melhores3[4].nome : "3º Colocado"; 
    db.mata32[9].t1 = rankGeral[6].primeiro.nome; db.mata32[9].t2 = melhores3[5] ? melhores3[5].nome : "3º Colocado"; 
    db.mata32[10].t1 = rankGeral[10].segundo.nome;db.mata32[10].t2 = rankGeral[11].segundo.nome; 
    db.mata32[11].t1 = rankGeral[7].primeiro.nome;db.mata32[11].t2 = rankGeral[9].segundo.nome;  
    db.mata32[12].t1 = rankGeral[1].primeiro.nome; db.mata32[12].t2 = melhores3[6] ? melhores3[6].nome : "3º Colocado"; 
    db.mata32[13].t1 = rankGeral[9].primeiro.nome; db.mata32[13].t2 = rankGeral[7].segundo.nome;  
    db.mata32[14].t1 = rankGeral[10].primeiro.nome;db.mata32[14].t2 = melhores3[7] ? melhores3[7].nome : "3º Colocado"; 
    db.mata32[15].t1 = rankGeral[3].segundo.nome;  db.mata32[15].t2 = rankGeral[6].segundo.nome;  

    renderMataGenerico('container-32avos', db.mata32, 'mata32');

    // Fluxo automático do mata-mata
    avancarFase(db.mata32, db.oitavas, 'oitavas');
    avancarFase(db.oitavas, db.quartas, 'quartas');
    avancarFase(db.quartas, db.semis, 'semis');

    let s1 = db.semis[0], s2 = db.semis[1];
    if (s1.g1 !== "" && s1.g2 !== "" && s2.g1 !== "" && s2.g2 !== "" && s1.g1 !== s1.g2 && s2.g1 !== s2.g2) {
        db.finais.final.t1 = parseInt(s1.g1) > parseInt(s1.g2) ? s1.t1 : s1.t2;
        db.finais.final.t2 = parseInt(s2.g1) > parseInt(s2.g2) ? s2.t1 : s2.t2;
        db.finais.terceiro.t1 = parseInt(s1.g1) > parseInt(s1.g2) ? s1.t2 : s1.t1;
        db.finais.terceiro.t2 = parseInt(s2.g1) > parseInt(s2.g2) ? s2.t2 : s2.t1;
    } else {
        db.finais.final.t1 = ""; db.finais.final.t2 = "";
        db.finais.terceiro.t1 = ""; db.finais.terceiro.t2 = "";
    }

    renderMataGenerico('oitavas-lista', db.oitavas, 'oitavas');
    renderMataGenerico('quartas-lista', db.quartas, 'quartas');
    renderMataGenerico('semis-lista', db.semis, 'semis');
    renderMataGenerico('final-lista', [db.finais.final], 'final');
    renderMataGenerico('terceiro-lista', [db.finais.terceiro], 'terceiro');

    let f = db.finais.final;
    let cBox = document.getElementById('campeao-box');
    if (cBox) {
        if (f.g1 !== "" && f.g2 !== "" && f.t1 && f.t2 && f.g1 !== f.g2) {
            let vencedor = parseInt(f.g1) > parseInt(f.g2) ? f.t1 : f.t2;
            cBox.innerHTML = `CAMPEÃO:<br><span style="font-size:1.6rem">${vencedor}</span>`;
            cBox.style.display = 'block';
        } else { cBox.style.display = 'none'; }
    }
}

function avancarFase(origem, destino, tipoDestino) {
    destino.forEach(jogo => {
        let j1 = origem.find(o => o.id === jogo.j1);
        let j2 = origem.find(o => o.id === jogo.j2);
        
        // Só avança se o jogo tiver placar e NÃO for empate
        if (j1 && j1.g1 !== "" && j1.g2 !== "" && j1.g1 !== j1.g2) {
            jogo.t1 = parseInt(j1.g1) > parseInt(j1.g2) ? j1.t1 : j1.t2;
        } else { jogo.t1 = ""; }
        
        if (j2 && j2.g1 !== "" && j2.g2 !== "" && j2.g1 !== j2.g2) {
            jogo.t2 = parseInt(j2.g1) > parseInt(j2.g2) ? j2.t1 : j2.t2;
        } else { jogo.t2 = ""; }
    });
}

function renderMataGenerico(containerId, lista, tipo) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    lista.forEach(j => {
        let idx = lista.indexOf(j);
        el.innerHTML += `<div class="jogo-item"><div class="jogo-meta"><b>${j.label}</b><br>${j.meta}</div><div class="placar">
            <span class="time-flag-right">${j.t1 || '<i>❓</i>'}</span>
            <input type="number" value="${j.g1}" ${(!j.t1 || !j.t2) ? 'disabled' : ''} oninput="atuMata('${tipo}', ${idx}, 'g1', this.value)">
            <input type="number" value="${j.g2}" ${(!j.t1 || !j.t2) ? 'disabled' : ''} oninput="atuMata('${tipo}', ${idx}, 'g2', this.value)">
            <span class="time-flag-left">${j.t2 || '<i>❓</i>'}</span>
        </div></div>`;
    });
}

function atuPlacar(idx, campo, val) { 
    db.jogos[idx][campo] = val; 
    processarTudo(); 
}

function atuMata(tipo, idx, campo, val) {
    if (tipo === 'final') db.finais.final[campo] = val;
    else if (tipo === 'terceiro') db.finais.terceiro[campo] = val;
    else db[tipo][idx][campo] = val;
    processarTudo();
}

function resetarSimulador() { 
    if(confirm("Deseja apagar todos os dados da simulação?")) {
        localStorage.removeItem('copa26_v6'); 
        location.reload(); 
    }
}

processarTudo();