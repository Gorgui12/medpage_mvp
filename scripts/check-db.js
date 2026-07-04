// scripts/check-db.js
// Usage : node scripts/check-db.js
// Vérifie que MONGODB_URI est valide et que la connexion fonctionne réellement.

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI n'est pas défini dans .env.local");
    process.exit(1);
  }

  console.log("→ Tentative de connexion à MongoDB...");

  try {
    await mongoose.connect(uri);
    console.log("✅ Connexion réussie !");

    // On affiche le nom réel de la base utilisée, pour vérifier
    // que ce n'est pas "test" par erreur (oubli du nom de base dans l'URI)
    console.log(`→ Base de données active : "${mongoose.connection.db.databaseName}"`);

    // Liste les collections existantes (vide au premier lancement, normal)
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(
      `→ Collections existantes : ${
        collections.length ? collections.map((c) => c.name).join(", ") : "(aucune encore)"
      }`
    );

    await mongoose.disconnect();
    console.log("✅ Tout est en ordre, tu peux lancer `npm run dev`.");
  } catch (err) {
    console.error("❌ Échec de connexion :", err.message);
    console.error(
      "\nVérifie : 1) ton mot de passe est bien encodé en URL, 2) ton IP est autorisée dans Atlas > Network Access, 3) le nom de la base est présent dans l'URI."
    );
    process.exit(1);
  }
}

main();
