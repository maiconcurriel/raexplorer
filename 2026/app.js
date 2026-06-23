const firebaseConfig = {
    apiKey: "AIzaSyAq7V9Olon9CMCvycXkqnGLqnaQWeZBjCs",
    authDomain: "simuladorcopa2026.firebaseapp.com",
    databaseURL: "https://simuladorcopa2026-default-rtdb.firebaseio.com",
    projectId: "simuladorcopa2026",
    storageBucket: "simuladorcopa2026.firebasestorage.app",
    messagingSenderId: "318708564623",
    appId: "1:318708564623:web:b61bdb7bb70c70833d26fa"
};

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
        { id: 1, g: "A", data: "Jogo 1 - 11/06 - 16h00", t1: "MEX", t2: "RSA", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 2, g: "A", data: "Jogo 2 - 11/06 - 23h00", t1: "KOR", t2: "CZE", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 3, g: "B", data: "Jogo 3 - 12/06 - 16h00", t1: "CAN", t2: "BIH", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 4, g: "D", data: "Jogo 4 - 12/06 - 22h00", t1: "USA", t2: "PAR", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 5, g: "B", data: "Jogo 5 - 13/06 - 16h00", t1: "QAT", t2: "SUI", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 6, g: "C", data: "Jogo 6 - 13/06 - 19h00", t1: "BRA", t2: "MAR", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 7, g: "C", data: "Jogo 7 - 13/06 - 22h00", t1: "HAI", t2: "SCO", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 8, g: "D", data: "Jogo 8 - 14/06 - 01h00", t1: "AUS", t2: "TUR", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 9, g: "E", data: "Jogo 9 - 14/06 - 14h00", t1: "GER", t2: "CUW", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 10, g: "F", data: "Jogo 10 - 14/06 - 17h00", t1: "NED", t2: "JPN", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 11, g: "E", data: "Jogo 11 - 14/06 - 20h00", t1: "CIV", t2: "ECU", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 12, g: "F", data: "Jogo 12 - 14/06 - 23h00", t1: "SWE", t2: "TUN", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 13, g: "H", data: "Jogo 13 - 15/06 - 13h00", t1: "ESP", t2: "CPV", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 14, g: "G", data: "Jogo 14 - 15/06 - 16h00", t1: "BEL", t2: "EGY", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 15, g: "H", data: "Jogo 15 - 15/06 - 19h00", t1: "KSA", t2: "URU", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 16, g: "G", data: "Jogo 16 - 15/06 - 22h00", t1: "IRN", t2: "NZL", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 17, g: "I", data: "Jogo 17 - 16/06 - 16h00", t1: "FRA", t2: "SEN", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 18, g: "I", data: "Jogo 18 - 16/06 - 19h00", t1: "IRQ", t2: "NOR", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 19, g: "J", data: "Jogo 19 - 16/06 - 22h00", t1: "ARG", t2: "ALG", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 20, g: "J", data: "Jogo 20 - 17/06 - 01h00", t1: "AUT", t2: "JOR", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 21, g: "K", data: "Jogo 21 - 17/06 - 14h00", t1: "POR", t2: "COD", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 22, g: "L", data: "Jogo 22 - 17/06 - 17h00", t1: "ENG", t2: "CRO", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 23, g: "L", data: "Jogo 23 - 17/06 - 20h00", t1: "GHA", t2: "PAN", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 24, g: "K", data: "Jogo 24 - 17/06 - 23h00", t1: "UZB", t2: "COL", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },

        { id: 25, g: "A", data: "Jogo 25 - 18/06 - 13h00", t1: "CZE", t2: "RSA", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 26, g: "B", data: "Jogo 26 - 18/06 - 16h00", t1: "SUI", t2: "BIH", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 27, g: "B", data: "Jogo 27 - 18/06 - 19h00", t1: "CAN", t2: "QAT", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 28, g: "A", data: "Jogo 28 - 18/06 - 22h00", t1: "MEX", t2: "KOR", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 29, g: "D", data: "Jogo 29 - 19/06 - 16h00", t1: "USA", t2: "AUS", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 30, g: "C", data: "Jogo 30 - 19/06 - 19h00", t1: "SCO", t2: "MAR", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 31, g: "C", data: "Jogo 31 - 19/06 - 21h30", t1: "BRA", t2: "HAI", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 32, g: "D", data: "Jogo 32 - 20/06 - 00h00", t1: "TUR", t2: "PAR", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 33, g: "F", data: "Jogo 33 - 20/06 - 14h00", t1: "NED", t2: "SWE", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 34, g: "E", data: "Jogo 34 - 20/06 - 17h00", t1: "GER", t2: "CIV", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 35, g: "E", data: "Jogo 35 - 20/06 - 21h00", t1: "ECU", t2: "CUW", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 36, g: "F", data: "Jogo 36 - 21/06 - 01h00", t1: "TUN", t2: "JPN", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 37, g: "H", data: "Jogo 37 - 21/06 - 13h00", t1: "ESP", t2: "KSA", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 38, g: "G", data: "Jogo 38 - 21/06 - 16h00", t1: "BEL", t2: "IRN", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 39, g: "H", data: "Jogo 39 - 21/06 - 19h00", t1: "URU", t2: "CPV", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 40, g: "G", data: "Jogo 40 - 21/06 - 22h00", t1: "NZL", t2: "EGY", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 41, g: "J", data: "Jogo 41 - 22/06 - 14h00", t1: "ARG", t2: "AUT", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 42, g: "I", data: "Jogo 42 - 22/06 - 18h00", t1: "FRA", t2: "IRQ", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 43, g: "I", data: "Jogo 43 - 22/06 - 21h00", t1: "NOR", t2: "SEN", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 44, g: "J", data: "Jogo 44 - 23/06 - 00h00", t1: "JOR", t2: "ALG", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 45, g: "K", data: "Jogo 45 - 23/06 - 14h00", t1: "POR", t2: "UZB", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 46, g: "L", data: "Jogo 46 - 23/06 - 17h00", t1: "ENG", t2: "GHA", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 47, g: "L", data: "Jogo 47 - 23/06 - 20h00", t1: "PAN", t2: "CRO", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 48, g: "K", data: "Jogo 48 - 23/06 - 23h00", t1: "COL", t2: "COD", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },

        { id: 49, g: "B", data: "Jogo 49 - 24/06 - 16h00", t1: "SUI", t2: "CAN", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 50, g: "B", data: "Jogo 50 - 24/06 - 16h00", t1: "BIH", t2: "QAT", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 51, g: "C", data: "Jogo 51 - 24/06 - 19h00", t1: "MAR", t2: "HAI", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 52, g: "C", data: "Jogo 52 - 24/06 - 19h00", t1: "SCO", t2: "BRA", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 53, g: "A", data: "Jogo 53 - 24/06 - 22h00", t1: "RSA", t2: "KOR", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 54, g: "A", data: "Jogo 54 - 24/06 - 22h00", t1: "CZE", t2: "MEX", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 55, g: "E", data: "Jogo 55 - 25/06 - 17h00", t1: "CUW", t2: "CIV", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 56, g: "E", data: "Jogo 56 - 25/06 - 17h00", t1: "ECU", t2: "GER", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 57, g: "F", data: "Jogo 57 - 25/06 - 20h00", t1: "TUN", t2: "NED", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 58, g: "F", data: "Jogo 58 - 25/06 - 20h00", t1: "JPN", t2: "SWE", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 59, g: "D", data: "Jogo 59 - 25/06 - 23h00", t1: "TUR", t2: "USA", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 60, g: "D", data: "Jogo 60 - 25/06 - 23h00", t1: "PAR", t2: "AUS", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 61, g: "I", data: "Jogo 61 - 26/06 - 16h00", t1: "NOR", t2: "FRA", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 62, g: "I", data: "Jogo 62 - 26/06 - 16h00", t1: "SEN", t2: "IRQ", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 63, g: "H", data: "Jogo 63 - 26/06 - 21h00", t1: "CPV", t2: "KSA", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 64, g: "H", data: "Jogo 64 - 26/06 - 21h00", t1: "URU", t2: "ESP", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 65, g: "G", data: "Jogo 65 - 27/06 - 00h00", t1: "NZL", t2: "BEL", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 66, g: "G", data: "Jogo 66 - 27/06 - 00h00", t1: "EGY", t2: "IRN", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 67, g: "L", data: "Jogo 67 - 27/06 - 18h00", t1: "PAN", t2: "ENG", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 68, g: "L", data: "Jogo 68 - 27/06 - 18h00", t1: "CRO", t2: "GHA", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 69, g: "K", data: "Jogo 69 - 27/06 - 20h30", t1: "COL", t2: "POR", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 70, g: "K", data: "Jogo 70 - 27/06 - 20h30", t1: "COD", t2: "UZB", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 71, g: "J", data: "Jogo 71 - 27/06 - 23h00", t1: "ALG", t2: "AUT", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 72, g: "J", data: "Jogo 72 - 27/06 - 23h00", t1: "JOR", t2: "ARG", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" }
    ],
    mata32: [
        { id: 73, label: "Jogo 73 - 28/06 - 16h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 74, label: "Jogo 74 - 29/06 - 17h30", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 75, label: "Jogo 75 - 29/06 - 22h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 76, label: "Jogo 76 - 29/06 - 14h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 77, label: "Jogo 77 - 30/06 - 18h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 78, label: "Jogo 78 - 30/06 - 14h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 79, label: "Jogo 79 - 30/06 - 22h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 80, label: "Jogo 80 - 01/07 - 13h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 81, label: "Jogo 81 - 01/07 - 21h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 82, label: "Jogo 82 - 01/07 - 17h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 83, label: "Jogo 83 - 02/07 - 20h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 84, label: "Jogo 84 - 02/07 - 16h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 85, label: "Jogo 85 - 03/07 - 00h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 86, label: "Jogo 86 - 03/07 - 19h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 87, label: "Jogo 87 - 03/07 - 22h30", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 88, label: "Jogo 88 - 03/07 - 15h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" }
    ],
    oitavas: [
        { id: 89, j1: 74, j2: 77, label: "Jogo 89 - 04/07 - 18h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 90, j1: 73, j2: 75, label: "Jogo 90 - 04/07 - 14h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 91, j1: 76, j2: 78, label: "Jogo 91 - 05/07 - 17h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 92, j1: 79, j2: 80, label: "Jogo 92 - 05/07 - 21h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 93, j1: 83, j2: 84, label: "Jogo 93 - 06/07 - 16h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 94, j1: 81, j2: 82, label: "Jogo 94 - 06/07 - 21h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 95, j1: 86, j2: 88, label: "Jogo 95 - 07/07 - 13h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 96, j1: 85, j2: 87, label: "Jogo 96 - 07/07 - 17h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" }
    ],
    quartas: [
        { id: 97, j1: 89, j2: 90, label: "Jogo 97 - 07/07 - 17h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 98, j1: 93, j2: 94, label: "Jogo 98 - 10/07 - 16h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 99, j1: 91, j2: 92, label: "Jogo 99 - 11/07 - 18h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 100, j1: 95, j2: 96, label: "Jogo 100 - 11/07 - 22h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" }
    ],
    semis: [
        { id: 101, j1: 97, j2: 98, label: "Jogo 101 - 14/07 - 16h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        { id: 102, j1: 99, j2: 100, label: "Jogo 102 - 15/07 - 16h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" }
    ],
    finais: {
        terceiro: { id: 103, label: "3º Lugar - 18/07 - 18h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" },
        final: { id: 104, label: "FINAL - 19/07 - 16h00", t1: "", t2: "", g1: "", g2: "", c_am1: 0, c_vm1: 0, c_am2: 0, c_vm2: 0, liveUrl: "" }
    }
};

let db = JSON.parse(JSON.stringify(dadosIniciais));
let isAdminLogado = false;

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

rtdb.ref('copa26_dados').on('value', snapshot => {
    const dadosFirebase = snapshot.val();
    if (dadosFirebase) {
        db = dadosFirebase;
    } else {
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
            stats[s] = { id: s, nome: db.grupos[g].nomes[s], p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, fp: 0 };
        });
    });

    db.jogos.forEach(jogo => {
        if (jogo.g1 !== "" && jogo.g2 !== "") {
            let res1 = parseInt(jogo.g1), res2 = parseInt(jogo.g2);
            let t1 = stats[jogo.t1], t2 = stats[jogo.t2];
            
            t1.j++; t2.j++; 
            t1.gp += res1; t2.gp += res2;
            t1.gc += res2; t2.gc += res1;

            if (res1 > res2) { t1.p += 3; t1.v++; t2.d++; } 
            else if (res2 > res1) { t2.p += 3; t2.v++; t1.d++; } 
            else { t1.p += 1; t2.p += 1; t1.e++; t2.e++; }

            t1.sg = t1.gp - t1.gc;
            t2.sg = t2.gp - t2.gc;

            let am1 = parseInt(jogo.c_am1) || 0;
            let vm1 = parseInt(jogo.c_vm1) || 0;
            let am2 = parseInt(jogo.c_am2) || 0;
            let vm2 = parseInt(jogo.c_vm2) || 0;

            t1.fp += (am1 * 1) + (vm1 * 4);
            t2.fp += (am2 * 1) + (vm2 * 4);
        }
    });

    renderizarGrupos(stats);
    atualizarMataMata(stats);
    
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
        let sels = db.grupos[gId].selecoes.map(s => stats[s]).sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp || a.fp - b.fp);
        
        let html = `
        <div class="grupo-card">
            <h3 style="text-align: center;">Grupo ${gId}</h3>
            <table>
                <tr>
                    <th class="txt-l">Time</th>
                    <th>Pts</th>
                    <th>PJ</th>
                    <th>VIT</th>
                    <th>E</th>
                    <th>DER</th>
                    <th>GM</th>
                    <th>GC</th>
                    <th>SG</th>
                </tr>`;

        sels.forEach(s => {
            html += `
                <tr>
                    <td>${s.nome}</td>
                    <td style="font-weight: bold;">${s.p}</td>
                    <td>${s.j}</td>
                    <td>${s.v}</td>
                    <td>${s.e}</td>
                    <td>${s.d}</td>
                    <td>${s.gp}</td>
                    <td>${s.gc}</td>
                    <td style="font-weight: bold; color: ${s.sg > 0 ? '#2f855a' : s.sg < 0 ? '#c53030' : '#4a5568'};">${s.sg > 0 ? '+' + s.sg : s.sg}</td>
                </tr>`;
        });
        
        html += `</table><div class="jogos-lista">`;

        db.jogos.filter(j => j.g === gId).forEach(j => {
            let idxOriginal = db.jogos.findIndex(jo => jo.id === j.id);
            let campo1 = gerarCampoPlacar('grupo', idxOriginal, 'g1', j.g1, false);
            let campo2 = gerarCampoPlacar('grupo', idxOriginal, 'g2', j.g2, false);

            // Valores de cartões para a lista de grupos
            let cam1 = j.c_am1 ?? "";
            let cvm1 = j.c_vm1 ?? "";
            let cam2 = j.c_am2 ?? "";
            let cvm2 = j.c_vm2 ?? "";

            let htmlCartoesGrupo = "";
            if (isAdminLogado) {
                htmlCartoesGrupo = `
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75rem; background: #f7fafc; padding: 4px; border-radius: 4px; width: 100%;">
                    <div style="display: flex; gap: 4px; align-items: center;">
                        🟥<input type="number" min="0" placeholder="0" value="${cvm1}" style="width:35px;" oninput="validarEAtualizarPlacarGeral('grupo', ${idxOriginal}, 'c_vm1', this.value)">
                        🟨<input type="number" min="0" placeholder="0" value="${cam1}" style="width:35px;" oninput="validarEAtualizarPlacarGeral('grupo', ${idxOriginal}, 'c_am1', this.value)">
                    </div>
                    <div style="display: flex; gap: 4px; align-items: center;">
                        <input type="number" min="0" placeholder="0" value="${cam2}" style="width:35px;" oninput="validarEAtualizarPlacarGeral('grupo', ${idxOriginal}, 'c_am2', this.value)">🟨
                        <input type="number" min="0" placeholder="0" value="${cvm2}" style="width:35px;" oninput="validarEAtualizarPlacarGeral('grupo', ${idxOriginal}, 'c_vm2', this.value)">🟥
                    </div>
                </div>`;
            } else {
                if (cam1 || cvm1 || cam2 || cvm2) {
                    htmlCartoesGrupo = `
                    <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.75rem; color: #4a5568; width: 96%; padding: 0 2px;">
                        <div>${cvm1 ? `🟥 ${cvm1}` : ''} ${cam1 ? `🟨 ${cam1}` : ''}</div>
                        <div>${cam2 ? `${cam2} 🟨` : ''} ${cvm2 ? `${cvm2} 🟥` : ''}</div>
                    </div>`;
                }
            }

            html += `<div class="jogo-item" style="display: flex; flex-direction: column; align-items: center;">
            <div class="jogo-meta">${j.data}</div>
            <div class="placar" style="width: 100%;">
                <span class="time-flag-right">${db.grupos[gId].nomes[j.t1]}</span>
                ${campo1} ${campo2}
                <span class="time-flag-left">${db.grupos[gId].nomes[j.t2]}</span>
            </div>
            ${htmlCartoesGrupo}
            ${gerarLinkTransmissao(j.liveUrl, 'grupo', idxOriginal)}</div>`;
        });
        container.innerHTML += html + `</div></div>`;
    });
}

function atualizarMataMata(stats) {
    let rankGeral = [];
    
    // Garante que os grupos sejam processados estritamente na ordem alfabética (A até L)
    Object.keys(db.grupos)
        .sort((a, b) => a.localeCompare(b))
        .forEach(gId => {
            let ordenados = db.grupos[gId].selecoes
                .map(s => stats[s])
                .sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp || a.fp - b.fp);
            
            rankGeral.push({ 
                grupo: gId, 
                primeiro: ordenados[0], 
                segundo: ordenados[1], 
                terceiro: ordenados[2] 
            });
        });

    // Filtra e ordena todos os 12 terceiros lugares para descobrir os 8 melhores globais
    let melhores3Globais = rankGeral
        .map(r => r.terceiro)
        .filter(t => t !== undefined) // Evita quebra se o grupo não tiver 3 times populados
        .sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp || a.fp - b.fp)
        .slice(0, 8);

    // Lista clonada para podermos consumir os times sem repetir no mata-mata
    let terceirosDisponiveis = [...melhores3Globais];

    // Função interna para pescar o melhor terceiro permitido para aquele confronto específico
    function obterTerceiroPermitido(gruposPermitidos) {
        let idx = terceirosDisponiveis.findIndex(t => gruposPermitidos.includes(t.grupo));
        if (idx !== -1) {
            return terceirosDisponiveis.splice(idx, 1)[0];
        }
        return null;
    }

    // Buscando os terceiros específicos para cada jogo conforme sua regra oficial
    let t_jogo74 = obterTerceiroPermitido(['A', 'B', 'C', 'D', 'F']);
    let t_jogo77 = obterTerceiroPermitido(['C', 'D', 'F', 'G', 'H']);
    let t_jogo79 = obterTerceiroPermitido(['C', 'E', 'F', 'H', 'I']);
    let t_jogo80 = obterTerceiroPermitido(['E', 'H', 'I', 'J', 'K']);
    let t_jogo81 = obterTerceiroPermitido(['B', 'E', 'F', 'I', 'J']);
    let t_jogo82 = obterTerceiroPermitido(['A', 'E', 'H', 'I', 'J']);
    let t_jogo85 = obterTerceiroPermitido(['E', 'F', 'G', 'I', 'J']);
    let t_jogo87 = obterTerceiroPermitido(['D', 'E', 'I', 'J', 'L']);

    if (!db.mata32[0].t1 || db.mata32[0].t1 === "❓") db.mata32[0].t1 = rankGeral[0].segundo.nome;
    if (!db.mata32[0].t2 || db.mata32[0].t2 === "❓") db.mata32[0].t2 = rankGeral[1].segundo.nome;

    // J74: 1ºE x 3º(A/B/C/D/F)
    if (!db.mata32[1].t1 || db.mata32[1].t1 === "❓") db.mata32[1].t1 = rankGeral[4].primeiro.nome;
    if (!db.mata32[1].t2 || db.mata32[1].t2 === "❓") db.mata32[1].t2 = t_jogo74 ? t_jogo74.nome : "❓";

    // J75: 1ºF x 2ºC
    if (!db.mata32[2].t1 || db.mata32[2].t1 === "❓") db.mata32[2].t1 = rankGeral[5].primeiro.nome;
    if (!db.mata32[2].t2 || db.mata32[2].t2 === "❓") db.mata32[2].t2 = rankGeral[2].segundo.nome;

    // J76: 1ºC x 2ºF (O jogo que você mencionou!)
    if (!db.mata32[3].t1 || db.mata32[3].t1 === "❓") db.mata32[3].t1 = rankGeral[2].primeiro.nome; // 1ºC
    if (!db.mata32[3].t2 || db.mata32[3].t2 === "❓") db.mata32[3].t2 = rankGeral[5].segundo.nome;  // 2ºF

    // J77: 1ºI x 3º(C/D/F/G/H)
    if (!db.mata32[4].t1 || db.mata32[4].t1 === "❓") db.mata32[4].t1 = rankGeral[8].primeiro.nome;
    if (!db.mata32[4].t2 || db.mata32[4].t2 === "❓") db.mata32[4].t2 = t_jogo77 ? t_jogo77.nome : "❓";

    // J78: 2ºE x 2ºI
    if (!db.mata32[5].t1 || db.mata32[5].t1 === "❓") db.mata32[5].t1 = rankGeral[4].segundo.nome;
    if (!db.mata32[5].t2 || db.mata32[5].t2 === "❓") db.mata32[5].t2 = rankGeral[8].segundo.nome;

    // J79: 1ºA x 3º(C/E/F/H/I)
    if (!db.mata32[6].t1 || db.mata32[6].t1 === "❓") db.mata32[6].t1 = rankGeral[0].primeiro.nome;
    if (!db.mata32[6].t2 || db.mata32[6].t2 === "❓") db.mata32[6].t2 = t_jogo79 ? t_jogo79.nome : "❓";

    // J80: 1ºL x 3º(E/H/I/J/K)
    if (!db.mata32[7].t1 || db.mata32[7].t1 === "❓") db.mata32[7].t1 = rankGeral[11].primeiro.nome;
    if (!db.mata32[7].t2 || db.mata32[7].t2 === "❓") db.mata32[7].t2 = t_jogo80 ? t_jogo80.nome : "❓";

    // J81: 1ºD x 3º(B/E/F/I/J)
    if (!db.mata32[8].t1 || db.mata32[8].t1 === "❓") db.mata32[8].t1 = rankGeral[3].primeiro.nome;
    if (!db.mata32[8].t2 || db.mata32[8].t2 === "❓") db.mata32[8].t2 = t_jogo81 ? t_jogo81.nome : "❓";

    // J82: 1ºG x 3º(A/E/H/I/J)
    if (!db.mata32[9].t1 || db.mata32[9].t1 === "❓") db.mata32[9].t1 = rankGeral[6].primeiro.nome;
    if (!db.mata32[9].t2 || db.mata32[9].t2 === "❓") db.mata32[9].t2 = t_jogo82 ? t_jogo82.nome : "❓";

    // J83: 2ºK x 2ºL
    if (!db.mata32[10].t1 || db.mata32[10].t1 === "❓") db.mata32[10].t1 = rankGeral[10].segundo.nome;
    if (!db.mata32[10].t2 || db.mata32[10].t2 === "❓") db.mata32[10].t2 = rankGeral[11].segundo.nome;

    // J84: 1ºH x 2ºJ
    if (!db.mata32[11].t1 || db.mata32[11].t1 === "❓") db.mata32[11].t1 = rankGeral[7].primeiro.nome;
    if (!db.mata32[11].t2 || db.mata32[11].t2 === "❓") db.mata32[11].t2 = rankGeral[9].segundo.nome;

    // J85: 1ºB x 3º(E/F/G/I/J)
    if (!db.mata32[12].t1 || db.mata32[12].t1 === "❓") db.mata32[12].t1 = rankGeral[1].primeiro.nome;
    if (!db.mata32[12].t2 || db.mata32[12].t2 === "❓") db.mata32[12].t2 = t_jogo85 ? t_jogo85.nome : "❓";

    // J86: 1ºJ x 2ºH
    if (!db.mata32[13].t1 || db.mata32[13].t1 === "❓") db.mata32[13].t1 = rankGeral[9].primeiro.nome;
    if (!db.mata32[13].t2 || db.mata32[13].t2 === "❓") db.mata32[13].t2 = rankGeral[7].segundo.nome;

    // J87: 1ºK x 3º(D/E/I/J/L)
    if (!db.mata32[14].t1 || db.mata32[14].t1 === "❓") db.mata32[14].t1 = rankGeral[10].primeiro.nome;
    if (!db.mata32[14].t2 || db.mata32[14].t2 === "❓") db.mata32[14].t2 = t_jogo87 ? t_jogo87.nome : "❓";

    // J88: 2ºD x 2ºG
    if (!db.mata32[15].t1 || db.mata32[15].t1 === "❓") db.mata32[15].t1 = rankGeral[3].segundo.nome;
    if (!db.mata32[15].t2 || db.mata32[15].t2 === "❓") db.mata32[15].t2 = rankGeral[6].segundo.nome;

    renderMataGenerico('container-32avos', db.mata32, 'mata32');

    // === PROGRESSÃO AUTOMÁTICA DOS VENCEDORES (Oitavas, Quartas, Semis e Finais) ===
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
    destino.forEach((jogo, idx) => {
        let j1 = origem.find(o => o.id === jogo.j1);
        let j2 = origem.find(o => o.id === jogo.j2);
        
        if (!jogo.t1 || jogo.t1 === "❓") {
            if (j1 && j1.g1 !== "" && j1.g2 !== "" && j1.g1 !== j1.g2) {
                jogo.t1 = parseInt(j1.g1) > parseInt(j1.g2) ? j1.t1 : j1.t2;
            } else { jogo.t1 = "❓"; }
        }
        
        if (!jogo.t2 || jogo.t2 === "❓") {
            if (j2 && j2.g1 !== "" && j2.g2 !== "" && j2.g1 !== j2.g2) {
                jogo.t2 = parseInt(j2.g1) > parseInt(j2.g2) ? j2.t1 : j2.t2;
            } else { jogo.t2 = "❓"; }
        }
    });
}

function renderMataGenerico(containerId, lista, tipo) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    lista.forEach(j => {
        let idx = lista.indexOf(j);
        let desabilitado = (!j.t1 || !j.t2 || j.t1 === "❓" || j.t2 === "❓");
        let campo1 = gerarCampoPlacar(tipo, idx, 'g1', j.g1, desabilitado);
        let campo2 = gerarCampoPlacar(tipo, idx, 'g2', j.g2, desabilitado);

        // Inputs de texto para o Admin gerenciar os nomes dos times
        let displayT1, displayT2;
        if (isAdminLogado) {
            displayT1 = `<input type="text" value="${j.t1 && j.t1 !== '❓' ? j.t1 : ''}" placeholder="❓ Time 1" style="width: 110px; text-align: center; font-size: 0.85rem;" onchange="atualizarNomeTimeMata('${tipo}', ${idx}, 't1', this.value)">`;
            displayT2 = `<input type="text" value="${j.t2 && j.t2 !== '❓' ? j.t2 : ''}" placeholder="❓ Time 2" style="width: 110px; text-align: center; font-size: 0.85rem;" onchange="atualizarNomeTimeMata('${tipo}', ${idx}, 't2', this.value)">`;
        } else {
            displayT1 = j.t1 || '<i>❓</i>';
            displayT2 = j.t2 || '<i>❓</i>';
        }

        // Recupera os valores de cartões salvos no banco (ou inicia vazio se não existirem)
        let cam1 = j.c_am1 ?? "";
        let cvm1 = j.c_vm1 ?? "";
        let cam2 = j.c_am2 ?? "";
        let cvm2 = j.c_vm2 ?? "";

        // Monta a estrutura HTML dos cartões para o mata-mata
        let htmlCartoesMata = "";
        if (isAdminLogado) {
            htmlCartoesMata = `
            <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75rem; background: #f7fafc; padding: 4px; border-radius: 4px; width: 100%;">
                <div style="display: flex; gap: 4px; align-items: center;">
                    🟥<input type="number" min="0" placeholder="0" value="${cvm1}" style="width:35px;" oninput="validarEAtualizarPlacarGeral('${tipo}', ${idx}, 'c_vm1', this.value)">
                    🟨<input type="number" min="0" placeholder="0" value="${cam1}" style="width:35px;" oninput="validarEAtualizarPlacarGeral('${tipo}', ${idx}, 'c_am1', this.value)">
                </div>
                <div style="display: flex; gap: 4px; align-items: center;">
                    <input type="number" min="0" placeholder="0" value="${cam2}" style="width:35px;" oninput="validarEAtualizarPlacarGeral('${tipo}', ${idx}, 'c_am2', this.value)">🟨
                    <input type="number" min="0" placeholder="0" value="${cvm2}" style="width:35px;" oninput="validarEAtualizarPlacarGeral('${tipo}', ${idx}, 'c_vm2', this.value)">🟥
                </div>
            </div>`;
        } else {
            if (cam1 || cvm1 || cam2 || cvm2) {
                htmlCartoesMata = `
                <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.75rem; color: #4a5568; width: 96%; padding: 0 2px;">
                    <div>${cvm1 ? `🟥 ${cvm1}` : ''} ${cam1 ? `🟨 ${cam1}` : ''}</div>
                    <div>${cam2 ? `${cam2} 🟨` : ''} ${cvm2 ? `${cvm2} 🟥` : ''}</div>
                </div>`;
            }
        }

        el.innerHTML += `<div class="jogo-item" style="display: flex; flex-direction: column; align-items: center;">
            <div class="jogo-meta"><b>${j.label}</b><br></div>
            <div class="placar" style="width: 100%;">
                <span class="time-flag-right">${displayT1}</span>
                ${campo1} ${campo2}
                <span class="time-flag-left">${displayT2}</span>
            </div>
            ${htmlCartoesMata}
            ${gerarLinkTransmissao(j.liveUrl, tipo, idx)} 
        </div>`;
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

    db.jogos.forEach(j => {
        if (j.data) {
            let match = j.data.match(/\d{2}\/\d{2}/);
            if (match && !datasUnicas.includes(match[0])) datasUnicas.push(match[0]);
        }
    });

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

    if (db.finais && db.finais.terceiro && db.finais.terceiro.label) {
        let matchT = db.finais.terceiro.label.match(/\d{2}\/\d{2}/);
        if (matchT && !datasUnicas.includes(matchT[0])) datasUnicas.push(matchT[0]);
    }
    if (db.finais && db.finais.final && db.finais.final.label) {
        let matchF = db.finais.final.label.match(/\d{2}\/\d{2}/);
        if (matchF && !datasUnicas.includes(matchF[0])) datasUnicas.push(matchF[0]);
    }

    datasUnicas.sort((a, b) => {
        let [diaA, mesA] = a.split('/');
        let [diaB, mesB] = b.split('/');
        return `${mesA}${diaA}`.localeCompare(`${mesB}${diaB}`);
    });

    select.innerHTML = datasUnicas.map(d => `<option value="${d}">Dia ${d}</option>`).join('');

    const hoje = new Date();
    const diaFormated = String(hoje.getDate()).padStart(2, '0');
    const mesFormated = String(hoje.getMonth() + 1).padStart(2, '0');
    const dataAtualString = `${diaFormated}/${mesFormated}`;

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

        html += criarCardJogoDia('grupo', idxOriginal, rotulo, emojiT1, emojiT2, j.g1, j.g2, dataSelecionada, j.liveUrl);
    });

    const fases = [
        { chave: 'mata32', titulo: 'Fase de 32' },
        { chave: 'oitavas', titulo: 'Oitavas de Final' },
        { chave: 'quartas', titulo: 'Quartas de Final' },
        { chave: 'semis', titulo: 'Semifinal' }
    ];

    fases.forEach(fase => {
        db[fase.chave].filter(j => j.label && j.label.includes(dataSelecionada)).forEach(j => {
            let idxOriginal = db[fase.chave].findIndex(jo => jo.id === j.id);
            let rotulo = `${fase.titulo} - ${j.label.split(' - ')[1] || j.label}`;
            html += criarCardJogoDia(fase.chave, idxOriginal, rotulo, j.t1, j.t2, j.g1, j.g2, dataSelecionada, j.liveUrl);
        });
    });

    if (db.finais && db.finais.terceiro && db.finais.terceiro.label && db.finais.terceiro.label.includes(dataSelecionada)) {
        let j = db.finais.terceiro;
        html += criarCardJogoDia('terceiro', 0, `Disputa do 3º Lugar`, j.t1, j.t2, j.g1, j.g2, dataSelecionada, j.liveUrl);
    }
    if (db.finais && db.finais.final && db.finais.final.label && db.finais.final.label.includes(dataSelecionada)) {
        let j = db.finais.final;
        html += criarCardJogoDia('final', 0, `Grande FINAL`, j.t1, j.t2, j.g1, j.g2, dataSelecionada, j.liveUrl);
    }

    if (html === "") {
        container.innerHTML = `<p style="text-align: center; color: #666; width: 100%; grid-column: 1/-1;">Nenhum jogo agendado para este dia.</p>`;
    } else {
        container.innerHTML = html;
    }
}

function criarCardJogoDia(tipoOrigem, index, label, t1, t2, g1, g2, dataSelecionada, liveUrl = "") {
    let nomeT1 = t1 || '<i>❓</i>';
    let nomeT2 = t2 || '<i>❓</i>';
    let desabilitado = (!t1 || !t2 || t1.includes("❓") || t2.includes("❓"));

    let jogoAtual;
    if (tipoOrigem === 'grupo') jogoAtual = db.jogos[index];
    else if (tipoOrigem === 'final') jogoAtual = db.finais.final;
    else if (tipoOrigem === 'terceiro') jogoAtual = db.finais.terceiro;
    else jogoAtual = db[tipoOrigem] ? db[tipoOrigem][index] : null;

    let cam1 = jogoAtual?.c_am1 ?? "";
    let cvm1 = jogoAtual?.c_vm1 ?? "";
    let cam2 = jogoAtual?.c_am2 ?? "";
    let cvm2 = jogoAtual?.c_vm2 ?? "";

    let campo1 = gerarCampoPlacar(tipoOrigem, index, 'g1', g1, desabilitado, dataSelecionada);
    let campo2 = gerarCampoPlacar(tipoOrigem, index, 'g2', g2, desabilitado, dataSelecionada);

    let htmlCartoes = "";
    if (isAdminLogado) {
        htmlCartoes = `
        <div class="admin-cards-container" style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.8rem; background: #f7fafc; padding: 6px; border-radius: 4px;">
            <div style="display: flex; gap: 4px; align-items: center;">
                🟥<input type="number" min="0" placeholder="0" value="${cvm1}" style="width: 35px; padding: 2px;" oninput="validarEAtualizarPlacarGeral('${tipoOrigem}', ${index}, 'c_vm1', this.value); if('${dataSelecionada}'!=='') renderizarJogosDoDia('${dataSelecionada}')">
                🟨<input type="number" min="0" placeholder="0" value="${cam1}" style="width: 35px; padding: 2px;" oninput="validarEAtualizarPlacarGeral('${tipoOrigem}', ${index}, 'c_am1', this.value); if('${dataSelecionada}'!=='') renderizarJogosDoDia('${dataSelecionada}')">
            </div>
            <div style="display: flex; gap: 4px; align-items: center;">
                <input type="number" min="0" placeholder="0" value="${cam2}" style="width: 35px; padding: 2px;" oninput="validarEAtualizarPlacarGeral('${tipoOrigem}', ${index}, 'c_am2', this.value); if('${dataSelecionada}'!=='') renderizarJogosDoDia('${dataSelecionada}')">🟨
                <input type="number" min="0" placeholder="0" value="${cvm2}" style="width: 35px; padding: 2px;" oninput="validarEAtualizarPlacarGeral('${tipoOrigem}', ${index}, 'c_vm2', this.value); if('${dataSelecionada}'!=='') renderizarJogosDoDia('${dataSelecionada}')">🟥
            </div>
        </div>`;
    } else {
        if (cam1 || cvm1 || cam2 || cvm2) {
            htmlCartoes = `
            <div class="visitor-cards-container" style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.8rem; color: #4a5568; padding: 0 4px;">
                <div>
                    ${cvm1 ? `🟥 ${cvm1}` : ''} ${cam1 ? `🟨 ${cam1}` : ''}
                </div>
                <div>
                    ${cam2 ? `${cam2} 🟨` : ''} ${cvm2 ? `${cvm2} 🟥` : ''}
                </div>
            </div>`;
        }
    }

    return `
    <div class="jogo-item" style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div class="jogo-meta" style="font-weight: bold; color: var(--primary); margin-bottom: 10px;">${label}</div>
        <div class="placar">
            <span class="time-flag-right">${nomeT1}</span>
            ${campo1} ${campo2}
            <span class="time-flag-left">${nomeT2}</span>
        </div>
        ${htmlCartoes}
        ${gerarLinkTransmissao(liveUrl, tipoOrigem, index)}
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

    rtdb.ref('copa26_dados').set(db);
}

function gerarLinkTransmissao(url, tipoOrigem, index) {
    let administrador = typeof isAdminLogado !== 'undefined' ? isAdminLogado : false;
    const urlValida = url || "";

    if (administrador) {
        return `
            <div class="admin-live-container" style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #ccc; display: flex; gap: 5px; width: 100%;">
                <input type="text" 
                       placeholder="Colar link aqui..."
                       value="${urlValida}" 
                       style="font-size: 0.75rem; padding: 5px; flex: 1; border: 1px solid #a0aec0; border-radius: 4px; background: #f7fafc; color: #2d3748;"
                       onchange="salvarLinkLiveDirect('${tipoOrigem}', ${index}, this.value)">
            </div>
        `;
    } else {
        if (urlValida.trim() === "") return "";
        return `
            <div class="transmissao-link" style="text-align: center; margin-top: 10px; width: 100%;">
                <a href="${urlValida}" target="_blank" rel="noopener noreferrer" style="color: #e53e3e; font-size: 0.85rem; font-weight: bold; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border: 1px solid #fed7d7; border-radius: 4px; background: #fff5f5;">
                    📺 Assistir ao Vivo
                </a>
            </div>
        `;
    }
}

function salvarLinkLiveDirect(tipoOrigem, index, novaUrl) {
    if (tipoOrigem === 'grupo') {
        if (!db.jogos[index]) return;
        db.jogos[index].liveUrl = novaUrl.trim();
    } else if (tipoOrigem === 'terceiro') {
        if (!db.finais || !db.finais.terceiro) return;
        db.finais.terceiro.liveUrl = novaUrl.trim();
    } else if (tipoOrigem === 'final') {
        if (!db.finais || !db.finais.final) return;
        db.finais.final.liveUrl = novaUrl.trim();
    } else {
        if (!db[tipoOrigem] || !db[tipoOrigem][index]) return;
        db[tipoOrigem][index].liveUrl = novaUrl.trim();
    }

    if (typeof rtdb !== 'undefined' && rtdb.ref) {
        rtdb.ref('copa26_dados').set(db)
            .then(() => { console.log("Link da live atualizado com sucesso!"); })
            .catch((error) => { console.error("Erro ao salvar link:", error); });
    }
}

function atualizarNomeTimeMata(tipo, idx, campo, valor) {
    let valorFormatado = valor.trim() === "" ? "❓" : valor.trim();
    
    if (tipo === 'final') {
        db.finais.final[campo] = valorFormatado;
    } else if (tipo === 'terceiro') {
        db.finais.terceiro[campo] = valorFormatado;
    } else {
        if (!db[tipo]) db[tipo] = [];
        if (!db[tipo][idx]) db[tipo][idx] = {};
        db[tipo][idx][campo] = valorFormatado;
    }
    
    // Salva no banco. O Realtime Sync vai se encarregar de reprocessar a tela
    rtdb.ref('copa26_dados').set(db);
}

function atualizarLinkLive(origem, idx, url) {
    if (origem === 'grupo') {
        db.jogos[idx].liveUrl = url;
    } else {
        db[origem][idx].liveUrl = url;
    }
    rtdb.ref('copa26_dados').set(db);
}