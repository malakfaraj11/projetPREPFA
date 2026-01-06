const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const port = 3001;
require("dotenv").config();

const { User, Booking, Job } = require("./models/Schemas");

const app = express();
app.use(express.json());
// Middlewares


// =============================
// 🔗 CONNEXION MONGO
// =============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.error("❌ Erreur MongoDB:", err));


// =============================
// 🧍‍♀️ AUTH : INSCRIPTION
// =============================
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Champs obligatoires
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires"
      });
    }

    // Vérifier si email existe déjà
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé"
      });
    }

    // Hash mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création utilisateur
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });

    // Ne pas retourner le mot de passe
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "Inscription réussie",
      user: userResponse
    });

  } catch (err) {
    console.error("Erreur inscription:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur interne lors de l'inscription"
    });
  }
});


// =============================
// 🔐 AUTH : CONNEXION
// =============================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe obligatoires"
      });
    }

    // Recherche utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    // Vérification mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    // Nettoyage
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
      user: userResponse
    });

  } catch (err) {
    console.error("Erreur connexion:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur interne lors de la connexion"
    });
  }
});



// =============================
// 👥 API UTILISATEURS
// =============================
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json({
      success: true,
      users
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs"
    });
  }
});


// =============================
// 🌍 ROUTE FRONT
// =============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


// =============================
// 🚀 LANCEMENT SERVEUR
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
