# MedPage - Site web pour cabinets médicaux

Projet Next.js permettant aux professionnels de santé de créer des sites web personnalisés pour leur cabinet médical.

## 🚀 Corrections apportées (Audit & Cleanup)

### 1. Cartes Google Maps
- **Problème** : Les cartes Google Maps ne s'affichaient pas correctement
- **Solution** : Amélioration de la fonction `buildEmbedUrl` dans `LocationMap.jsx` pour gérer les liens courts Google Maps et utiliser l'API Google Maps Embed quand disponible
- **Fichier modifié** : `app/components/site-sections/LocationMap.jsx`

### 2. Système de paiement (Migration Stripe → Paddle)
- **Problème** : Incohérence majeure - mélange de code Stripe et Paddle
- **Solutions** :
  - Remplacement complet du code Stripe par Paddle dans `app/api/paddle/checkout/route.js`
  - Mise à jour de tous les fichiers utilisant `stripeSubscriptionStatus` → `paddleSubscriptionStatus`
  - Suppression de la dépendance Stripe du `package.json`
  - Correction des références dans les fichiers admin et dashboard
- **Fichiers modifiés** :
  - `app/api/paddle/checkout/route.js`
  - `app/dashboard/abonnement/page.js`
  - `app/admin/page.js`
  - `app/admin/revenus/page.js`
  - `app/api/admin/site-action/route.js`
  - `lib/siteAccess.js`
  - `app/api/create-site/route.js`
  - `app/api/sites/update/route.js`
  - `package.json`

### 3. Configuration middleware et authentification
- **Problème** : Erreurs de build liées au middleware NextAuth
- **Solution** : Correction de l'export `auth` dans `auth.config.js` et ajustement du middleware
- **Fichiers modifiés** :
  - `middleware.ts`
  - `auth.config.js`

### 4. Configuration et documentation
- **Ajout** : Fichier `.env.example` avec toutes les variables d'environnement nécessaires
- **Fichiers créés** : `.env.example`

## 📋 Variables d'environnement requises

Copiez le fichier `.env.example` vers `.env.local` et configurez les variables suivantes :

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/medpage

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Domain Configuration
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Paddle Configuration
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your-paddle-client-token
PADDLE_API_KEY=your-paddle-api-key
PADDLE_WEBHOOK_SECRET=your-paddle-webhook-secret
PADDLE_PRICE_ID=your-paddle-price-id

# Google Maps (pour les cartes de localisation)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Cloudinary (pour l'upload d'images)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Resend (pour les emails)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=MedPage <bonjour@medpage.fr>

# Cron Jobs (pour les emails de rappel d'essai)
CRON_SECRET=your-cron-secret-here
```

## 🛠️ Installation et développement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Lancer en production
npm start
```

## 🚀 Déploiement

### Prérequis
- Base de données MongoDB (MongoDB Atlas recommandé)
- Compte Paddle configuré avec un produit et un prix
- Compte Cloudinary pour l'hébergement d'images
- Compte Resend pour l'envoi d'emails
- Clé API Google Maps (optionnel pour les cartes)

### Étapes de déploiement

1. **Configurer les variables d'environnement** sur votre plateforme d'hébergement (Vercel, Railway, etc.)

2. **Configurer Paddle** :
   - Créer un produit et un prix dans le dashboard Paddle
   - Configurer le webhook vers `https://votre-domaine.com/api/paddle/webhook`
   - Récupérer le `PADDLE_PRICE_ID`, `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`

3. **Configurer Cloudinary** :
   - Créer un compte Cloudinary
   - Configurer un upload preset unsigned pour les uploads d'images
   - Récupérer les identifiants Cloudinary

4. **Configurer Resend** :
   - Créer un compte Resend
   - Vérifier votre domaine d'envoi
   - Récupérer la clé API

5. **Déployer** :
   ```bash
   # Si vous utilisez Vercel
   vercel
   
   # Ou builder et déployer manuellement
   npm run build
   # Déployer le dossier .next
   ```

## 📁 Structure du projet

```
├── app/
│   ├── api/              # Routes API
│   │   ├── paddle/       # Intégration Paddle
│   │   ├── auth/         # Authentification NextAuth
│   │   └── ...
│   ├── components/       # Composants React
│   ├── dashboard/        # Pages dashboard
│   ├── admin/           # Pages admin
│   └── sites/           # Pages des sites clients
├── lib/                 # Utilitaires et helpers
├── models/              # Schémas Mongoose
├── middleware.ts        # Middleware Next.js
└── package.json         # Dépendances
```

## ✅ Build réussi

Le projet compile maintenant sans erreur :
- ✅ TypeScript : OK
- ✅ Build Next.js : OK
- ✅ Middleware : OK
- ✅ Toutes les routes : OK

## 🔧 Points d'attention

1. **Middleware deprecated warning** : Next.js 16 indique que le middleware est déprécié au profit de "proxy". Cela fonctionne encore mais pourrait nécessiter une mise à jour future.

2. **Google Maps API** : Pour les cartes de localisation, il faut une clé API Google Maps. Sans cela, les cartes afficheront un lien externe au lieu d'une carte intégrée.

3. **Paddle Sandbox** : Par défaut, l'environnement Paddle est configuré en "sandbox". Pensez à changer `NEXT_PUBLIC_PADDLE_ENVIRONMENT` en "production" pour le déploiement.

## 📞 Support

Pour toute question concernant la configuration ou le déploiement, consultez la documentation officielle :
- [Next.js](https://nextjs.org/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Paddle](https://developer.paddle.com)
- [MongoDB](https://docs.mongodb.com)
