// CONFIGURAÇÃO DO FIREBASE (Cole as suas credenciais aqui)
const firebaseConfig = {
    apiKey: "AIzaSyAq7V9Olon9CMCvycXkqnGLqnaQWeZBjCs",
    authDomain: "simuladorcopa2026.firebaseapp.com",
    databaseURL: "https://simuladorcopa2026-default-rtdb.firebaseio.com",
    projectId: "simuladorcopa2026",
    storageBucket: "simuladorcopa2026.firebasestorage.app",
    messagingSenderId: "318708564623",
    appId: "1:318708564623:web:b61bdb7bb70c70833d26fa"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const rtdb = firebase.database();

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
        { id: 10, g: "F", data: "Jogo 10 - 14/06 - 17h00", t1: "NED", t2: "JPN", g1: "", g2: "" },
        { id: 11, g: "E", data: "Jogo 11 - 14/06 - 20h00", t1: "CIV", t2: "ECU", g1: "", g2: "" },        
        { id: 12, g: "F", data: "Jogo 12 - 14/06 - 23h00", t1: "SWE", t2: "TUN", g1: "", g2: "" },
        { id: 13, g: "H", data: "Jogo 13 - 15/06 - 13h00", t1: "ESP", t2: "CPV", g1: "", g2: "" },        
        { id: 14, g: "G", data: "Jogo 14 - 15/06 - 16h00", t1: "BEL", t2: "EGY", g1: "", g2: "" },
        { id: 15, g: "H", data: "Jogo 15 - 15/06 - 19h00", t1: "KSA", t2: "URU", g1: "", g2: "" },
        { id: 16, g: "G", data: "Jogo 16 - 15/06 - 22h00", t1: "IRN", t2: "NZL", g1: "", g2: "" },
        { id: 17, g: "I", data: "Jogo 17 - 16/06 - 16h00", t1: "FRA", t2: "SEN", g1: "", g2: "" },
        { id: 18, g: "I", data: "Jogo 18 - 16/06 - 19h00", t1: "IRQ", t2: "NOR", g1: "", g2: "" },
        { id: 19, g: "J", data: "Jogo 19 - 16/06 - 22h00", t1: "ARG", t2: "ALG", g1: "", g2: "" },        
        { id: 20, g: "J", data: "Jogo 20 - 17/06 - 01h00", t1: "AUT", t2: "JOR", g1: "", g2: "" },
        { id: 21, g: "K", data: "Jogo 21 - 17/06 - 14h00", t1: "POR", t2: "COD", g1: "", g2: "" },
        { id: 22, g: "L", data: "Jogo 22 - 17/06 - 17h00", t1: "ENG", t2: "CRO", g1: "", g2: "" },
        { id: 23, g: "L", data: "Jogo 23 - 17/06 - 20h00", t1: "GHA", t2: "PAN", g1: "", g2: "" },
        { id: 24, g: "K", data: "Jogo 24 - 17/06 - 23h00", t1: "UZB", t2: "COL", g1: "", g2: "" },

        // 2ª RODADA
        { id: 25, g: "A", data: "Jogo 25 - 18/06 - 13h00", t1: "CZE", t2: "RSA", g1: "", g2: "" },
        { id: 26, g: "B", data: "Jogo 26 - 18/06 - 16h00", t1: "SUI", t2: "BIH", g1: "", g2: "" },
        { id: 27, g: "B", data: "Jogo 27 - 18/06 - 19h00", t1: "CAN", t2: "QAT", g1: "", g2: "" },
        { id: 28, g: "A", data: "Jogo 28 - 18/06 - 22h00", t1: "MEX", t2: "KOR", g1: "", g2: "" },
        { id: 29, g: "D", data: "Jogo 29 - 19/06 - 16h00", t1: "USA", t2: "AUS", g1: "", g2: "" },
        { id: 30, g: "C", data: "Jogo 30 - 19/06 - 19h00", t1: "SCO", t2: "MAR", g1: "", g2: "" },
        { id: 31, g: "C", data: "Jogo 31 - 19/06 - 21h30", t1: "BRA", t2: "HAI", g1: "", g2: "" },        
        { id: 32, g: "D", data: "Jogo 32 - 20/06 - 00h00", t1: "TUR", t2: "PAR", g1: "", g2: "" },        
        { id: 33, g: "F", data: "Jogo 33 - 20/06 - 14h00", t1: "NED", t2: "SWE", g1: "", g2: "" },
        { id: 34, g: "E", data: "Jogo 34 - 20/06 - 17h00", t1: "GER", t2: "CIV", g1: "", g2: "" },
        { id: 35, g: "E", data: "Jogo 35 - 20/06 - 21h00", t1: "ECU", t2: "CUW", g1: "", g2: "" },
        { id: 36, g: "F", data: "Jogo 36 - 21/06 - 01h00", t1: "TUN", t2: "JPN", g1: "", g2: "" },
        { id: 37, g: "H", data: "Jogo 37 - 21/06 - 13h00", t1: "ESP", t2: "KSA", g1: "", g2: "" },
        { id: 38, g: "G", data: "Jogo 38 - 21/06 - 16h00", t1: "BEL", t2: "IRN", g1: "", g2: "" },
        { id: 39, g: "H", data: "Jogo 39 - 21/06 - 19h00", t1: "URU", t2: "CPV", g1: "", g2: "" },
        { id: 40, g: "G", data: "Jogo 40 - 21/06 - 22h00", t1: "NZL", t2: "EGY", g1: "", g2: "" },
        { id: 41, g: "J", data: "Jogo 41 - 22/06 - 14h00", t1: "ARG", t2: "AUT", g1: "", g2: "" },
        { id: 42, g: "I", data: "Jogo 42 - 22/06 - 18h00", t1: "FRA", t2: "IRQ", g1: "", g2: "" },
        { id: 43, g: "I", data: "Jogo 43 - 22/06 - 21h00", t1: "NOR", t2: "SEN", g1: "", g2: "" },
        { id: 44, g: "J", data: "Jogo 44 - 23/06 - 00h00", t1: "JOR", t2: "ALG", g1: "", g2: "" },
        { id: 45, g: "K", data: "Jogo 45 - 23/06 - 14h00", t1: "POR", t2: "UZB", g1: "", g2: "" },
        { id: 46, g: "L", data: "Jogo 46 - 23/06 - 17h00", t1: "ENG", t2: "GHA", g1: "", g2: "" },
        { id: 47, g: "L", data: "Jogo 47 - 23/06 - 20h00", t1: "PAN", t2: "CRO", g1: "", g2: "" },
        { id: 48, g: "K", data: "Jogo 48 - 23/06 - 23h00", t1: "COL", t2: "COD", g1: "", g2: "" },

        // 3ª RODADA
        { id: 49, g: "B", data: "Jogo 49 - 24/06 - 16h00", t1: "SUI", t2: "CAN", g1: "", g2: "" },
        { id: 50, g: "B", data: "Jogo 50 - 24/06 - 16h00", t1: "BIH", t2: "QAT", g1: "", g2: "" },
        { id: 51, g: "C", data: "Jogo 51 - 24/06 - 19h00", t1: "MAR", t2: "HAI", g1: "", g2: "" },        
        { id: 52, g: "C", data: "Jogo 52 - 24/06 - 19h00", t1: "SCO", t2: "BRA", g1: "", g2: "" },
        { id: 53, g: "A", data: "Jogo 53 - 24/06 - 22h00", t1: "RSA", t2: "KOR", g1: "", g2: "" },
        { id: 54, g: "A", data: "Jogo 54 - 24/06 - 22h00", t1: "CZE", t2: "MEX", g1: "", g2: "" },
        { id: 55, g: "E", data: "Jogo 55 - 25/06 - 17h00", t1: "CUW", t2: "CIV", g1: "", g2: "" },
        { id: 56, g: "E", data: "Jogo 56 - 25/06 - 17h00", t1: "ECU", t2: "GER", g1: "", g2: "" },
        { id: 57, g: "F", data: "Jogo 57 - 25/06 - 20h00", t1: "TUN", t2: "NED", g1: "", g2: "" },
        { id: 58, g: "F", data: "Jogo 58 - 25/06 - 20h00", t1: "JPN", t2: "SWE", g1: "", g2: "" },        
        { id: 59, g: "D", data: "Jogo 59 - 25/06 - 23h00", t1: "TUR", t2: "USA", g1: "", g2: "" },
        { id: 60, g: "D", data: "Jogo 60 - 25/06 - 23h00", t1: "PAR", t2: "AUS", g1: "", g2: "" },
        { id: 61, g: "I", data: "Jogo 61 - 26/06 - 16h00", t1: "NOR", t2: "FRA", g1: "", g2: "" },
        { id: 62, g: "I", data: "Jogo 62 - 26/06 - 16h00", t1: "SEN", t2: "IRQ", g1: "", g2: "" },
        { id: 63, g: "H", data: "Jogo 63 - 26/06 - 21h00", t1: "CPV", t2: "KSA", g1: "", g2: "" },
        { id: 64, g: "H", data: "Jogo 64 - 26/06 - 21h00", t1: "URU", t2: "ESP", g1: "", g2: "" },
        { id: 65, g: "G", data: "Jogo 65 - 27/06 - 00h00", t1: "NZL", t2: "BEL", g1: "", g2: "" },
        { id: 66, g: "G", data: "Jogo 66 - 27/06 - 00h00", t1: "EGY", t2: "IRN", g1: "", g2: "" },        
        { id: 67, g: "L", data: "Jogo 67 - 27/06 - 18h00", t1: "PAN", t2: "ENG", g1: "", g2: "" },
        { id: 68, g: "L", data: "Jogo 68 - 27/06 - 18h00", t1: "CRO", t2: "GHA", g1: "", g2: "" },
        { id: 69, g: "K", data: "Jogo 69 - 27/06 - 20h30", t1: "COL", t2: "POR", g1: "", g2: "" },
        { id: 70, g: "K", data: "Jogo 70 - 27/06 - 20h30", t1: "COD", t2: "UZB", g1: "", g2: "" },
        { id: 71, g: "J", data: "Jogo 71 - 27/06 - 23h00", t1: "ALG", t2: "AUT", g1: "", g2: "" },
        { id: 72, g: "J", data: "Jogo 72 - 27/06 - 23h00", t1: "JOR", t2: "ARG", g1: "", g2: "" }
    ],
    mata32: [
        { id: 73, label: "Jogo 73 - 28/06 - 16h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 74, label: "Jogo 76 - 29/06 - 14h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 75, label: "Jogo 74 - 29/06 - 17h30", t1: "", t2: "", g1: "", g2: "" },
        { id: 76, label: "Jogo 75 - 29/06 - 22h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 77, label: "Jogo 78 - 30/06 - 14h00", t1: "", t2: "", g1: "", g2: "" },        
        { id: 78, label: "Jogo 77 - 30/06 - 18h00", t1: "", t2: "", g1: "", g2: "" },        
        { id: 79, label: "Jogo 79 - 30/06 - 22h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 80, label: "Jogo 80 - 01/07 - 13h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 81, label: "Jogo 82 - 01/07 - 17h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 82, label: "Jogo 81 - 01/07 - 21h00", t1: "", t2: "", g1: "", g2: "" },  
        { id: 83, label: "Jogo 84 - 02/07 - 16h00", t1: "", t2: "", g1: "", g2: "" },      
        { id: 84, label: "Jogo 83 - 02/07 - 20h00", t1: "", t2: "", g1: "", g2: "" },        
        { id: 85, label: "Jogo 85 - 03/07 - 00h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 86, label: "Jogo 88 - 03/07 - 15h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 87, label: "Jogo 86 - 03/07 - 19h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 88, label: "Jogo 87 - 03/07 - 22h30", t1: "", t2: "", g1: "", g2: "" }
        
    ],
    oitavas: [
        { id: 89, j1: 73, j2: 75, label: "Jogo 90 - 04/07 - 14h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 90, j1: 74, j2: 77, label: "Jogo 89 - 04/07 - 18h00", t1: "", t2: "", g1: "", g2: "" },        
        { id: 91, j1: 76, j2: 78, label: "Jogo 91 - 05/07 - 17h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 92, j1: 79, j2: 80, label: "Jogo 92 - 05/07 - 21h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 93, j1: 83, j2: 84, label: "Jogo 93 - 06/07 - 16h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 94, j1: 81, j2: 82, label: "Jogo 94 - 06/07 - 21h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 95, j1: 86, j2: 88, label: "Jogo 95 - 07/07 - 13h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 96, j1: 85, j2: 87, label: "Jogo 96 - 07/07 - 17h00", t1: "", t2: "", g1: "", g2: "" }
    ],
    quartas: [
        { id: 97, j1: 89, j2: 90, label: "Jogo 97 - 07/07 - 17h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 98, j1: 93, j2: 94, label: "Jogo 98 - 10/07 - 16h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 99, j1: 91, j2: 92, label: "Jogo 99 - 11/07 - 18h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 100, j1: 95, j2: 96, label: "Jogo 100 - 11/07 - 22h00", t1: "", t2: "", g1: "", g2: "" }
    ],
    semis: [
        { id: 101, j1: 97, j2: 98, label: "Jogo 101 - 14/07 - 16h00", t1: "", t2: "", g1: "", g2: "" },
        { id: 102, j1: 99, j2: 100, label: "Jogo 102 - 15/07 - 16h00", t1: "", t2: "", g1: "", g2: "" }
    ],
    finais: {
        terceiro: { id: 103, label: "3º Lugar - 18/07 - 18h00", t1: "", t2: "", g1: "", g2: "" },
        final: { id: 104, label: "FINAL - 19/07 - 16h00", t1: "", t2: "", g1: "", g2: "" }
    }
};

let db = JSON.parse(JSON.stringify(dadosIniciais));
let isAdminLogado = false;

// === MONITOR DE AUTENTICAÇÃO DO FIREBASE ===
auth.onAuthStateChanged(user => {
    if (user) {
        isAdminLogado = true;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('logged-info').style.display = 'flex';
        document.getElementById('btn-reset-global').style.display = 'inline-block';
    } else {
        isAdminLogado = false;
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('logged-info').style.display = 'none';
        document.getElementById('btn-reset-global').style.display = 'none';
    }
    processarTudo(); 
});

// Sincronização em tempo real com o banco Firebase
rtdb.ref('copa26_dados').on('value', snapshot => {
    const dadosFirebase = snapshot.val();
    if (dadosFirebase) {
        db = dadosFirebase;
    } else {
        // Inicializa o Firebase com os dados padrão se estiver vazio
        db = JSON.parse(JSON.stringify(dadosIniciais));
        rtdb.ref('copa26_dados').set(db);
    }
    processarTudoLocal();
});

function loginAdmin() {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    auth.signInWithEmailAndPassword(email, senha).catch(err => alert("Erro ao autenticar: " + err.message));
}

function logoutAdmin() {
    auth.signOut();
}

function mudarAba(aba) {
    document.querySelectorAll('.aba-conteudo').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.btn-nav').forEach(el => el.classList.remove('active'));
    document.getElementById('secao-' + aba).classList.add('active');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// Retorna o input editável se for admin, ou apenas texto estilizado se for visitante
function gerarCampoPlacar(origem, idx, campo, valor, desabilitado, dataFiltro = '') {
    if (isAdminLogado) {
        let eventoOninput = `validarEAtualizarPlacarGeral('${origem}', ${idx}, '${campo}', this.value)`;
        if (dataFiltro !== '') {
            eventoOninput += `; dbOrigemParaMata('${origem}', ${idx}, '${campo}', this.value); renderizarJogosDoDia('${dataFiltro}')`;
        }
        return `<input type="number" min="0" placeholder="0" value="${valor}" ${desabilitado ? 'disabled' : ''} oninput="${eventoOninput}">`;
    } else {
        return `<span class="placar-visitante">${valor === "" ? "-" : valor}</span>`;
    }
}

function processarTudo() {
    rtdb.ref('copa26_dados').once('value').then(snapshot => {
        if(snapshot.val()) db = snapshot.val();
        processarTudoLocal();
    });
}

function processarTudoLocal() {
    let stats = {};
    Object.keys(db.grupos).forEach(g => {
        db.grupos[g].selecoes.forEach(s => {
            stats[s] = { id: s, nome: db.grupos[g].nomes[s], p: 0, sg: 0, gp: 0, gc: 0, j: 0 };
        });
    });

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
    
    // Roda a inicialização das datas apenas uma vez quando o select estiver vazio
    const select = document.getElementById('select-data-jogo');
    if (select && select.innerHTML === "") {
        inicializarFiltroDatas();
    } else if (select) {
        renderizarJogosDoDia(select.value);
    }
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
            let campo1 = gerarCampoPlacar('grupo', idxOriginal, 'g1', j.g1, false);
            let campo2 = gerarCampoPlacar('grupo', idxOriginal, 'g2', j.g2, false);

            html += `<div class="jogo-item"><div class="jogo-meta">${j.data}</div><div class="placar">
                <span class="time-flag-right">${db.grupos[gId].nomes[j.t1]}</span>
                ${campo1} ${campo2}
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
        let desabilitado = (!j.t1 || !j.t2);
        let campo1 = gerarCampoPlacar(tipo, idx, 'g1', j.g1, desabilitado);
        let campo2 = gerarCampoPlacar(tipo, idx, 'g2', j.g2, desabilitado);

        el.innerHTML += `<div class="jogo-item"><div class="jogo-meta"><b>${j.label}</b><br>${j.meta}</div><div class="placar">
            <span class="time-flag-right">${j.t1 || '<i>❓</i>'}</span>
            ${campo1} ${campo2}
            <span class="time-flag-left">${j.t2 || '<i>❓</i>'}</span>
        </div></div>`;
    });
}

function resetarSimulador() { 
    if(confirm("Deseja redefinir todo o banco de dados da Copa no Firebase para o estado inicial?")) {
        rtdb.ref('copa26_dados').set(dadosIniciais).then(() => {
            location.reload();
        });
    }
}

function inicializarFiltroDatas() {
    const select = document.getElementById('select-data-jogo');
    if (!select) return;

    let datasUnicas = [];

    // 1. Coleta dos jogos da fase de grupos (usa j.data)
    db.jogos.forEach(j => {
        if (j.data) {
            let match = j.data.match(/\d{2}\/\d{2}/);
            if (match && !datasUnicas.includes(match[0])) datasUnicas.push(match[0]);
        }
    });

    // 2. Coleta das fases de mata-mata (corrigido de j.meta para j.label)
    const fasesMata = ['mata32', 'oitavas', 'quartas', 'semis'];
    fasesMata.forEach(fase => {
        if (db[fase]) {
            db[fase].forEach(j => {
                if (j.label) {
                    let match = j.label.match(/\d{2}\/\d{2}/);
                    if (match && !datasUnicas.includes(match[0])) datasUnicas.push(match[0]);
                }
            });
        }
    });

    // 3. Coleta das finais (corrigido de .meta para .label com verificação preventiva)
    if (db.finais && db.finais.terceiro && db.finais.terceiro.label) {
        let matchT = db.finais.terceiro.label.match(/\d{2}\/\d{2}/);
        if (matchT && !datasUnicas.includes(matchT[0])) datasUnicas.push(matchT[0]);
    }
    if (db.finais && db.finais.final && db.finais.final.label) {
        let matchF = db.finais.final.label.match(/\d{2}\/\d{2}/);
        if (matchF && !datasUnicas.includes(matchF[0])) datasUnicas.push(matchF[0]);
    }

    // Ordenação cronológica das datas encontradas
    datasUnicas.sort((a, b) => {
        let [diaA, mesA] = a.split('/');
        let [diaB, mesB] = b.split('/');
        return `${mesA}${diaA}`.localeCompare(`${mesB}${diaB}`);
    });

    select.innerHTML = datasUnicas.map(d => `<option value="${d}">Dia ${d}</option>`).join('');

    // Captura automática do dia atual do sistema operacional (Formato: DD/MM)
    const hoje = new Date();
    const diaFormated = String(hoje.getDate()).padStart(2, '0');
    const mesFormated = String(hoje.getMonth() + 1).padStart(2, '0');
    const dataAtualString = `${diaFormated}/${mesFormated}`;

    // Se o dia de hoje estiver nos dias da copa, define como padrão. Senão, põe o primeiro dia do torneio
    const diaPadrao = datasUnicas.includes(dataAtualString) ? dataAtualString : datasUnicas[0];
    select.value = diaPadrao;

    if (diaPadrao) {
        renderizarJogosDoDia(diaPadrao);
    }
}

function renderizarJogosDoDia(dataSelecionada) {
    const container = document.getElementById('lista-jogos-dia');
    if (!container) return;

    let html = "";

    db.jogos.filter(j => j.data && j.data.includes(dataSelecionada)).forEach(j => {
        let idxOriginal = db.jogos.findIndex(jo => jo.id === j.id);
        let gId = j.g;
        let emojiT1 = db.grupos[gId].nomes[j.t1] || j.t1;
        let emojiT2 = db.grupos[gId].nomes[j.t2] || j.t2;
        let rotulo = `Grupo ${gId} - ${j.data.split(' - ')[2] || ''}`;

        html += criarCardJogoDia('grupo', idxOriginal, rotulo, emojiT1, emojiT2, j.g1, j.g2, dataSelecionada);
    });

    const fases = [
        { chave: 'mata32', titulo: 'Fase de 32' },
        { chave: 'oitavas', titulo: 'Oitavas de Final' },
        { chave: 'quartas', titulo: 'Quartas de Final' },
        { chave: 'semis', titulo: 'Semifinal' }
    ];

    fases.forEach(fase => {
        // Mudado j.meta para j.label aqui também
        db[fase.chave].filter(j => j.label && j.label.includes(dataSelecionada)).forEach(j => {
            let idxOriginal = db[fase.chave].findIndex(jo => jo.id === j.id);
            let rotulo = `${fase.titulo} - ${j.label.split(' - ')[1] || j.label}`;
            html += criarCardJogoDia(fase.chave, idxOriginal, rotulo, j.t1, j.t2, j.g1, j.g2, dataSelecionada);
        });
    });

    // Mudado j.meta para j.label nas finais
    if (db.finais && db.finais.terceiro && db.finais.terceiro.label && db.finais.terceiro.label.includes(dataSelecionada)) {
        let j = db.finais.terceiro;
        html += criarCardJogoDia('terceiro', 0, `Disputa do 3º Lugar - 18/07 - 18h00`, j.t1, j.t2, j.g1, j.g2, dataSelecionada);
    }
    if (db.finais && db.finais.final && db.finais.final.label && db.finais.final.label.includes(dataSelecionada)) {
        let j = db.finais.final;
        html += criarCardJogoDia('final', 0, `Grande FINAL - 19/07 - 16h00`, j.t1, j.t2, j.g1, j.g2, dataSelecionada);
    }

    if (html === "") {
        container.innerHTML = `<p style="text-align: center; color: #666; width: 100%; grid-column: 1/-1;">Nenhum jogo agendado para este dia.</p>`;
    } else {
        container.innerHTML = html;
    }
}

function criarCardJogoDia(tipoOrigem, index, label, t1, t2, g1, g2, dataSelecionada) {
    let nomeT1 = t1 || '<i>❓</i>';
    let nomeT2 = t2 || '<i>❓</i>';
    let desabilitado = (!t1 || !t2 || t1.includes("3º Colocado") || t2.includes("3º Colocado"));
    
    let campo1 = gerarCampoPlacar(tipoOrigem, index, 'g1', g1, desabilitado, dataSelecionada);
    let campo2 = gerarCampoPlacar(tipoOrigem, index, 'g2', g2, desabilitado, dataSelecionada);

    return `
    <div class="jogo-item" style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div class="jogo-meta" style="font-weight: bold; color: var(--primary); margin-bottom: 10px;">${label}</div>
        <div class="placar">
            <span class="time-flag-right">${nomeT1}</span>
            ${campo1} ${campo2}
            <span class="time-flag-left">${nomeT2}</span>
        </div>
    </div>`;
}

function dbOrigemParaMata(tipoOrigem, index, campo, valor) {
    let numCorrigido = valor === "" ? "" : Math.max(0, parseInt(valor, 10) || 0);
    if (tipoOrigem === 'grupo') {
        db.jogos[index][campo] = numCorrigido;
    } else if (tipoOrigem === 'final') {
        db.finais.final[campo] = numCorrigido;
    } else if (tipoOrigem === 'terceiro') {
        db.finais.terceiro[campo] = numCorrigido;
    } else {
        db[tipoOrigem][index][campo] = numCorrigido;
    }
    // Salva no Firebase (Dispara o gatilho em tempo real para todo mundo)
    rtdb.ref('copa26_dados').set(db);
}

function validarEAtualizarPlacarGeral(origem, idx, campo, valor) {
    let numCorrigido = "";
    if (valor !== "") {
        let num = parseInt(valor, 10);
        if (isNaN(num) || num < 0) num = 0;
        numCorrigido = num;
    }

    if (origem === 'grupo' || origem === 'modal') {
        db.jogos[idx][campo] = numCorrigido;
    } else if (origem === 'final') {
        db.finais.final[campo] = numCorrigido;
    } else if (origem === 'terceiro') {
        db.finais.terceiro[campo] = numCorrigido;
    } else {
        db[origem][idx][campo] = numCorrigido;
    }

    // Envia ao Firebase
    rtdb.ref('copa26_dados').set(db);
}