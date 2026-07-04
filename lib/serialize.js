// lib/serialize.js

/**
 * Convertit récursivement un objet Mongoose en objet JavaScript simple
 * en convertissant tous les ObjectId en strings.
 * Utile pour passer des données aux Client Components qui ne peuvent pas
 * sérialiser les objets Mongoose.
 */
export function serializeMongoose(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Si c'est un ObjectId Mongoose (avec _bsontype)
  if (obj._bsontype === 'ObjectId') {
    return obj.toString();
  }

  // Si c'est un tableau, on applique récursivement
  if (Array.isArray(obj)) {
    return obj.map(serializeMongoose);
  }

  // Si c'est un objet simple
  if (typeof obj === 'object') {
    const plain = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Convertir _id en string
        if (key === '_id' && obj[key] && obj[key]._bsontype === 'ObjectId') {
          plain[key] = obj[key].toString();
        } else {
          plain[key] = serializeMongoose(obj[key]);
        }
      }
    }
    return plain;
  }

  // Pour les types primitifs (string, number, boolean)
  return obj;
}
