# 🛠️ Home Services Booking Platform (MERN Stack)

Plateforme web permettant à n’importe quel utilisateur de **réserver un prestataire à domicile** (femme de ménage, plombier, serrurier, coiffeur, etc.) à une **date et heure précises**.

> Exemple : *Je veux un serrurier demain à 14h* → je choisis **Serrurier**, je vois les prestataires disponibles, je réserve.

---

## 🚀 Fonctionnalités principales

### 👤 Côté Client

* Inscription / Connexion
* Choix d’un métier
* Liste des prestataires disponibles
* Consultation du profil prestataire
* Réservation par date & heure
* Paiement en ligne
* Historique des réservations
* Avis et notation

### 👷 Côté Prestataire

* Inscription en tant que prestataire
* Création d’un profil professionnel
* Définition du métier et des tarifs
* Gestion des disponibilités (planning)
* Réception et gestion des réservations

### 🧑‍💼 Côté Admin

* Gestion des utilisateurs
* Validation des prestataires
* Gestion des métiers
* Suivi des réservations
* Statistiques

---

## 🧱 Stack technique (MERN)

### Frontend

* React.js
* React Router
* Axios
* Tailwind CSS / MUI
* FullCalendar
* Google Maps / Mapbox

### Backend

* Node.js
* Express.js
* JWT Authentication
* Stripe (paiement)
* Nodemailer (emails)

### Base de données

* MongoDB
* Mongoose

---

## 📂 Structure du projet

```
home-services-booking/
│
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── routes/
│   └── package.json
│
├── server/                 # Backend Express
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middlewares/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── package.json
│
└── README.md
```

---

## 🗄️ Modèles MongoDB (Core)

### User

* role: client | provider | admin
* email / password
* téléphone, adresse, localisation

### Service (Métier)

* nom (plombier, serrurier, etc.)
* icône

### ProviderProfile

* utilisateur lié
* métier
* description
* prix/heure
* disponibilités
* note

### Booking

* client
* prestataire
* date / heure
* statut
* paiement

### Review

* réservation
* note
* commentaire

---

## 🔐 Authentification

* Hash des mots de passe avec **bcrypt**
* Authentification via **JWT**
* Middleware de protection des routes
* Gestion des rôles (client / prestataire / admin)

---

## 🔁 API (exemples)

### Auth

```
POST /api/auth/register
POST /api/auth/login
```

### Services

```
GET /api/services
POST /api/services (admin)
```

### Prestataires

```
GET /api/providers?serviceId=
GET /api/providers/:id
```

### Réservations

```
POST /api/bookings
GET /api/bookings/me
```

---

## 💳 Paiement

* Intégration Stripe
* Paiement sécurisé
* Liaison paiement ↔ réservation
* Facturation

---

## 🧪 Tests & Qualité

* Validation backend
* Gestion des erreurs
* Logs
* Tests unitaires (optionnel MVP)

---

## 🌍 Déploiement

* Frontend : Vercel / Netlify
* Backend : Render / Railway
* MongoDB : MongoDB Atlas

---

## 📈 Roadmap

* Géolocalisation avancée
* Notifications push
* Chat client / prestataire
* Abonnement prestataires
* Application mobile

---

## 👨‍💻 Lancement du projet

### Backend

```
cd server
npm install
npm run dev
```

### Frontend

```
cd client
npm install
npm start
```

---

## 📜 Licence

Projet open-source – usage pédagogique et professionnel.

---

✨ Projet MERN conçu pour être **scalable**, **modulaire** et **orienté business**.
