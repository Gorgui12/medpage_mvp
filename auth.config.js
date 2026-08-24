// auth.config.js

/**
 * Configuration "légère" d'Auth.js, SANS provider Credentials ni import
 * Mongoose. Utilisée uniquement par le middleware (qui tourne en Edge
 * Runtime et ne peut pas exécuter de connexion MongoDB/Mongoose).
 *
 * Le middleware se contente de vérifier la présence/validité du JWT de
 * session pour décider d'un redirect — il n'a jamais besoin d'interroger
 * la base de données lui-même.
 *
 * La configuration complète (avec le provider Credentials qui, lui,
 * interroge MongoDB) vit dans auth.js et est utilisée par les Route
 * Handlers et Server Components, qui tournent en Node.js runtime complet.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  // Nécessaire en production (next start / self-host) : sans ça, Auth.js
  // rejette toute requête avec UntrustedHost car l'host ne peut pas être
  // inféré de manière fiable derrière un reverse-proxy.
  trustHost: true,
  providers: [], // volontairement vide ici ; les providers réels sont dans auth.js
  callbacks: {
    async session({ session, token }) {
      if (token?.userId) {
        session.user.id = token.userId;
      }
      if (token?.isAdmin !== undefined) {
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
