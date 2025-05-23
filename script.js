const token = "patAA6paOP5k4gsgp.653f8c1d22efad1494913278245e6bac13429bd267ea521629f3491777e01d54";
const baseId = "appqaKBY4SH528vtX";
const tableName = "U9 - U13";

let allJoueurs = [];
let boutonsAffiches = [];
let indexSelection = -1;

async function chargerTousLesJoueurs() {
  const urlBase = `https://api.airtable.com/v0/${baseId}/${tableName}`;
  let offset = null;
  allJoueurs = [];

  do {
    const url = offset
      ? `${urlBase}?pageSize=100&offset=${offset}`
      : `${urlBase}?pageSize=100`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    allJoueurs = allJoueurs.concat(data.records);
    offset = data.offset; // S'il y a une autre page, on continue

  } while (offset); // boucle tant qu’il reste des pages à charger
}


function rechercher() {
  const input = document.getElementById("search").value.toLowerCase().trim();
  const resultatDiv = document.getElementById("resultat");
  resultatDiv.innerHTML = "";

  boutonsAffiches = [];
  indexSelection = -1;

  if (input.length === 0) return;

  const resultats = allJoueurs.filter(rec => {
    const nom = (rec.fields["Nom"] || "").toLowerCase();
    const prenom = (rec.fields["Prenom"] || "").toLowerCase();
    const nomComplet = `${nom} ${prenom}`;
    const nomInverse = `${prenom} ${nom}`;
    return (
      nom.includes(input) ||
      prenom.includes(input) ||
      nomComplet.includes(input) ||
      nomInverse.includes(input)
    );
  });

  if (resultats.length === 0) {
    resultatDiv.innerHTML = "Aucun joueur trouvé.";
    return;
  }

  resultats.forEach((joueurData, index) => {
  const joueur = joueurData.fields;
  const bouton = document.createElement("button");

  bouton.innerHTML = `
    <span class="nom-prenom">${joueur.Nom} ${joueur.Prenom}</span>
    <span class="categorie">${joueur.Catégorie}</span>
  `;

  bouton.classList.add("suggestion");

  bouton.onclick = () => {
    const confirmationDiv = document.getElementById("confirmation");
    const confirmNom = document.getElementById("confirmNom");
    const confirmCategorie = document.getElementById("confirmCategorie");
    const dobInput = document.getElementById("dob");
    const validerBtn = document.getElementById("validerDOB");

    // Afficher le formulaire avec les infos du joueur
    confirmNom.textContent = `${joueur.Nom} ${joueur.Prenom}`;
    confirmCategorie.textContent = joueur.Catégorie;
    dobInput.value = "";
    confirmationDiv.style.display = "block";
    // Cacher tous les autres boutons
    resultatDiv.innerHTML = "";


    // Nettoyer anciens événements
    const newBtn = validerBtn.cloneNode(true);
    validerBtn.parentNode.replaceChild(newBtn, validerBtn);

    // Vérifier la date entrée
    newBtn.onclick = () => {
      const saisie = dobInput.value.trim(); // ex : 2012-05-03
      const dobJoueur = joueur["Date de naissance"]; // ce champ doit exister dans Airtable

      if (saisie === dobJoueur) {
        confirmationDiv.style.display = "none";
        afficherDetails(joueur);
      } else {
        alert("Date de naissance incorrecte. Format attendu : AAAA-MM-JJ");
      }
    };
  };

  boutonsAffiches.push(bouton);
  resultatDiv.appendChild(bouton);
});


}

function afficherDetails(joueur) {
  const resultatDiv = document.getElementById("resultat");
  resultatDiv.innerHTML = `
    <h3>${joueur.Nom} ${joueur.Prenom}</h3>
    <p><strong>Éducateur :</strong> ${joueur.Educateur}</p>
    <p><strong>Équipe :</strong> ${joueur.Secteur}</p>
    <p><strong>Catégorie :</strong> ${joueur.Catégorie}</p>
    <p><strong>Cliquez sur ce lien pour voir les horaires de matchs et d'entraînement pour la saison :</strong> <a href="${joueur.Horaire}" target="_blank">Horaire de la saison</a></p>


  `;
}

function updateSelection() {
  boutonsAffiches.forEach((btn, i) => {
    if (i === indexSelection) {
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
    }
  });
}

// Chargement initial
window.onload = () => {
  chargerTousLesJoueurs();
  

  const searchInput = document.getElementById("search");

  // Recherche dynamique à chaque frappe
  searchInput.addEventListener("input", rechercher);

  // Navigation clavier + activation avec Entrée
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (indexSelection < boutonsAffiches.length - 1) {
        indexSelection++;
        updateSelection();
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (indexSelection > 0) {
        indexSelection--;
        updateSelection();
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (indexSelection >= 0 && indexSelection < boutonsAffiches.length) {
        boutonsAffiches[indexSelection].click();
      }
    }
  });
   document.getElementById("dob").addEventListener("input", function () {
    let val = this.value.replace(/\D/g, ""); // Garde que les chiffres

    if (val.length > 4 && val.length <= 6) {
      val = val.slice(0, 4) + '-' + val.slice(4);
    } else if (val.length > 6) {
      val = val.slice(0, 4) + '-' + val.slice(4, 6) + '-' + val.slice(6, 8);
    }

    this.value = val;
  });
  setInterval(() => {
  chargerTousLesJoueurs().then(rechercher);
 }, 60000);

};
