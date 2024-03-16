function connectUser(event) {
    event.preventDefault();

    let userEmail = document.getElementById("email").value;
    let userPassword = document.getElementById("password").value;

    if (userEmail === "") {
        // Afficher un message d'erreur à l'utilisateur
        console.log("E-mail vide");
        return;
    }

    if (userPassword === "") {
        // Afficher un message d'erreur à l'utilisateur
        console.log("Mot de passe vide");
        return;
    }

    fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "email": userEmail,
            "password": userPassword
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Échec de la connexion.');
        }
    })
    .then(data => {
        let userToken = data.token;

        if (userToken) {
            localStorage.setItem("connected", "true");
            localStorage.setItem("token", userToken);
            document.location.href = "./index.html";
        } else {
            // Gérer l'absence de token ou d'autres erreurs côté serveur
            console.error("Erreur lors de la récupération du token.");
        }
    })
    .catch(error => {
        // Gérer les erreurs de connexion
        console.error('Erreur de connexion:', error);
        document.getElementById("error-message").innerText = "E-mail ou mot de passe incorrect";
    });
}

const form = document.getElementById("log-in_form");
form.addEventListener("submit", connectUser);
console.log(form);
