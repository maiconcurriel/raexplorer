// Configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  databaseURL: "https://SEU_DOMINIO.firebaseio.com",
  projectId: "SEU_DOMINIO",
  storageBucket: "SEU_DOMINIO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
