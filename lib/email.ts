/**
 * ServiGo — Email Service (Resend)
 *
 * Usage:
 *   import { sendWelcomeEmail } from "@/lib/email";
 *   await sendWelcomeEmail(user.email, user.firstName);
 *
 * In dev without RESEND_API_KEY: emails are logged to console.
 * In prod: set RESEND_API_KEY + verify your domain on resend.com.
 */

import { Resend } from "resend";
import { emailLogger } from "@/lib/logger";

const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_REPLACE_WITH_YOUR_KEY"
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "ServiGo <noreply@servigo.ch>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Base HTML Template ─────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ServiGo</title>
</head>
<body style="margin:0;padding:0;background:#F4F7F7;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">
    <!-- Card -->
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1CA7A6 0%,#159895 100%);padding:28px 36px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px">ServiGo</span>
              <p style="margin:2px 0 0;color:rgba(255,255,255,0.75);font-size:12px">La plateforme des artisans suisses</p>
            </td>
          </tr>
        </table>
      </div>
      <!-- Content -->
      <div style="padding:36px;">
        ${content}
      </div>
      <!-- Footer -->
      <div style="padding:20px 36px;background:#F4F7F7;border-top:1px solid #E6F2F2;text-align:center;">
        <p style="margin:0;color:#9CA3AF;font-size:11px;line-height:1.6">
          © 2026 ServiGo SA · Genève, Suisse<br>
          <a href="${APP_URL}" style="color:#1CA7A6;text-decoration:none">servigo.ch</a>
          &nbsp;·&nbsp;
          <a href="${APP_URL}/support" style="color:#9CA3AF;text-decoration:none">Support</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Send Helper ────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    // Dev mode: log instead of sending
    emailLogger.debug({ to, subject }, "📧 [EMAIL DEV MODE] Set RESEND_API_KEY to send real emails");
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    emailLogger.error({ err, to, subject }, "Email send error");
    // Don't throw — email failure should not break the main flow
  }
}

// ─── Button Helper ──────────────────────────────────────────────────────────

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:13px 28px;background:#1CA7A6;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;letter-spacing:0.2px">${label} →</a>`;
}

function infoBox(bg: string, border: string, textColor: string, content: string): string {
  return `<div style="background:${bg};border:1px solid ${border};border-radius:8px;padding:16px;margin:20px 0;"><p style="margin:0;color:${textColor};font-size:14px;line-height:1.6">${content}</p></div>`;
}

// ─── 1. Bienvenue Client ────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  const html = baseTemplate(`
    <h2 style="margin:0 0 6px;color:#1F2937;font-size:20px;font-weight:700">Bienvenue sur ServiGo, ${firstName} ! 🎉</h2>
    <p style="color:#6B7280;line-height:1.7;margin:0 0 20px">Votre compte est prêt. Vous pouvez dès maintenant :</p>
    <ul style="color:#6B7280;line-height:2;margin:0 0 24px;padding-left:20px">
      <li>Poster vos demandes de services en quelques clics</li>
      <li>Trouver des artisans vérifiés près de chez vous</li>
      <li>Payer en toute sécurité via la plateforme</li>
    </ul>
    ${btn(`${APP_URL}/dashboard`, "Accéder à mon espace")}
    <p style="color:#9CA3AF;font-size:12px;margin-top:24px">Vous avez une question ? Contactez-nous à <a href="mailto:support@servigo.ch" style="color:#1CA7A6">support@servigo.ch</a></p>
  `);
  await sendEmail(to, "🎉 Bienvenue sur ServiGo !", html);
}

// ─── 2. Bienvenue Artisan ───────────────────────────────────────────────────

export async function sendWelcomeArtisanEmail(to: string, firstName: string): Promise<void> {
  const html = baseTemplate(`
    <h2 style="margin:0 0 6px;color:#1F2937;font-size:20px;font-weight:700">Bienvenue sur ServiGo, ${firstName} ! 🔨</h2>
    <p style="color:#6B7280;line-height:1.7;margin:0 0 16px">Votre demande d'inscription artisan a bien été reçue. Notre équipe va examiner votre dossier dans les <strong>24-48h</strong>.</p>
    ${infoBox("#F4F7F7", "#D1E5E5", "#374151", `<strong>📋 Prochaines étapes :</strong><br><br>
      1. Complétez votre profil et vos services<br>
      2. Notre équipe valide votre dossier<br>
      3. Commencez à recevoir des missions !`)}
    ${btn(`${APP_URL}/pro/onboarding`, "Compléter mon profil")}
  `);
  await sendEmail(to, "🔨 Demande reçue — ServiGo Artisans", html);
}

// ─── 3. Vérification email ──────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  firstName: string,
  token: string
): Promise<void> {
  const link = `${APP_URL}/auth/verify-email?token=${token}`;
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-block;width:60px;height:60px;background:#E6F2F2;border-radius:50%;line-height:60px;font-size:28px">✉️</div>
    </div>
    <h2 style="margin:0 0 6px;color:#1F2937;font-size:20px;font-weight:700;text-align:center">Confirmez votre adresse email</h2>
    <p style="color:#6B7280;line-height:1.7;text-align:center;margin:0 0 24px">Bonjour ${firstName},<br>Cliquez sur le bouton ci-dessous pour activer votre compte ServiGo.</p>
    <div style="text-align:center">${btn(link, "Vérifier mon email")}</div>
    ${infoBox("#FFFBEB", "#FDE68A", "#92400E", "⏱ Ce lien est valable <strong>24 heures</strong>. Si vous n'avez pas créé de compte, ignorez simplement cet email.")}
    <p style="color:#9CA3AF;font-size:12px;word-break:break-all;text-align:center">Lien direct : <a href="${link}" style="color:#1CA7A6">${link}</a></p>
  `);
  await sendEmail(to, "✉️ Confirmez votre adresse email — ServiGo", html);
}

// ─── 4. Réinitialisation mot de passe ──────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  token: string
): Promise<void> {
  const link = `${APP_URL}/auth/reset-password?token=${token}`;
  const html = baseTemplate(`
    <h2 style="margin:0 0 6px;color:#1F2937;font-size:20px;font-weight:700">Réinitialisation de mot de passe</h2>
    <p style="color:#6B7280;line-height:1.7;margin:0 0 20px">Bonjour ${firstName},<br>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
    ${btn(link, "Réinitialiser mon mot de passe")}
    ${infoBox("#FFFBEB", "#FDE68A", "#92400E", "⏱ Ce lien est valable <strong>1 heure</strong>. Si vous n'avez pas effectué cette demande, ignorez simplement cet email — votre compte reste sécurisé.")}
    <p style="color:#9CA3AF;font-size:12px;word-break:break-all">Lien direct : <a href="${link}" style="color:#1CA7A6">${link}</a></p>
  `);
  await sendEmail(to, "Réinitialisation de votre mot de passe ServiGo", html);
}

// ─── 4. Profil artisan approuvé ─────────────────────────────────────────────

export async function sendArtisanApprovedEmail(
  to: string,
  firstName: string
): Promise<void> {
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-block;width:60px;height:60px;background:#D1FAE5;border-radius:50%;line-height:60px;font-size:28px">✅</div>
    </div>
    <h2 style="margin:0 0 6px;color:#1F2937;font-size:20px;font-weight:700;text-align:center">Profil approuvé, ${firstName} !</h2>
    <p style="color:#6B7280;line-height:1.7;text-align:center;margin:0 0 24px">Félicitations ! Votre profil artisan a été <strong>validé</strong> par notre équipe. Vous pouvez maintenant recevoir et accepter des missions.</p>
    ${infoBox("#F0FDF4", "#86EFAC", "#166534", "🚀 <strong>Conseil :</strong> Complétez votre profil avec une photo et une description détaillée pour obtenir 3x plus de missions.")}
    <div style="text-align:center">${btn(`${APP_URL}/pro/jobs`, "Voir les missions disponibles")}</div>
  `);
  await sendEmail(to, "✅ Votre profil artisan est approuvé !", html);
}

// ─── 5. Profil artisan refusé ───────────────────────────────────────────────

export async function sendArtisanRejectedEmail(
  to: string,
  firstName: string,
  reason: string
): Promise<void> {
  const html = baseTemplate(`
    <h2 style="margin:0 0 6px;color:#1F2937;font-size:20px;font-weight:700">Demande d'inscription non approuvée</h2>
    <p style="color:#6B7280;line-height:1.7;margin:0 0 16px">Bonjour ${firstName},<br>Après examen de votre dossier, nous ne sommes pas en mesure de valider votre profil pour le motif suivant :</p>
    ${infoBox("#FEF2F2", "#FCA5A5", "#991B1B", reason)}
    <p style="color:#6B7280;line-height:1.7;margin:0 0 24px">Vous pouvez corriger les points mentionnés et nous soumettre à nouveau votre dossier, ou contacter notre support.</p>
    ${btn(`${APP_URL}/pro/profile`, "Mettre à jour mon profil")}
  `);
  await sendEmail(to, "Dossier artisan ServiGo — Action requise", html);
}

// ─── 6. Nouvelle mission disponible (artisan) ───────────────────────────────

export async function sendNewJobEmail(
  to: string,
  firstName: string,
  jobDescription: string,
  city: string,
  category: string,
  jobId: string
): Promise<void> {
  const html = baseTemplate(`
    ${infoBox("#F0FDF4", "#86EFAC", "#166534", `🔔 <strong>Nouvelle mission disponible !</strong><br>${category} · 📍 ${city}`)}
    <h2 style="margin:0 0 6px;color:#1F2937;font-size:20px;font-weight:700">Bonjour ${firstName},</h2>
    <p style="color:#6B7280;line-height:1.7;margin:0 0 12px">Une mission correspond à vos services :</p>
    <div style="background:#F4F7F7;border-radius:8px;padding:16px;margin:0 0 24px">
      <p style="margin:0;color:#1F2937;font-size:14px;line-height:1.7;font-style:italic">"${jobDescription}"</p>
    </div>
    ${btn(`${APP_URL}/pro/jobs`, "Voir la mission")}
    <p style="color:#9CA3AF;font-size:12px;margin-top:20px">⏱ Les artisans qui répondent en moins d'1 heure obtiennent 3x plus de missions.</p>
  `);
  await sendEmail(to, `🔔 Nouvelle mission ${category} à ${city}`, html);
}

// ─── 7. Job accepté (client) ────────────────────────────────────────────────

export async function sendJobAcceptedEmail(
  to: string,
  clientFirstName: string,
  artisanCompany: string,
  artisanPhone: string | null,
  city: string
): Promise<void> {
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-block;width:60px;height:60px;background:#EFF6FF;border-radius:50%;line-height:60px;font-size:28px">🔨</div>
    </div>
    <h2 style="margin:0 0 6px;color:#1F2937;font-size:20px;font-weight:700;text-align:center">Mission acceptée !</h2>
    <p style="color:#6B7280;line-height:1.7;text-align:center;margin:0 0 20px">Bonjour ${clientFirstName},<br><strong>${artisanCompany}</strong> a accepté votre mission.</p>
    ${artisanPhone ? infoBox("#F4F7F7", "#D1E5E5", "#374151", `📞 Vous pouvez contacter votre artisan au <strong>${artisanPhone}</strong> pour convenir des détails.`) : ""}
    <div style="text-align:center">${btn(`${APP_URL}/dashboard/history`, "Voir ma mission")}</div>
  `);
  await sendEmail(to, `✅ Votre mission à ${city} a été acceptée`, html);
}

// ─── 8. Statut payout artisan ───────────────────────────────────────────────

export async function sendPayoutStatusEmail(
  to: string,
  firstName: string,
  amount: number,
  status: "PROCESSING" | "COMPLETED" | "FAILED",
  adminNotes?: string
): Promise<void> {
  const configs = {
    PROCESSING: {
      subject: "🔄 Votre virement est en cours de traitement",
      icon: "🔄",
      title: "Virement en cours de traitement",
      bg: "#EFF6FF", border: "#93C5FD", textColor: "#1E40AF",
      body: `Votre retrait de <strong>${amount.toFixed(2)} CHF</strong> est en cours de traitement. Le virement sera effectué sur votre compte bancaire sous <strong>1-3 jours ouvrés</strong>.`,
    },
    COMPLETED: {
      subject: "✅ Virement effectué avec succès",
      icon: "✅",
      title: "Virement effectué !",
      bg: "#F0FDF4", border: "#86EFAC", textColor: "#065F46",
      body: `Votre retrait de <strong>${amount.toFixed(2)} CHF</strong> a été viré avec succès sur votre compte bancaire.`,
    },
    FAILED: {
      subject: "⚠️ Problème avec votre demande de retrait",
      icon: "⚠️",
      title: "Retrait non traité",
      bg: "#FEF2F2", border: "#FCA5A5", textColor: "#991B1B",
      body: `Votre demande de retrait de <strong>${amount.toFixed(2)} CHF</strong> n'a pas pu être traitée.${adminNotes ? ` Motif : ${adminNotes}` : ""} Contactez notre support.`,
    },
  };
  const c = configs[status];
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;width:60px;height:60px;background:${c.bg};border-radius:50%;line-height:60px;font-size:28px">${c.icon}</div>
    </div>
    <h2 style="margin:0 0 6px;color:#1F2937;font-size:20px;font-weight:700;text-align:center">${c.title}</h2>
    <p style="color:#6B7280;line-height:1.7;text-align:center;margin:0 0 16px">Bonjour ${firstName},</p>
    ${infoBox(c.bg, c.border, c.textColor, c.body)}
    <div style="text-align:center">${btn(`${APP_URL}/pro/wallet`, "Voir mon wallet")}</div>
  `);
  await sendEmail(to, c.subject, html);
}
