const token = "patAA6paOP5k4gsgp.653f8c1d22efad1494913278245e6bac13429bd267ea521629f3491777e01d54"; // Mets ici ta clé d'API personnelle
const baseId = "appqaKBY4SH528vtX";
const tableName = "U9 - U13"; // ex: Joueurs

async function rechercher() {
  const nom = document.getElementById("search").value;
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=FIND("${encodeURIComponent(nom)}", {NOM COMPLET})`;



  const resultatDiv = document.getElementById("resultat");
  resultatDiv.innerHTML = "Recherche en cours...";

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  console.log(data); // Pour voir ce que l'API retourne

  if (!data.records || data.records.length === 0) {

    resultatDiv.innerHTML = "Aucun joueur trouvé.";
  } else {
    const joueur = data.records[0].fields;
    resultatDiv.innerHTML = `
      <p><strong>Nom :</strong> ${joueur.Nom}</p>
      <p><strong>Prénom :</strong> ${joueur.Prenom}</p>
      <p><strong>Éducateur :</strong> ${joueur.Educateur}</p>
      <p><strong>Secteur :</strong> ${joueur.Secteur}</p>
    `;
  }
}
