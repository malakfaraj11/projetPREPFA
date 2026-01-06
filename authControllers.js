let authMode = "login"; // "login" ou "register"

async function handleAuth(event) {
    event.preventDefault();

    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value.trim();

    if (!email || !password) {
        alert("Veuillez remplir tous les champs");
        return;
    }

    // Détermine la bonne route API
    const endpoint = authMode === "login"
        ? "/api/login"
        : "/api/register";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        // Vérifie si le backend a renvoyé une erreur
        if (!response.ok) {
            console.error("Erreur API:", data);
            alert(data.message || "Erreur lors de l'authentification");
            return;
        }

        // Succès
        alert(data.message || "Authentification réussie");

        // Exemple : stocker le token si fourni
        if (data.token) {
            localStorage.setItem("token", data.token);
        }

    } catch (error) {
        console.error("Erreur réseau :", error);
        alert("Impossible de contacter le serveur");
    }
}
