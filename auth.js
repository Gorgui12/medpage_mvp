// auth.js
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyPassword } from "@/lib/password";
import { authConfig } from "@/auth.config";

/**
 * Configuration COMPLÈTE d'Auth.js, utilisée par les Route Handlers et
 * Server Components (Node.js runtime complet, donc Mongoose fonctionne).
 * Étend authConfig (utilisée seule par le middleware en Edge Runtime)
 * en y ajoutant le provider Credentials, qui a besoin de Mongoose pour
 * vérifier l'email/mot de passe en base.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  // Stratégie JWT : pas besoin d'adapter de base de données pour les
  // sessions elles-mêmes, ce qui simplifie l'intégration avec Mongoose
  // (Auth.js n'a pas d'adapter MongoDB officiel "léger" pour Mongoose).
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();

        if (!email || !password) return null;

        await dbConnect();

        // .select("+passwordHash") : nécessaire car le champ est exclu
        // par défaut (select: false) dans le schéma User.
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        // Ce qui est renvoyé ici devient disponible dans le token JWT,
        // puis dans session.user côté client/serveur.
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName || user.email,
          isAdmin: user.isAdmin || false,
        };
      },
    }),
  ],

  callbacks: {
    // On propage l'id utilisateur dans le token JWT...
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.isAdmin = user.isAdmin || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        session.user.id = token.userId;
        session.user.isAdmin = token.isAdmin || false;
      }
      return session;
    },
  },
});
