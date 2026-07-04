// lib/emails.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "MedPage <bonjour@medpage.fr>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.medpage.fr";
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "medpage.fr";

/**
 * Envoie l'email de bienvenue juste après la création du compte + site.
 */
export async function sendWelcomeEmail({ to, doctorName, subdomain, trialEndsAt }) {
  const siteUrl = `https://${subdomain}.${ROOT_DOMAIN}`;
  const trialEnd = new Date(trialEndsAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Bienvenue sur MedPage, Dr. ${doctorName} !`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <body style="font-family: -apple-system, sans-serif; color: #1e293b; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 700; color: #0EA5A8;">MedPage</span>
        </div>

        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
          Bienvenue, Dr. ${doctorName} !
        </h1>
        <p style="color: #64748b; margin-bottom: 24px;">
          Votre site est créé et déjà en ligne. Votre essai gratuit est actif
          jusqu'au <strong>${trialEnd}</strong>.
        </p>

        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">Votre site est accessible ici :</p>
          <a href="${siteUrl}" style="font-weight: 600; color: #0EA5A8; text-decoration: none; font-size: 15px;">
            ${siteUrl}
          </a>
        </div>

        <p style="margin-bottom: 16px; font-weight: 600;">Prochaines étapes :</p>
        <ol style="padding-left: 20px; color: #475569; line-height: 1.8;">
          <li>Ajoutez votre photo de profil et votre présentation</li>
          <li>Partagez votre lien à vos patients</li>
          <li>Activez votre abonnement avant la fin de l'essai</li>
        </ol>

        <div style="margin-top: 32px;">
          <a href="${APP_URL}/dashboard"
             style="background: #0f172a; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block;">
            Accéder à mon dashboard
          </a>
        </div>

        <p style="margin-top: 40px; font-size: 12px; color: #94a3b8;">
          Vous recevez cet email car vous venez de créer un compte sur MedPage.
          <a href="${APP_URL}" style="color: #94a3b8;">medpage.fr</a>
        </p>
      </body>
      </html>
    `,
  });
}

/**
 * Email envoyé 3 jours avant la fin du trial.
 */
export async function sendTrialEndingSoonEmail({ to, doctorName, daysRemaining, trialEndsAt }) {
  const trialEnd = new Date(trialEndsAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });

  return resend.emails.send({
    from: FROM,
    to,
    subject: `⏳ Votre essai MedPage se termine dans ${daysRemaining} jours`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <body style="font-family: -apple-system, sans-serif; color: #1e293b; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 700; color: #0EA5A8;">MedPage</span>
        </div>

        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-weight: 600; color: #92400e; margin: 0 0 4px;">
            ⏳ Votre essai se termine le ${trialEnd}
          </p>
          <p style="color: #92400e; font-size: 14px; margin: 0;">
            Dans ${daysRemaining} jours, votre site ne sera plus visible si vous n'activez pas votre abonnement.
          </p>
        </div>

        <p>Bonjour Dr. ${doctorName},</p>
        <p style="color: #64748b;">
          Nous espérons que MedPage vous a été utile. Pour continuer à
          bénéficier de votre site et des prises de rendez-vous en ligne,
          activez votre abonnement maintenant.
        </p>

        <div style="margin: 32px 0;">
          <a href="${APP_URL}/dashboard/abonnement"
             style="background: #0f172a; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block;">
            Activer mon abonnement
          </a>
        </div>

        <p style="font-size: 13px; color: #94a3b8;">
          Des questions ? Répondez directement à cet email.
        </p>
      </body>
      </html>
    `,
  });
}

/**
 * Email envoyé le jour de l'expiration du trial.
 */
export async function sendTrialExpiredEmail({ to, doctorName }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Votre essai MedPage a expiré`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <body style="font-family: -apple-system, sans-serif; color: #1e293b; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 700; color: #0EA5A8;">MedPage</span>
        </div>

        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-weight: 600; color: #991b1b; margin: 0;">
            Votre site n'est plus visible publiquement
          </p>
        </div>

        <p>Bonjour Dr. ${doctorName},</p>
        <p style="color: #64748b;">
          Votre essai gratuit de 14 jours est terminé. Votre site existe toujours
          et toutes vos données sont conservées — il vous suffit d'activer votre
          abonnement pour le remettre en ligne immédiatement.
        </p>

        <div style="margin: 32px 0;">
          <a href="${APP_URL}/dashboard/abonnement"
             style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block;">
            Réactiver mon site maintenant
          </a>
        </div>

        <p style="font-size: 13px; color: #94a3b8;">
          Vos données sont conservées pendant 30 jours après l'expiration.
        </p>
      </body>
      </html>
    `,
  });
}
