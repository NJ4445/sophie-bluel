// Vérification de si l'utilisateur est connecté ou non
let isUserConnected = localStorage.getItem("connected");
let userToken = localStorage.getItem("token");
console.log(userToken);
console.log(`connected = ${isUserConnected}`);
if (isUserConnected === "true") {
    let loginButton = document.getElementById("login-button");
    document.getElementById("filtres").style.display = "none";
    loginButton.innerText = "Logout";
    loginButton.href = "#";
    loginButton.addEventListener("click", () => {
        localStorage.removeItem("connected");
        localStorage.removeItem("token");
        location.reload();
    });

    // Afficher le lien "Modifier" et son contenu
    document.getElementById("modifier-link-container").style.display = "block";
    // Afficher la section "Mode édition"
    document.querySelector(".mode-edition-section").style.display = "block";
} else {
    // Cacher le lien "Modifier" et son contenu
    document.getElementById("modifier-link-container").style.display = "none";
    // Cacher la section "Mode édition"
    document.querySelector(".mode-edition-section").style.display = "none";
}


// Déclaration des variables globales
const workContainer = document.getElementById("gallery");
const filterButtonsContainer = document.getElementById("filtres");
let works = []; // Tableau pour stocker les travaux
let filterButtons = []; // Tableau pour stocker les boutons filtres

// Fonction pour récupérer les éléments au chargement de la page
async function getElements() {
    try {
        // Récupérer les travaux depuis l'API
        const worksResponse = await fetch('http://localhost:5678/api/works');
        works = await worksResponse.json(); // Stockage des travaux récupérés dans le tableau works
        console.log("Travaux récupérés :", works); // Vérification des travaux récupérés dans la console

        // Récupérer les catégories de travaux depuis l'API
        const categoriesResponse = await fetch('http://localhost:5678/api/categories');
        const categories = await categoriesResponse.json(); // Stockage des catégories récupérées dans le tableau categories
        console.log("Catégories récupérées :", categories); // Vérification des catégories récupérées dans la console

        // Créer les boutons de filtres
        createFilterButtons(categories);

        // Afficher les travaux
        displayWorks();
    } catch (error) {
        console.error('Une erreur s\'est produite :', error);
    }
}

// Fonction pour afficher les travaux
function displayWorks(filteredWorks = works) {
    workContainer.innerHTML = ''; // Supprimer les travaux existants
    filteredWorks.forEach(project => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const figcaption = document.createElement('figcaption');

        img.src = project.imageUrl;
        img.alt = project.title;
        figcaption.textContent = project.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        workContainer.appendChild(figure);
    });
}

// Gérer l'événement click sur les icônes de corbeille dans la modal1 pour supprimer un travail
document.getElementById('gallery-modal').addEventListener('click', async function (event) {
    if (event.target.classList.contains('delete-icon')) {
        event.stopPropagation(); // Empêcher la propagation de l'événement click pour éviter la fermeture de la modal
        const figure = event.target.closest('figure');
        const imageId = figure.dataset.imageId; // Récupérer l'ID de l'image à supprimer
        try {
            // Effectuer une requête DELETE à l'API pour supprimer le travail
            const response = await fetch(`http://localhost:5678/api/works/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userToken}` // Ajouter le token d'authentification
                }
            });
            if (response.ok) {
                // Si la suppression réussit, supprimer l'élément du DOM
                figure.remove();
                displayWorks(); // Mettre à jour la galerie photo en dehors de la modal
            } else {
                console.error('La suppression du travail a échoué.');
            }
        } catch (error) {
            console.error('Une erreur s\'est produite lors de la suppression du travail :', error);
        }
    }
    event.stopPropagation(); 
});

// Fonction pour afficher les travaux dans la modal1 avec des images en miniature et une icône de corbeille
function displayWorksInModal(filteredWorks = works) {
    const galleryModal = document.getElementById('gallery-modal');
    galleryModal.innerHTML = ''; // Supprimer les travaux existants dans la modal1
    filteredWorks.forEach(project => {
        const figure = document.createElement('figure');
        figure.dataset.imageId = project.id; // Ajouter l'ID du travail comme attribut de données

        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = project.title;
        img.classList.add('thumbnail-image'); // Ajouter une classe pour les styles CSS des images en miniature

        // Ajouter la classe pour le positionnement relatif
        figure.classList.add('modal1-image');

        // Créer une div pour l'icône de corbeille
        const deleteIconContainer = document.createElement('div');
        deleteIconContainer.classList.add('thumbnail-icon-container');

        // Créer l'icône de corbeille et lui attribuer une classe pour le positionnement absolu
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('delete-icon', 'fa-regular', 'fa-trash-can');

        // Ajout du gestionnaire d'événements au clic sur l'icône de corbeille
        deleteIcon.addEventListener('click', async function(event) {
            event.stopPropagation(); // Empêcher la propagation de l'événement click pour éviter la fermeture de la modal
            const figure = deleteIcon.closest('figure');
            const imageId = figure.dataset.imageId; // Récupérer l'ID de l'image à supprimer
            try {
                // Effectuer une requête DELETE à l'API pour supprimer le travail
                const response = await fetch(`http://localhost:5678/api/works/${imageId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${userToken}` // Ajouter le token d'authentification
                    }
                });
                if (response.ok) {
                    // Si la suppression réussit, supprimer l'élément du DOM
                    figure.remove();
                } else {
                    console.error('La suppression du travail a échoué.');
                }
            } catch (error) {
                console.error('Une erreur s\'est produite lors de la suppression du travail :', error);
            }
        });

        deleteIconContainer.appendChild(deleteIcon); // Ajouter l'icône de corbeille à son conteneur
        
        figure.appendChild(img);
        figure.appendChild(deleteIconContainer); // Ajouter l'icône de corbeille à la figure
        galleryModal.appendChild(figure);
    });
}

// Fonction pour créer les boutons de filtres
function createFilterButtons(categories) {
    // Ajouter un bouton 'Tous'
    const allButton = createButton('Tous', 'all');
    allButton.classList.add('active'); // Ajouter la classe "active" pour rendre ce bouton actif par défaut
    filterButtons.push(allButton); // Ajouter le bouton "Tous" au tableau des boutons filtres

    // Créer les boutons pour chaque catégorie
    categories.forEach(category => {
        const button = createButton(category.name, category.id);
        filterButtons.push(button); // Ajouter le bouton au tableau des boutons filtres
    });

    // Ajouter les boutons au conteneur des boutons filtres
    filterButtonsContainer.append(...filterButtons);
}

// Fonction pour créer un bouton de filtre
function createButton(text, categoryId) {
    const button = document.createElement('button');
    button.textContent = text;
    button.dataset.categoryId = categoryId; // Stocker l'ID de la catégorie

    button.addEventListener('click', () => {
        // Ajouter la classe "active" au bouton cliqué et supprimer cette classe des autres boutons
        filterButtons.forEach(btn => {
            if (btn === button) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Déclencher la fonction de filtrage avec la catégorie associée
        filterWorks(categoryId);
    });

    return button;
}

// Fonction pour filtrer les travaux en fonction de la catégorie sélectionnée
function filterWorks(categoryId) {
    const filteredWorks = (categoryId === 'all') ? works : works.filter(work => work.categoryId === categoryId);
    displayWorks(filteredWorks); // Afficher uniquement les travaux de la catégorie sélectionnée
}

// Appeler la fonction pour récupérer les éléments au chargement de la page
getElements();

// Modal
document.addEventListener('DOMContentLoaded', function () {
    // Déclaration des variables pour les modals et l'overlay
    const modal1 = document.getElementById('modal1');
    const modal2 = document.getElementById('modal2');
    const overlay = document.getElementById('overlay');

    // Fonction pour ouvrir la modal1
    function openModal1() {
        modal1.style.display = 'block';
        overlay.style.display = 'block';
    }

    // Gérer l'événement click sur le lien "Modifier"
    const modifierLink = document.querySelector('.open-modal');
    if (modifierLink) {
        modifierLink.addEventListener('click', function (event) {
            event.preventDefault(); // Empêcher le comportement par défaut du lien
            openModal1(); // Ouvrir la modal1
            displayWorksInModal(); // Afficher les travaux dans la modal avec les images en miniature
        });
    }

    // Gérer l'événement click sur le bouton "Ajouter une photo" dans la modal1
    const addPhotoButton = document.querySelector('#add-project-form-modal input[type="submit"]');
    if (addPhotoButton) {
        addPhotoButton.addEventListener('click', function (event) {
            event.preventDefault();
            modal1.style.display = 'none'; // Fermer la modal1
            modal2.style.display = 'block'; // Ouvrir la modal2
        });
    }

    // Gérer l'événement click sur le bouton de fermeture de la modal1
    const modal1CloseButton = modal1.querySelector('.modal-close');
    if (modal1CloseButton) {
        modal1CloseButton.addEventListener('click', function () {
            modal1.style.display = 'none';
            overlay.style.display = 'none';
        });
    }

    // Gérer l'événement click sur l'overlay
    overlay.addEventListener('click', function () {
        modal1.style.display = 'none';
        modal2.style.display = 'none';
        overlay.style.display = 'none';
    });
});


// Gérer l'événement click sur le bouton "Retour" dans la modal2
const backToModal1Button = modal2.querySelector('#back-to-modal1');
if (backToModal1Button) {
    backToModal1Button.addEventListener('click', function () {
        modal2.style.display = 'none';
        modal1.style.display = 'block';
    });
}

// Gérer l'événement click en dehors de la modal2 pour la fermer
overlay.addEventListener('click', function (event) {
    if (event.target === overlay) {
        modal2.style.display = 'none';
        overlay.style.display = 'none';
    }
});

// Gérer l'événement click sur le bouton de fermeture de la modal2
const modal2CloseButton = modal2.querySelector('.modal2-close');
if (modal2CloseButton) {
    modal2CloseButton.addEventListener('click', function () {
        modal2.style.display = 'none';
        overlay.style.display = 'none';
    });
}

// Gérer l'événement click sur le bouton "+ Ajouter photo" dans la modal2
const addPhotoButtonModal2 = modal2.querySelector('#modal2-photo-add-button');
if (addPhotoButtonModal2) {
    addPhotoButtonModal2.addEventListener('click', function (event) {
        event.preventDefault(); // Empêcher le comportement par défaut du bouton (soumission du formulaire)
        event.stopPropagation(); // Empêcher la propagation de l'événement pour éviter la fermeture de la modal2
        // Ouvrir la boîte de dialogue pour sélectionner un fichier
        document.getElementById('file-input').click();
    });
}

// Gérer l'événement change sur l'élément input[type="file"]
const fileInput = document.getElementById('file-input');
if (fileInput) {
    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const imageURL = e.target.result;

            // Sélectionner l'élément .loaded-photo-change
            const loadedPhotoChange = document.querySelector('.loaded-photo-change');

            if (loadedPhotoChange) {
                // Créer un élément img pour afficher l'image miniature
                const img = document.createElement('img');
                img.src = imageURL;
                img.alt = "Photo miniature";
                img.classList.add('modal2-image');

                // Supprimer le contenu précédent de .loaded-photo-change
                loadedPhotoChange.innerHTML = '';
                
                // Ajouter l'image miniature à .loaded-photo-change
                loadedPhotoChange.appendChild(img);

                loadedPhotoChange.style.display = 'block'; // Afficher .loaded-photo-change s'il était caché
            } else {
                console.error('Element .loaded-photo-change not found!');
            }
        };

        reader.readAsDataURL(file); // Lire le contenu du fichier en tant qu'URL de données
    });
}

// Fonction pour récupérer et afficher les catégories dans le menu déroulant de la modal2
async function fetchAndDisplayCategories() {
    try {
        // Récupérer les catégories depuis l'API
        const response = await fetch('http://localhost:5678/api/categories');
        const categories = await response.json(); // Convertir la réponse en JSON
        console.log("Catégories récupérées :", categories); // Vérification dans la console

        // Sélectionner l'élément select pour les catégories dans la modal2
        const selectElement = document.getElementById('categorie');
        // Réinitialiser le contenu du select pour éviter les doublons en cas de rappel de la fonction
        selectElement.innerHTML = '';

        // Créer une option vide avec seulement le chevron vers le bas
        const defaultOption = document.createElement('option');
        defaultOption.disabled = true; // Désactiver l'option pour qu'elle ne soit pas sélectionnable
        defaultOption.selected = true; // Sélectionner l'option par défaut
        defaultOption.hidden = true; // Cacher l'option pour qu'elle n'apparaisse pas dans la liste
        defaultOption.textContent = ''; // Laisser le texte vide
        defaultOption.value = ''; // Laisser la valeur vide
        selectElement.appendChild(defaultOption);

        // Créer une option pour chaque catégorie et l'ajouter au select
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id; // Valeur de l'option est l'ID de la catégorie
            option.textContent = category.name; // Texte de l'option est le nom de la catégorie
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Une erreur s\'est produite lors de la récupération des catégories :', error);
    }
}

// Gérer l'événement click sur la section catégorie dans modal2 pour afficher les catégories
const categorieSection = document.getElementById('section-categorie');
if (categorieSection) {
    categorieSection.addEventListener('click', function() {
        fetchAndDisplayCategories(); // Appeler la fonction pour récupérer et afficher les catégories
    });
}


// Appeler la fonction pour récupérer et afficher les catégories au chargement de la page
fetchAndDisplayCategories();

// Gérer l'événement click sur le bouton "Valider" dans la modal2
const modal2Button = document.getElementById('modal2-button');
if (modal2Button) {
    modal2Button.addEventListener('click', async function(event) {
        event.preventDefault(); // Empêcher le comportement par défaut du bouton (soumission du formulaire)

        // Collecter les données du formulaire
        const fileInput = document.getElementById('file-input');
        const titreInput = document.getElementById('titre');
        const categorieSelect = document.getElementById('categorie');

        const formData = new FormData();
        formData.append('image', fileInput.files[0]); // Ajouter le fichier image
        formData.append('title', titreInput.value); // Ajouter le titre du travail
        formData.append('category', categorieSelect.value); // Ajouter l'ID de la catégorie

        try {
            // Effectuer une requête POST à l'API pour ajouter le nouveau travail
            const response = await fetch('http://localhost:5678/api/works', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${userToken}` // Ajouter le token d'authentification si nécessaire
                }
            });

            if (response.ok) {
                // Si l'ajout réussit, actualiser la page ou effectuer d'autres actions nécessaires
                console.log('Nouveau travail ajouté avec succès !');
                // Vous pouvez fermer la modal2 et effectuer d'autres actions nécessaires ici
            } else {
                console.error('Échec de l\'ajout du nouveau travail.');
            }
        } catch (error) {
            console.error('Une erreur s\'est produite lors de l\'ajout du nouveau travail :', error);
        }
    });
}

