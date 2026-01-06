// ==========================================
// CONFIGURATION ET DONNÉES
// ==========================================
const names = ["Jean", "Marie", "Lucas", "Sophie", "Thomas", "Léa", "Nicolas", "Chloé", "Antoine", "Emma"];
const cities = ["Paris", "Lyon", "Marseille", "Bordeaux", "Lille", "Nantes", "Strasbourg", "Toulouse"];

const allJobs = [
    "Plombier", "Électricien", "Serrurier", "Peintre", "Maçon", "Menuisier", "Charpentier", "Couvreur", "Carreleur", "Chauffagiste",
    "Femme de ménage", "Nettoyage de vitres", "Repassage", "Garde d'enfants", "Bricolage", "Jardinier",
    "Coiffeur", "Barbier", "Maquilleuse", "Esthéticienne", "Masseur", "Tatoueur", "Coach sportif",
    "Développeur Web", "Dépanneur informatique", "Graphiste", "Photographe", "Expert Cybersécurité",
    "Prof de Maths", "Prof d'Anglais", "Prof de Piano", "Coach de vie",
    "Mécanicien", "Chauffeur Privé", "Livreur", "DJ", "Traiteur", "Magicien",
    "Infirmier", "Ostéopathe", "Vétérinaire", "Pet Sitter", "Avocat", "Comptable"
];

// État de l'application
let currentUser = null;
let providers = [];
let bookings = [];
let users = [];
let jobs = [...allJobs];
let currentRating = 0;
let selectedPro = null;
let currentBookingForRating = null;
let authMode = 'login';
let registerType = null;

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Charger les données
    loadUsers();
    loadBookings();
    loadJobs();
    
    // Vérifier si un utilisateur est connecté
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        initializeApp();
    } else {
        // Afficher la page d'accueil pour les visiteurs non connectés
        showSection('home');
    }
    
    generateProviders();
    updateNav();
});

// ==========================================
// GESTION DE L'AUTHENTIFICATION
// ==========================================
function switchAuthMode(mode) {
    authMode = mode;
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const registerFields = document.getElementById('registerFields');
    const registerTypeSelector = document.getElementById('registerTypeSelector');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authSubmitText = document.getElementById('authSubmitText');
    
    if (mode === 'login') {
        loginTab.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
        loginTab.classList.add('text-white');
        loginTab.classList.remove('text-gray-600');
        registerTab.style.background = '';
        registerTab.classList.remove('text-white');
        registerTab.classList.add('text-gray-600');
        registerFields.classList.add('hidden');
        registerTypeSelector.classList.add('hidden');
        authTitle.textContent = 'Connexion';
        authSubtitle.textContent = 'Accédez à votre compte';
        authSubmitText.textContent = 'Se connecter';
        registerType = null;
    } else {
        registerTab.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
        registerTab.classList.add('text-white');
        registerTab.classList.remove('text-gray-600');
        loginTab.style.background = '';
        loginTab.classList.remove('text-white');
        loginTab.classList.add('text-gray-600');
        registerFields.classList.remove('hidden');
        registerTypeSelector.classList.remove('hidden');
        authTitle.textContent = 'Inscription';
        authSubtitle.textContent = 'Créez votre compte';
        authSubmitText.textContent = 'S\'inscrire';
    }
}

function selectRegisterType(type) {
    registerType = type;
    const buttons = document.querySelectorAll('.register-type-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.register-type-btn').classList.add('active');
}

async function handleAuth(event) {
    event.preventDefault();

    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value.trim();

    if (!email || !password) {
        showToast("Email et mot de passe obligatoires", "error");
        return;
    }

    // =========================
    //        LOGIN
    // =========================
    if (authMode === 'login') {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const text = await response.text();
            console.log("LOGIN RESPONSE =>", response.status, text);

            let result = null;
            try {
                result = JSON.parse(text);
            } catch {
                showToast("Réponse invalide du serveur", "error");
                return;
            }

            if (result.success && result.user) {
                currentUser = result.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showToast("Connexion réussie ✔️", "success");
                // Redirection vers home.html
                setTimeout(() => {
                    window.location.href = '/home.html';
                }, 500);
            } else {
                showToast(result.message || "Identifiants incorrects", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Erreur réseau / serveur", "error");
        }

        return;
    }

    // =========================
    //     INSCRIPTION
    // =========================

    if (!registerType) {
        showToast("Veuillez sélectionner un type de compte", "error");
        return;
    }

    const name = document.getElementById('authName').value.trim();
    const phone = document.getElementById('authPhone').value.trim();

    if (!name || !phone) {
        showToast("Nom et téléphone obligatoires", "error");
        return;
    }

    const userData = {
        name,
        email,
        password,
        phone,
        role: registerType
    };

    console.log("REGISTER PAYLOAD =>", userData);

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const text = await response.text();
        console.log("REGISTER RESPONSE =>", response.status, text);

        let result = null;
        try {
            result = JSON.parse(text);
        } catch {
            showToast("Réponse serveur invalide", "error");
            return;
        }

        if (result.success && result.user) {
            currentUser = result.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast("Inscription réussie ✔️", "success");
            // Redirection vers home.html
            setTimeout(() => {
                window.location.href = '/home.html';
            }, 500);
        } else {
            showToast(result.message || "Erreur d'inscription", "error");
        }

    } catch (err) {
        console.error(err);
        showToast("Erreur lors de l'inscription", "error");
    }
}


function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showSection('auth');
    showToast('Déconnexion réussie', 'info');
}

// ==========================================
// GESTION DES SECTIONS
// ==========================================
function showSection(section) {
    // Masquer toutes les sections
    document.querySelectorAll('[id$="Section"]').forEach(el => el.classList.add('hidden'));
    document.getElementById('authSection').classList.add('hidden');
    
    // Afficher la section demandée
    if (section === 'auth') {
        document.getElementById('authSection').classList.remove('hidden');
    } else {
        document.getElementById(section + 'Section').classList.remove('hidden');
    }
    
    // Charger les données selon la section
    if (section === 'home') {
        filterProviders();
    } else if (section === 'clientAccount') {
        loadClientAccount();
    } else if (section === 'providerHome') {
        loadProviderHome();
    } else if (section === 'providerDashboard') {
        loadProviderDashboard();
    } else if (section === 'admin') {
        loadAdminDashboard();
    } else if (section === 'providerRegister') {
        loadProviderRegisterForm();
    }
}

function initializeApp() {
    if (!currentUser) return;
    
    loadUsers();
    updateNav();
    
    // Cacher la section d'authentification
    document.getElementById('authSection').classList.add('hidden');
    
    // Rediriger selon le rôle
    if (currentUser.role === 'client') {
        showSection('home');
    } else if (currentUser.role === 'provider') {
        showSection('providerHome');
    } else if (currentUser.role === 'admin') {
        showSection('admin');
    } else {
        // Par défaut, rediriger vers l'accueil
        showSection('home');
    }
}

function updateNav() {
    const navButtons = document.getElementById('navButtons');
    if (!currentUser) {
        navButtons.innerHTML = `
            <button onclick="showSection('auth')" class="login-btn">
                <i class="fa-solid fa-right-to-bracket"></i>
                <span>Connexion</span>
            </button>
        `;
        return;
    }
    
    let html = '';
    if (currentUser.role === 'client') {
        html = `
            <button onclick="showSection('home')" class="flex items-center gap-2 font-semibold text-gray-600 transition" style="hover:color: #8b5cf6;" onmouseover="this.style.color='#8b5cf6'" onmouseout="this.style.color='#4b5563'">
                <i class="fa-solid fa-home"></i>
                <span class="hidden md:inline">Accueil</span>
            </button>
            <button onclick="showSection('clientAccount')" class="flex items-center gap-2 font-semibold text-gray-600 transition" style="hover:color: #8b5cf6;" onmouseover="this.style.color='#8b5cf6'" onmouseout="this.style.color='#4b5563'">
                <i class="fa-solid fa-circle-user text-xl"></i>
                <span class="hidden md:inline">Mon Compte</span>
            </button>
        `;
    } else if (currentUser.role === 'provider') {
        html = `
            <button onclick="showSection('providerHome')" class="flex items-center gap-2 font-semibold text-gray-600 transition" style="hover:color: #8b5cf6;" onmouseover="this.style.color='#8b5cf6'" onmouseout="this.style.color='#4b5563'">
                <i class="fa-solid fa-briefcase"></i>
                <span class="hidden md:inline">Mon Espace</span>
            </button>
        `;
    } else if (currentUser.role === 'admin') {
        html = `
            <button onclick="showSection('admin')" class="flex items-center gap-2 font-semibold text-gray-600 transition" style="hover:color: #8b5cf6;" onmouseover="this.style.color='#8b5cf6'" onmouseout="this.style.color='#4b5563'">
                <i class="fa-solid fa-shield-halved"></i>
                <span class="hidden md:inline">Administration</span>
            </button>
        `;
    }
    
    html += `
        <button onclick="logout()" class="flex items-center gap-2 font-semibold text-red-600 hover:text-red-700 transition">
            <i class="fa-solid fa-sign-out"></i>
            <span class="hidden md:inline">Déconnexion</span>
        </button>
    `;
    
    navButtons.innerHTML = html;
}

// ==========================================
// GÉNÉRATION DES DONNÉES
// ==========================================
function generateProviders() {
    providers = [];
    for (let i = 0; i < 50; i++) {
        const jobIndex = i % jobs.length;
        const randomName = names[Math.floor(Math.random() * names.length)] + " " + String.fromCharCode(65 + (i % 26)) + ".";
        
        providers.push({
            id: i,
            name: randomName,
            displayJob: jobs[jobIndex],
            job: jobs[jobIndex].toLowerCase(),
            city: cities[Math.floor(Math.random() * cities.length)],
            price: Math.floor(Math.random() * (120 - 25) + 25),
            rating: (4 + Math.random()).toFixed(1),
            img: `https://i.pravatar.cc/150?u=${i}`,
            verified: Math.random() > 0.5,
            description: `Professionnel expérimenté dans le domaine de ${jobs[jobIndex].toLowerCase()}.`,
            reviews: []
        });
    }
    
    // Ajouter les prestataires inscrits
    const providerUsers = users.filter(u => u.role === 'provider' && u.verified);
    providerUsers.forEach((user, idx) => {
        if (user.job && user.price) {
            providers.push({
                id: 1000 + idx,
                name: user.name,
                displayJob: user.job,
                job: user.job.toLowerCase(),
                city: cities[Math.floor(Math.random() * cities.length)],
                price: user.price,
                rating: user.rating || '4.5',
                img: `https://i.pravatar.cc/150?u=${user.id}`,
                verified: user.verified,
                description: user.description || '',
                reviews: user.reviews || [],
                userId: user.id
            });
        }
    });
}

function loadUsers() {
    const saved = localStorage.getItem('users');
    if (saved) {
        users = JSON.parse(saved);
    } else {
        // Créer un admin par défaut
        users = [{
            id: 0,
            email: 'admin@helpyall.com',
            password: 'admin',
            name: 'Administrateur',
            role: 'admin',
            createdAt: new Date().toISOString()
        }];
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function loadJobs() {
    const saved = localStorage.getItem('jobs');
    if (saved) {
        jobs = JSON.parse(saved);
    } else {
        jobs = [...allJobs];
        localStorage.setItem('jobs', JSON.stringify(jobs));
    }
    updateJobFilters();
}

function updateJobFilters() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    
    filter.innerHTML = '<option value="all">Tous les métiers</option>';
    jobs.forEach(job => {
        filter.innerHTML += `<option value="${job.toLowerCase()}">${job}</option>`;
    });
    
    // Générer les profils de métiers
    renderJobProfiles();
}

// Icônes pour chaque métier
const jobIcons = {
    'plombier': 'fa-wrench',
    'électricien': 'fa-bolt',
    'serrurier': 'fa-key',
    'peintre': 'fa-paint-roller',
    'maçon': 'fa-hammer',
    'menuisier': 'fa-toolbox',
    'charpentier': 'fa-hammer',
    'couvreur': 'fa-home',
    'carreleur': 'fa-th-large',
    'chauffagiste': 'fa-fire',
    'femme de ménage': 'fa-broom',
    'nettoyage de vitres': 'fa-spray-can',
    'repassage': 'fa-tshirt',
    'garde d\'enfants': 'fa-baby',
    'bricolage': 'fa-tools',
    'jardinier': 'fa-seedling',
    'coiffeur': 'fa-cut',
    'barbier': 'fa-scissors',
    'maquilleuse': 'fa-palette',
    'esthéticienne': 'fa-spa',
    'masseur': 'fa-hands',
    'tatoueur': 'fa-pen-fancy',
    'coach sportif': 'fa-dumbbell',
    'développeur web': 'fa-code',
    'dépanneur informatique': 'fa-laptop',
    'graphiste': 'fa-paint-brush',
    'photographe': 'fa-camera',
    'expert cybersécurité': 'fa-shield-alt',
    'prof de maths': 'fa-calculator',
    'prof d\'anglais': 'fa-book',
    'prof de piano': 'fa-music',
    'coach de vie': 'fa-lightbulb',
    'mécanicien': 'fa-car',
    'chauffeur privé': 'fa-taxi',
    'livreur': 'fa-truck',
    'dj': 'fa-headphones',
    'traiteur': 'fa-utensils',
    'magicien': 'fa-magic',
    'infirmier': 'fa-user-nurse',
    'ostéopathe': 'fa-hand-holding-heart',
    'vétérinaire': 'fa-paw',
    'pet sitter': 'fa-dog',
    'avocat': 'fa-gavel',
    'comptable': 'fa-calculator'
};

function getJobIcon(jobName) {
    const key = jobName.toLowerCase();
    return jobIcons[key] || 'fa-briefcase';
}

function renderJobProfiles() {
    const container = document.getElementById('jobsProfiles');
    if (!container) return;
    
    container.innerHTML = jobs.map(job => {
        const icon = getJobIcon(job);
        return `
            <div class="job-card" onclick="filterByJob('${job.toLowerCase()}')">
                <div class="job-card-icon">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <h4 class="job-card-title">${job}</h4>
            </div>
        `;
    }).join('');
    
    // Afficher les catégories populaires
    renderPopularCategories();
}

function renderPopularCategories() {
    const container = document.getElementById('popularCategories');
    if (!container) return;
    
    const popularJobs = ['Plombier', 'Électricien', 'Serrurier', 'Coiffeur', 'Jardinier', 'Femme de ménage'];
    
    container.innerHTML = popularJobs.map(job => `
        <button onclick="filterByJob('${job.toLowerCase()}')" 
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-pink-50 hover:text-pink-700 border border-gray-200 hover:border-pink-200 rounded-full transition-all duration-200">
            ${job}
        </button>
    `).join('');
}

function filterByJob(jobName) {
    // S'assurer qu'on est sur la section home (qui contient la liste des prestataires)
    const homeSection = document.getElementById('homeSection');
    const needToSwitch = homeSection && homeSection.classList.contains('hidden');
    
    if (needToSwitch) {
        showSection('home');
    }
    
    // Attendre que la section soit visible avant de filtrer
    const applyFilter = () => {
        const filter = document.getElementById('categoryFilter');
        if (filter) {
            filter.value = jobName;
            filterProviders();
            
            // Scroller jusqu'à la liste des prestataires pour une meilleure UX
            setTimeout(() => {
                const providerList = document.getElementById('providerList');
                if (providerList) {
                    providerList.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 150);
        }
    };
    
    if (needToSwitch) {
        setTimeout(applyFilter, 100);
    } else {
        applyFilter();
    }
}

// ==========================================
// AFFICHAGE DES PRESTATAIRES
// ==========================================
function renderProviders(data) {
    const listContainer = document.getElementById('providerList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    if (data.length === 0) {
        listContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 py-12">Aucun prestataire trouvé</p>';
        return;
    }

    data.forEach(pro => {
        const badge = pro.verified ? `<span class="ml-2 text-pink-400" title="Vérifié"><i class="fa-solid fa-circle-check"></i></span>` : '';
        
        listContainer.innerHTML += `
            <div class="glass-card rounded-2xl transition-all p-6">
                <div class="flex items-center gap-4 mb-4">
                    <img src="${pro.img}" class="w-16 h-16 rounded-full object-cover border-2 border-gray-100">
                    <div class="flex-1">
                        <h3 class="font-semibold text-lg text-gray-800">${pro.name} ${badge}</h3>
                        <p class="text-sm font-medium text-gray-600">${pro.displayJob}</p>
                        <p class="text-xs text-gray-500 mt-1"><i class="fa-solid fa-location-dot mr-1"></i> ${pro.city}</p>
                    </div>
                </div>
                <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <span class="text-yellow-500 font-semibold">★ ${pro.rating}</span>
                    <span class="font-bold text-xl text-gray-800">${pro.price}€<span class="text-sm text-gray-500 font-normal">/h</span></span>
                </div>
                <div class="flex gap-2">
                    <button onclick="viewProviderProfile(${pro.id})" class="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium transition-colors duration-200">
                        Voir profil
                    </button>
                    <button onclick="openBooking(${pro.id})" class="flex-1 bg-pink-200 hover:bg-pink-300 text-pink-800 py-2.5 rounded-xl font-semibold transition-colors duration-200 shadow-sm">
                    Réserver
                </button>
                </div>
            </div>
        `;
    });
}

function filterProviders() {
    // Permettre aux utilisateurs non connectés de voir les prestataires (mais pas de réserver)
    if (currentUser && currentUser.role !== 'client') return;
    
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const sortBy = document.getElementById('sortFilter')?.value || 'rating';

    let filtered = providers.filter(pro => {
        const matchesSearch = !searchTerm || 
            pro.name.toLowerCase().includes(searchTerm) || 
               pro.displayJob.toLowerCase().includes(searchTerm) || 
               pro.city.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || pro.job === category;
        return matchesSearch && matchesCategory && pro.verified;
    });

    // Tri
    if (sortBy === "priceAsc") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "priceDesc") filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    else if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

    const countElem = document.getElementById('resultCount');
    if (countElem) countElem.textContent = filtered.length;
    
    renderProviders(filtered);
}

// ==========================================
// PROFIL PRESTATAIRE
// ==========================================
function viewProviderProfile(id) {
    const pro = providers.find(p => p.id === id);
    if (!pro) return;
    
    selectedPro = pro;
    
    const section = document.getElementById('providerProfileSection');
    const content = document.getElementById('providerProfileContent');
    
    let reviewsHtml = '';
    if (pro.reviews && pro.reviews.length > 0) {
        reviewsHtml = pro.reviews.map(review => `
            <div class="border-t pt-4 mt-4">
                <div class="flex items-center justify-between mb-2">
                    <p class="font-semibold">${review.clientName}</p>
                    <span class="text-yellow-500">${'★'.repeat(review.rating)}</span>
                </div>
                <p class="text-gray-600 text-sm">${review.comment || ''}</p>
            </div>
        `).join('');
    } else {
        reviewsHtml = '<p class="text-gray-500 text-sm">Aucun avis pour le moment</p>';
    }
    
    content.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6 mb-6">
            <img src="${pro.img}" class="w-32 h-32 rounded-full object-cover border-4 mx-auto md:mx-0" style="border-color: #8b5cf6;">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                    <h2 class="text-3xl font-bold text-gray-800">${pro.name}</h2>
                    ${pro.verified ? '<span class="status-badge verified">Vérifié</span>' : ''}
                </div>
                <p class="text-xl font-bold mb-2" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${pro.displayJob}</p>
                <p class="text-gray-600 mb-4"><i class="fa-solid fa-location-dot mr-2"></i>${pro.city}</p>
                <div class="flex items-center gap-6">
                    <span class="text-yellow-500 font-bold text-xl">★ ${pro.rating}</span>
                    <span class="font-black text-2xl text-gray-900">${pro.price}€<span class="text-sm text-gray-400 font-normal">/h</span></span>
                </div>
            </div>
        </div>
        <div class="mb-6">
            <h3 class="text-xl font-bold mb-2 text-gray-800">Description</h3>
            <p class="text-gray-600">${pro.description || 'Aucune description disponible.'}</p>
        </div>
        <div class="mb-6">
            <h3 class="text-xl font-bold mb-4 text-gray-800">Avis clients</h3>
            ${reviewsHtml}
        </div>
        <button onclick="openBooking(${pro.id})" class="w-full text-white py-4 rounded-xl font-bold transition text-lg" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);" onmouseover="this.style.background='linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'" onmouseout="this.style.background='linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'">
            Réserver maintenant
        </button>
    `;
    
    showSection('providerProfile');
}

// ==========================================
// RÉSERVATION
// ==========================================
function openBooking(id) {
    if (!currentUser || currentUser.role !== 'client') {
        showToast('Veuillez vous connecter en tant que client pour réserver', 'error');
        setTimeout(() => showSection('auth'), 1000);
        return;
    }
    
    selectedPro = providers.find(p => p.id === id);
    if (!selectedPro) return;
    
    document.getElementById('selectedProName').textContent = selectedPro.name;
    document.getElementById('appointmentTime').value = '';
    document.getElementById('appointmentDuration').value = '1';
    updateTotalPrice();
    document.getElementById('bookingModal').classList.remove('hidden');
}

function updateTotalPrice() {
    const duration = parseInt(document.getElementById('appointmentDuration').value) || 1;
    const total = selectedPro.price * duration;
    document.getElementById('totalPrice').textContent = total;
}

function closeModal() {
    document.getElementById('bookingModal').classList.add('hidden');
    document.getElementById('ratingModal').classList.add('hidden');
}

function processPayment() {
    const dateTime = document.getElementById('appointmentTime').value;
    const duration = parseInt(document.getElementById('appointmentDuration').value) || 1;
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVC = document.getElementById('cardCVC').value;
    
    if (!dateTime) {
        showToast('Veuillez sélectionner une date et heure', 'error');
        return;
    }
    
    if (!cardNumber || !cardExpiry || !cardCVC) {
        showToast('Veuillez remplir les informations de paiement', 'error');
        return;
    }
    
    const booking = {
        id: bookings.length,
        clientId: currentUser.id,
        clientName: currentUser.name,
        providerId: selectedPro.id,
        providerName: selectedPro.name,
        providerJob: selectedPro.displayJob,
        dateTime: dateTime,
        duration: duration,
        price: selectedPro.price * duration,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    bookings.push(booking);
    saveBookings();
    
    closeModal();
    showToast('Réservation confirmée !', 'success');
    
    if (currentUser.role === 'client') {
        showSection('clientAccount');
    }
}

// ==========================================
// NOTATION
// ==========================================
function setRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll('#ratingModal .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.style.color = '#fbbf24';
        } else {
            star.classList.remove('active');
            star.style.color = '#d1d5db';
        }
    });
}

function openRatingModal(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    currentBookingForRating = booking;
    currentRating = 0;
    document.getElementById('ratingProName').textContent = booking.providerName;
    document.getElementById('ratingComment').value = '';
    
    const stars = document.querySelectorAll('#ratingModal .star');
    stars.forEach(star => {
        star.classList.remove('active');
        star.style.color = '#d1d5db';
    });
    
    document.getElementById('ratingModal').classList.remove('hidden');
}

function submitRating() {
    if (currentRating === 0) {
        showToast('Veuillez sélectionner une note', 'error');
        return;
    }
    
    const comment = document.getElementById('ratingComment').value;
    const booking = currentBookingForRating;
    
    const review = {
        bookingId: booking.id,
        clientName: booking.clientName,
        rating: currentRating,
        comment: comment,
        date: new Date().toISOString()
    };
    
    // Ajouter la review au prestataire
    const provider = providers.find(p => p.id === booking.providerId);
    if (provider) {
        if (!provider.reviews) provider.reviews = [];
        provider.reviews.push(review);
        
        // Recalculer la note moyenne
        const avgRating = provider.reviews.reduce((sum, r) => sum + r.rating, 0) / provider.reviews.length;
        provider.rating = avgRating.toFixed(1);
    }
    
    // Mettre à jour le booking
    booking.rated = true;
    saveBookings();
    
    closeModal();
    showToast('Avis enregistré !', 'success');
    
    if (currentUser.role === 'client') {
        loadClientAccount();
    }
}

// ==========================================
// COMPTE CLIENT
// ==========================================
function loadClientAccount() {
    const userBookings = bookings.filter(b => b.clientId === currentUser.id);
    
    // Statistiques
    document.getElementById('totalBookings').textContent = userBookings.length;
    const totalSpent = userBookings.reduce((sum, b) => sum + b.price, 0);
    document.getElementById('totalSpent').textContent = totalSpent + '€';
    
    const ratedBookings = userBookings.filter(b => b.rated);
    const avgRating = ratedBookings.length > 0 
        ? (ratedBookings.reduce((sum, b) => {
            const review = providers.find(p => p.id === b.providerId)?.reviews?.find(r => r.bookingId === b.id);
            return sum + (review?.rating || 0);
        }, 0) / ratedBookings.length).toFixed(1)
        : '0';
    document.getElementById('avgRating').textContent = avgRating;
    
    // Historique
    const historyContainer = document.getElementById('bookingHistory');
    if (userBookings.length === 0) {
        historyContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Aucune réservation</p>';
        return;
    }
    
    historyContainer.innerHTML = userBookings.map(booking => {
        const date = new Date(booking.dateTime);
        const statusClass = booking.status === 'confirmed' ? 'confirmed' : 
                          booking.status === 'completed' ? 'completed' : 
                          booking.status === 'cancelled' ? 'cancelled' : 'pending';
        
        return `
            <div class="booking-card ${statusClass} bg-white rounded-xl p-6 shadow-sm">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h4 class="font-bold text-lg text-gray-800">${booking.providerName}</h4>
                            <span class="status-badge ${statusClass}">${booking.status}</span>
                        </div>
                        <p class="font-semibold mb-1" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${booking.providerJob}</p>
                        <p class="text-gray-600 text-sm mb-1">
                            <i class="fa-solid fa-calendar mr-2"></i>${date.toLocaleDateString('fr-FR')}
                        </p>
                        <p class="text-gray-600 text-sm">
                            <i class="fa-solid fa-clock mr-2"></i>${date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - ${booking.duration}h
                        </p>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                        <p class="font-bold text-xl text-gray-800">${booking.price}€</p>
                        ${booking.status === 'completed' && !booking.rated ? 
                            `<button onclick="openRatingModal(${booking.id})" class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition text-sm">
                                Noter
                            </button>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// ACCUEIL PRESTATAIRE
// ==========================================
function loadProviderHome() {
    if (!currentUser || currentUser.role !== 'provider') return;
    
    const user = users.find(u => u.id === currentUser.id);
    if (!user) return;
    
    // Nom d'accueil
    const welcomeName = document.getElementById('providerWelcomeName');
    if (welcomeName) {
        welcomeName.textContent = user.name || 'Prestataire';
    }
    
    // Récupérer les réservations du prestataire
    const provider = providers.find(p => p.userId === currentUser.id);
    const providerBookings = provider ? bookings.filter(b => b.providerId === provider.id) : [];
    
    // Statistiques
    document.getElementById('providerHomeBookings').textContent = providerBookings.length;
    const revenue = providerBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0);
    document.getElementById('providerHomeRevenue').textContent = revenue + '€';
    document.getElementById('providerHomeRating').textContent = (user.rating || 0).toFixed(1);
    document.getElementById('providerHomePending').textContent = providerBookings.filter(b => b.status === 'pending').length;
    
    // Réservations récentes (3 dernières)
    const recentBookings = providerBookings
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    
    const bookingsList = document.getElementById('providerHomeBookingsList');
    if (bookingsList) {
        if (recentBookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="glass-card rounded-xl p-8 text-center">
                    <i class="fa-solid fa-calendar-xmark text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">Aucune réservation pour le moment</p>
                </div>
            `;
        } else {
            bookingsList.innerHTML = recentBookings.map(booking => {
                const statusColors = {
                    'pending': 'bg-yellow-100 text-yellow-800',
                    'confirmed': 'bg-blue-100 text-blue-800',
                    'completed': 'bg-green-100 text-green-800',
                    'cancelled': 'bg-red-100 text-red-800'
                };
                const statusLabels = {
                    'pending': 'En attente',
                    'confirmed': 'Confirmée',
                    'completed': 'Terminée',
                    'cancelled': 'Annulée'
                };
                return `
                    <div class="glass-card rounded-xl p-6">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <h4 class="font-bold text-gray-800">${booking.clientName}</h4>
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}">
                                        ${statusLabels[booking.status] || booking.status}
                                    </span>
                                </div>
                                <p class="text-sm text-gray-600 mb-1">
                                    <i class="fa-solid fa-calendar mr-2"></i>
                                    ${new Date(booking.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <p class="text-sm text-gray-600">
                                    <i class="fa-solid fa-clock mr-2"></i>
                                    ${booking.time} - ${booking.duration}h
                                </p>
                            </div>
                            <div class="text-right">
                                <p class="text-2xl font-bold text-gray-800 mb-1">${booking.price}€</p>
                                <p class="text-xs text-gray-500">Total</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// ==========================================
// DASHBOARD PRESTATAIRE
// ==========================================
function loadProviderDashboard() {
    if (!currentUser || currentUser.role !== 'provider') return;
    
    const providerBookings = bookings.filter(b => b.providerId === currentUser.id || 
        providers.find(p => p.userId === currentUser.id && p.id === b.providerId));
    
    // Statistiques
    document.getElementById('providerBookings').textContent = providerBookings.length;
    const revenue = providerBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0);
    document.getElementById('providerRevenue').textContent = revenue + '€';
    
    const userProvider = users.find(u => u.id === currentUser.id);
    document.getElementById('providerRating').textContent = userProvider?.rating?.toFixed(1) || '0';
    document.getElementById('providerStatus').textContent = userProvider?.verified ? 'Vérifié' : 'En attente';
    document.getElementById('providerStatus').className = userProvider?.verified ? 'text-sm font-bold text-green-600' : 'text-sm font-bold text-yellow-600';
    
    // Formulaire profil
    loadProviderProfileForm();
    
    // Disponibilités
    loadAvailabilityCalendar();
    
    // Réservations
    loadProviderBookings();
}

function loadProviderProfileForm() {
    const form = document.getElementById('providerProfileForm');
    const user = users.find(u => u.id === currentUser.id);
    
    form.innerHTML = `
        <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Métier</label>
            <select id="providerJob" class="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Sélectionner un métier</option>
                ${jobs.map(job => `<option value="${job}" ${user?.job === job ? 'selected' : ''}>${job}</option>`).join('')}
            </select>
        </div>
        <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Tarif horaire (€)</label>
            <input type="number" id="providerPrice" value="${user?.price || ''}" 
                   class="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500">
        </div>
        <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea id="providerDescription" rows="3" 
                      class="w-full p-2 border rounded-lg outline-none resize-none focus:ring-2 focus:ring-purple-500">${user?.description || ''}</textarea>
        </div>
        <button onclick="saveProviderProfile()" class="w-full text-white py-2 rounded-lg font-semibold transition" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);" onmouseover="this.style.background='linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'" onmouseout="this.style.background='linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'">
            Enregistrer le profil
        </button>
    `;
}

function saveProviderProfile() {
    const job = document.getElementById('providerJob').value;
    const price = parseInt(document.getElementById('providerPrice').value);
    const description = document.getElementById('providerDescription').value;
    
    if (!job || !price) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    const user = users.find(u => u.id === currentUser.id);
    user.job = job;
    user.price = price;
    user.description = description;
    
    localStorage.setItem('users', JSON.stringify(users));
    generateProviders();
    showToast('Profil enregistré !', 'success');
}

function loadAvailabilityCalendar() {
    const calendar = document.getElementById('availabilityCalendar');
    const user = users.find(u => u.id === currentUser.id);
    const availability = user?.availability || {};
    
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const hours = Array.from({length: 24}, (_, i) => i);
    
    let html = '<div class="grid grid-cols-7 gap-2 mb-4">';
    days.forEach(day => {
        html += `<div class="text-center font-semibold text-gray-700">${day}</div>`;
    });
    html += '</div>';
    
    html += '<div class="space-y-2 max-h-64 overflow-y-auto">';
    hours.forEach(hour => {
        html += `<div class="grid grid-cols-7 gap-2">`;
        days.forEach((day, dayIdx) => {
            const key = `${dayIdx}_${hour}`;
            const isAvailable = availability[key] !== false;
            html += `
                <button onclick="toggleAvailability(${dayIdx}, ${hour})" 
                        class="availability-day ${isAvailable ? 'available' : 'unavailable'} p-2 rounded text-xs font-semibold">
                    ${hour}h
                </button>
            `;
        });
        html += '</div>';
    });
    html += '</div>';
    
    calendar.innerHTML = html;
}

function toggleAvailability(day, hour) {
    const user = users.find(u => u.id === currentUser.id);
    if (!user.availability) user.availability = {};
    
    const key = `${day}_${hour}`;
    user.availability[key] = user.availability[key] === false ? true : false;
    
    localStorage.setItem('users', JSON.stringify(users));
    loadAvailabilityCalendar();
}

// ==========================================
// INSCRIPTION PRESTATAIRE
// ==========================================
function loadProviderRegisterForm() {
    // Remplir le select des métiers
    const jobSelect = document.getElementById('providerRegisterJob');
    if (jobSelect) {
        jobSelect.innerHTML = '<option value="">Sélectionner un métier</option>';
        jobs.forEach(job => {
            jobSelect.innerHTML += `<option value="${job}">${job}</option>`;
        });
    }
    
    // Charger les données temporaires si elles existent
    const tempData = sessionStorage.getItem('tempProviderData');
    if (tempData) {
        const data = JSON.parse(tempData);
        document.getElementById('providerRegisterName').value = data.name || '';
        document.getElementById('providerRegisterEmail').value = data.email || '';
        document.getElementById('providerRegisterPhone').value = data.phone || '';
    }
    
    // Générer la grille de disponibilités
    loadProviderAvailabilityGrid();
}

function loadProviderAvailabilityGrid() {
    const grid = document.getElementById('providerAvailabilityGrid');
    if (!grid) return;
    
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const hours = Array.from({length: 12}, (_, i) => i + 8); // De 8h à 19h
    
    let html = '';
    days.forEach((day, dayIdx) => {
        html += `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-gray-800">${day}</h4>
                    <button type="button" onclick="toggleProviderRegisterDay(${dayIdx})" 
                            class="text-sm text-pink-600 hover:text-pink-700 font-medium">
                        Tout sélectionner / Désélectionner
                    </button>
                </div>
                <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
        `;
        
        hours.forEach(hour => {
            const id = `providerAvail_${dayIdx}_${hour}`;
            html += `
                <label class="flex items-center cursor-pointer">
                    <input type="checkbox" id="${id}" value="${dayIdx}_${hour}" 
                           class="provider-availability-checkbox rounded border-gray-300 text-pink-600 focus:ring-pink-500">
                    <span class="ml-2 text-sm text-gray-700">${hour}h</span>
                </label>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function toggleProviderRegisterDay(dayIdx) {
    const hours = Array.from({length: 12}, (_, i) => i + 8);
    const checkboxes = hours.map(hour => document.getElementById(`providerAvail_${dayIdx}_${hour}`));
    const allChecked = checkboxes.every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

function handleProviderRegister(event) {
    event.preventDefault();
    
    // Récupérer les données du formulaire
    const name = document.getElementById('providerRegisterName').value;
    const email = document.getElementById('providerRegisterEmail').value;
    const phone = document.getElementById('providerRegisterPhone').value;
    const cin = document.getElementById('providerRegisterCIN').value;
    const password = document.getElementById('providerRegisterPassword').value;
    const job = document.getElementById('providerRegisterJob').value;
    const price = parseInt(document.getElementById('providerRegisterPrice').value);
    const description = document.getElementById('providerRegisterDescription').value;
    
    // Validation
    if (!name || !email || !phone || !cin || !password || !job || !price) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    if (price < 10) {
        showToast('Le tarif horaire doit être d\'au moins 10€', 'error');
        return;
    }
    
    // Vérifier si l'email existe déjà
    if (users.find(u => u.email === email)) {
        showToast('Cet email est déjà utilisé', 'error');
        return;
    }
    
    // Récupérer les disponibilités
    const availability = {};
    const checkboxes = document.querySelectorAll('.provider-availability-checkbox:checked');
    checkboxes.forEach(cb => {
        availability[cb.value] = true;
    });
    
    // Créer l'utilisateur prestataire
    const newUser = {
        id: users.length,
        email,
        password,
        name,
        phone,
        cin,
        role: 'provider',
        verified: false,
        job,
        price,
        description,
        availability,
        rating: 0,
        reviews: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Nettoyer les données temporaires
    sessionStorage.removeItem('tempProviderData');
    
    // Connecter l'utilisateur
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showToast('Inscription réussie ! Votre compte est en attente de validation.', 'success');
    
    // Générer les prestataires pour afficher le nouveau
    generateProviders();
    
    // Rediriger vers le dashboard
    setTimeout(() => {
        initializeApp();
    }, 1500);
}

function loadProviderBookings() {
    const container = document.getElementById('providerBookingsList');
    const provider = providers.find(p => p.userId === currentUser.id);
    if (!provider) {
        container.innerHTML = '<p class="text-gray-500">Aucune réservation</p>';
        return;
    }
    
    const providerBookings = bookings.filter(b => b.providerId === provider.id);
    
    if (providerBookings.length === 0) {
        container.innerHTML = '<p class="text-gray-500">Aucune réservation</p>';
        return;
    }
    
    container.innerHTML = providerBookings.map(booking => {
        const date = new Date(booking.dateTime);
        return `
            <div class="booking-card ${booking.status} bg-gray-50 rounded-xl p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-bold text-gray-800">${booking.clientName}</p>
                        <p class="text-sm text-gray-600">${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>
                        <p class="text-sm text-gray-600">${booking.duration}h - ${booking.price}€</p>
                    </div>
                    <div class="flex flex-col gap-2">
                        <span class="status-badge ${booking.status}">${booking.status}</span>
                        ${booking.status === 'confirmed' ? 
                            `<button onclick="updateBookingStatus(${booking.id}, 'completed')" class="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                Marquer terminé
                            </button>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateBookingStatus(bookingId, status) {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = status;
        saveBookings();
        loadProviderBookings();
        showToast('Statut mis à jour', 'success');
    }
}

// ==========================================
// ADMINISTRATION
// ==========================================
function loadAdminDashboard() {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    // Statistiques
    document.getElementById('adminUsers').textContent = users.length;
    document.getElementById('adminProviders').textContent = users.filter(u => u.role === 'provider').length;
    document.getElementById('adminBookings').textContent = bookings.length;
    document.getElementById('adminJobs').textContent = jobs.length;
    
    // Liste des prestataires
    loadAdminProvidersList();
    
    // Liste des métiers
    loadJobsList();
    
    // Statistiques détaillées
    loadAdminStats();
}

function loadAdminProvidersList() {
    const container = document.getElementById('adminProvidersList');
    const providerUsers = users.filter(u => u.role === 'provider');
    
    if (providerUsers.length === 0) {
        container.innerHTML = '<p class="text-gray-500">Aucun prestataire</p>';
        return;
    }
    
    container.innerHTML = providerUsers.map(user => `
        <div class="list-item bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div>
                <p class="font-semibold text-gray-800">${user.name}</p>
                <p class="text-sm text-gray-600">${user.email}</p>
                <p class="text-sm" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${user.job || 'Non défini'}</p>
            </div>
            <div class="flex items-center gap-2">
                <span class="status-badge ${user.verified ? 'verified' : 'pending-verification'}">
                    ${user.verified ? 'Vérifié' : 'En attente'}
                </span>
                ${!user.verified ? 
                    `<button onclick="verifyProvider(${user.id})" class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                        Valider
                    </button>` : ''
                }
            </div>
        </div>
    `).join('');
}

function verifyProvider(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.verified = true;
        localStorage.setItem('users', JSON.stringify(users));
        generateProviders();
        loadAdminProvidersList();
        showToast('Prestataire validé !', 'success');
    }
}

function loadJobsList() {
    const container = document.getElementById('jobsList');
    container.innerHTML = jobs.map(job => `
        <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <span class="font-semibold text-gray-800">${job}</span>
            <button onclick="removeJob('${job}')" class="text-red-500 hover:text-red-700">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function addJob() {
    const input = document.getElementById('newJobInput');
    const jobName = input.value.trim();
    
    if (!jobName) {
        showToast('Veuillez entrer un nom de métier', 'error');
        return;
    }
    
    if (jobs.includes(jobName)) {
        showToast('Ce métier existe déjà', 'error');
        return;
    }
    
    jobs.push(jobName);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    updateJobFilters();
    loadJobsList();
    input.value = '';
    showToast('Métier ajouté !', 'success');
}

function removeJob(jobName) {
    jobs = jobs.filter(j => j !== jobName);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    updateJobFilters();
    loadJobsList();
    showToast('Métier supprimé', 'success');
}

function loadAdminStats() {
    const container = document.getElementById('adminStats');
    
    const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0);
    const avgBookingPrice = bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(2) : 0;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    
    container.innerHTML = `
        <div class="stat-card bg-white rounded-xl p-6 shadow-md">
            <p class="text-gray-500 text-sm mb-2">Revenus totaux</p>
            <p class="text-3xl font-bold text-gray-800">${totalRevenue}€</p>
        </div>
        <div class="stat-card bg-white rounded-xl p-6 shadow-md">
            <p class="text-gray-500 text-sm mb-2">Prix moyen</p>
            <p class="text-3xl font-bold text-gray-800">${avgBookingPrice}€</p>
        </div>
        <div class="stat-card bg-white rounded-xl p-6 shadow-md">
            <p class="text-gray-500 text-sm mb-2">Prestations terminées</p>
            <p class="text-3xl font-bold text-gray-800">${completedBookings}</p>
        </div>
    `;
}

// ==========================================
// UTILITAIRES
// ==========================================
function saveBookings() {
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function loadBookings() {
    const saved = localStorage.getItem('bookings');
    if (saved) {
        bookings = JSON.parse(saved);
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Charger les réservations au démarrage
loadBookings();

// Exposer les fonctions globales
window.showSection = showSection;
window.switchAuthMode = switchAuthMode;
window.selectRegisterType = selectRegisterType;
window.handleAuth = handleAuth;
window.logout = logout;
window.filterProviders = filterProviders;
window.viewProviderProfile = viewProviderProfile;
window.openBooking = openBooking;
window.closeModal = closeModal;
window.updateTotalPrice = updateTotalPrice;
window.processPayment = processPayment;
window.setRating = setRating;
window.openRatingModal = openRatingModal;
window.submitRating = submitRating;
window.saveProviderProfile = saveProviderProfile;
window.toggleAvailability = toggleAvailability;
window.updateBookingStatus = updateBookingStatus;
window.verifyProvider = verifyProvider;
window.addJob = addJob;
window.removeJob = removeJob;
window.filterByJob = filterByJob;
window.handleProviderRegister = handleProviderRegister;
window.toggleProviderRegisterDay = toggleProviderRegisterDay;

// Écouter les changements de durée pour mettre à jour le prix
document.addEventListener('DOMContentLoaded', () => {
    const durationInput = document.getElementById('appointmentDuration');
    if (durationInput) {
        durationInput.addEventListener('input', updateTotalPrice);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterProviders);
    }
});
