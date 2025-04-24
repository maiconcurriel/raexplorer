// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCYzI5tEfdEd1W2Y9TisWZKHe5yR4YTLdg",
  authDomain: "raratingmd.firebaseapp.com",
  databaseURL: "https://raratingmd-default-rtdb.firebaseio.com",
  projectId: "raratingmd",
  storageBucket: "raratingmd.firebasestorage.app",
  messagingSenderId: "532670860158",
  appId: "1:532670860158:web:e372730458dfc7506a812f"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();