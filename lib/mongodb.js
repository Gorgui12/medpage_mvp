// lib/mongodb.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Merci de définir la variable d'environnement MONGODB_URI dans .env.local"
  );
}

/**
 * En développement, Next.js recharge les modules à chaud (HMR), ce qui peut
 * créer une nouvelle connexion Mongoose à chaque requête. On met donc le
 * client en cache sur l'objet global pour réutiliser la même connexion.
 * C'est le pattern officiellement recommandé par Vercel/Next.js + Mongoose.
 */
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default dbConnect;
