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

// Middleware pour analyser le corps des requêtes multipart
import multer from 'multer';
const upload = multer();
app.use((req, res, next) => {
  // Ne pas appliquer multer aux routes qui ont déjà leur propre middleware multer
  if (req.path.startsWith('/api/productions') && (req.method === 'POST' || req.method === 'PUT')) {
    // Ces routes ont leur propre configuration multer
    return next();
  }

  // Appliquer multer.none() pour les autres routes, pour parser les champs form-data mais pas les fichiers
  upload.none()(req, res, next);
});

// Middleware pour déboguer les requêtes
app.use((req, res, next) => {
  if (!req.path.startsWith('/uploads/')) {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
});

// Fonction d'aide pour déterminer le type MIME correct pour les fichiers audio
const getAudioMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.mp3': return 'audio/mpeg';
    case '.wav': return 'audio/wav';
    case '.ogg': return 'audio/ogg';
    case '.flac': return 'audio/flac';
    case '.aac': return 'audio/aac';
    default: return 'application/octet-stream';
  }
};

// Middleware personnalisé pour servir les fichiers statiques avec les en-têtes appropriés
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, 'public/uploads', req.path);

  // Vérifier si le fichier existe
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      console.log(`[STATIC] Fichier non trouvé: ${filePath}`);
      return next();
    }

    // Déterminer le type MIME pour les fichiers audio
    if (req.path.match(/\.(mp3|wav|ogg|flac|aac)$/i)) {
      const mimeType = getAudioMimeType(req.path);
      console.log(`[STATIC] Servir fichier audio: ${req.path}, type MIME: ${mimeType}`);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Accept-Ranges', 'bytes');
    }

    // Servir le fichier
    res.sendFile(filePath);
  });
});

// Configuration améliorée pour les uploads via /api/uploads
app.use('/api/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, 'public/uploads', req.path.replace(/^\/+/, ''));
  console.log(`[API] Tentative d'accès au fichier: ${filePath}`);

  // Vérifier si le fichier existe
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      console.log(`[API] Fichier non trouvé: ${filePath}`);
      return res.status(404).send('Fichier non trouvé');
    }

    // Déterminer le type MIME pour les fichiers audio
    if (req.path.match(/\.(mp3|wav|ogg|flac|aac)$/i)) {
      const mimeType = getAudioMimeType(req.path);
      console.log(`[API] Servir fichier audio via API: ${req.path}, type MIME: ${mimeType}`);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Accept-Ranges', 'bytes');
    }

    // Servir le fichier
    res.sendFile(filePath);
  });
});

// Créer le dossier uploads s'il n'existe pas
const dir = './public/uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

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
}

// Démarrage du serveur
const startServer = async () => {
  try {
    // Initialisation de la base de données
    await initializeDatabase();

    // Démarrage du serveur Express
    app.listen(port, () => {
      console.log(`✅ Serveur démarré avec succès sur le port ${port} en mode ${process.env.NODE_ENV || 'développement'}`);
    });
  } catch (err) {
    console.error("Erreur fatale:", err);
    process.exit(1);
  }
};

startServer();
