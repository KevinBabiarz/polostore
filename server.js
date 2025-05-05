import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import productionRoutes from "./routes/productionRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config({'path': './utils/.env'});

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Créer le dossier uploads s'il n'existe pas
import fs from 'fs';
const dir = './public/uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/productions", productionRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
    res.send("API pour le site de productions musicales");
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});