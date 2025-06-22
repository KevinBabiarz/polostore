import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import sequelize, { testConnection } from "./config/sequelize.js";
import authRoutes from "./routes/authRoutes.js";
import productionRoutes from "./routes/productionRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import createTables from "./config/initDb.js";

// Importer tous les modèles pour s'assurer qu'ils sont enregistrés
import "./models/User.js";
import "./models/Production.js";
import "./models/ContactMessage.js";
import "./models/Favorite.js";

dotenv.config({'path': './utils/.env'});

// Afficher les variables d'environnement de base de données pour débogage
console.log("Variables d'environnement DB:", {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

// Initialiser l'application Express
const app = express();
const port = 5050;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration CORS étendue pour garantir l'accès depuis le frontend
app.use(cors({
  origin: '*',  // Permettre l'accès depuis n'importe quelle origine en développement
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Mettre en cache les préflight pour 24 heures
}));

// Configuration de sécurité avec Helmet
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Augmenter la taille limite des requêtes pour éviter les problèmes avec les uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Créer le dossier uploads s'il n'existe pas
const dir = './public/uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Middleware pour déboguer les requêtes
app.use((req, res, next) => {
  if (!req.path.startsWith('/uploads/')) {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
});

// Initialiser la base de données
const initializeDatabase = async () => {
  try {
    console.log('--- INITIALISATION DB ---');
    await testConnection();
    console.log("Connexion PostgreSQL établie avec succès");

    await sequelize.sync({ force: false });
    console.log('Modèles Sequelize synchronisés avec la base de données');

    await createTables();
    console.log('Tables créées avec succès');

    return true;
  } catch (err) {
    console.error("Erreur d'initialisation de la base de données:", err);
    throw err;
  }
};

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/productions", productionRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// Route de diagnostic pour vérifier la connexion à PostgreSQL
app.get("/api/db-status", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "ok",
      message: "Connecté à PostgreSQL",
      dbHost: process.env.DB_HOST,
      dbName: process.env.DB_DATABASE
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Échec de connexion à PostgreSQL",
      error: error.message
    });
  }
});

// Route de test simple
app.get('/test', (req, res) => {
  res.json({ message: 'ok' });
});

// En mode production, servir les fichiers statiques React
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  const clientBuildPath = path.join(__dirname, 'client/build');
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get('/', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    app.get("/", (req, res) => {
      res.send("API pour le site de productions musicales - Mode développement");
    });
  }
}

// Démarrer le serveur après l'initialisation de la base de données
async function startServer() {
  try {
    console.log('--- AVANT INITIALISATION DB ---');
    await initializeDatabase();
    console.log('--- APRES INITIALISATION DB ---');
    app.listen(port, () => {
      console.log(`✅ Serveur démarré avec succès sur le port ${port} en mode ${process.env.NODE_ENV || 'développement'}`);
    });
  } catch (error) {
    console.error("❌ Impossible de démarrer le serveur :", error.message);
    process.exit(1);
  }
}

console.log('--- DEMARRAGE SERVER.JS ---');
startServer();
