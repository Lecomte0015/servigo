# ServiGo — Roadmap SaaS

Analyse des fonctionnalités manquantes pour un SaaS de mise en relation pleinement opérationnel.

---

## 🔴 CRITIQUE — Bloquant pour le lancement

### 1. Emails transactionnels (Resend / SendGrid)
Actuellement : zéro email envoyé.
- [ ] Confirmation d'inscription (client + artisan)
- [ ] Vérification d'adresse email
- [ ] Nouvelle mission disponible → notifier les artisans matchés
- [ ] Artisan assigné → email au client avec coordonnées
- [ ] Mission terminée → email de confirmation + lien d'avis
- [ ] Reçu de paiement / facture PDF

### 2. Vérification d'email à l'inscription
- [ ] Champ `emailVerified` dans la BDD (Prisma)
- [ ] Token de vérification envoyé par email
- [ ] Route `GET /api/auth/verify-email?token=…`
- [ ] Bloquer l'accès au dashboard si email non vérifié

### 3. Réinitialisation du mot de passe
- [ ] Page `/auth/forgot-password`
- [ ] Page `/auth/reset-password?token=…`
- [ ] Table `PasswordReset` (token hashé, expiration)
- [ ] Route API + email avec lien sécurisé

### 4. Webhook Stripe
Sans ça, les paiements peuvent rester en suspens.
- [ ] Route `POST /api/webhooks/stripe`
- [ ] Vérifier la signature Stripe (`stripe.webhooks.constructEvent`)
- [ ] Gérer : `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- [ ] Mettre à jour le statut du job + notifier client/artisan

### 5. Flow d'approbation artisan (Admin)
Actuellement : `isApproved=false` par défaut, pas d'UI admin pour approuver.
- [ ] Page `/admin/artisans/[id]` — détail + bouton Approuver / Refuser
- [ ] Email à l'artisan lors de l'approbation
- [ ] Email à l'artisan lors du refus avec motif

### 6. Onboarding artisan post-inscription
Actuellement : l'artisan crée un compte mais ne renseigne pas ses infos pro.
- [ ] Étape 1 : Infos entreprise (nom société, RC, numéro TVA)
- [ ] Étape 2 : Catégories de services offerts
- [ ] Étape 3 : Zone d'intervention (villes, rayon km)
- [ ] Étape 4 : Tarif horaire + disponibilité urgence
- [ ] Blocage dashboard pro jusqu'à complétion

### 7. Notifications in-app (UI)
Les notifications sont créées en BDD mais jamais affichées.
- [ ] Cloche dans le header dashboard avec badge compteur
- [ ] Menu déroulant listant les notifications non lues
- [ ] Route `GET /api/notifications` + `PATCH /api/notifications/[id]/read`
- [ ] Polling toutes les 30s (ou SSE/WebSocket pour temps réel)

---

## 🟠 IMPORTANT — À faire avant la première beta

### 8. Annulation de mission par le client
- [ ] Bouton annuler visible si status = MATCHING ou ASSIGNED
- [ ] Règles métier : remboursement si MATCHING, frais si ASSIGNED
- [ ] Route `POST /api/jobs/[id]/cancel`
- [ ] Libération du PaymentIntent Stripe (cancel ou partial capture)

### 9. Page publique des services `/services`
Le lien dans la navbar pointe vers `/services` mais la page n'existe pas.
- [ ] Liste de toutes les catégories avec description
- [ ] Filtres par catégorie, disponibilité, urgence
- [ ] CTA vers `/auth/register`

### 10. Page `/comment-ca-marche`
Lien dans la navbar → page inexistante.
- [ ] Page statique présentant le flow client + artisan
- [ ] FAQ

### 11. Page `/devenir-artisan`
Lien dans la navbar → page inexistante.
- [ ] Landing page orientée artisan
- [ ] CTA vers inscription artisan

### 12. Profil public artisan
- [ ] Page `/artisans/[id]` avec bio, services, avis, note
- [ ] Accessible depuis la fiche de mission client

### 13. Gestion des litiges
- [ ] Client peut ouvrir un litige sur une mission COMPLETED
- [ ] Admin peut voir et résoudre les litiges
- [ ] Possibilité de remboursement partiel via Stripe

### 14. Rate limiting sur l'API
- [ ] Limiter les tentatives de login (ex. 5/min par IP)
- [ ] Limiter la création de jobs (anti-spam)
- [ ] Utiliser `proxy.ts` ou middleware séparé

### 15. Téléchargement de documents (photos de mission)
- [ ] Upload photo avant/après intervention (Uploadthing ou S3)
- [ ] Associé à la mission dans la BDD
- [ ] Visible dans le détail de mission client + artisan

---

## 🟡 UTILE — Pour une expérience complète

### 16. Facturation PDF
- [ ] Générer un PDF de facture après COMPLETED (react-pdf ou puppeteer)
- [ ] Téléchargeable depuis le dashboard client et artisan

### 17. Multi-ville / expansion géographique
Actuellement le matching est par ville exacte.
- [ ] Champ rayon d'action en km pour les artisans
- [ ] Matching par coordonnées GPS (PostGIS ou Haversine)
- [ ] Permettre aux artisans de couvrir plusieurs villes

### 18. SMS notifications (Twilio)
- [ ] SMS artisan quand nouvelle mission urgente
- [ ] SMS client quand artisan assigné

### 19. Tableau de bord analytics admin
- [ ] Revenus plateforme (10%) jour/semaine/mois
- [ ] Nombre de missions par catégorie
- [ ] Taux de conversion (demandes → assignées → complétées)
- [ ] Carte des missions par quartier (Leaflet.js)

### 20. Abonnements artisan (Stripe Subscription)
- [ ] Plan gratuit : 5 missions/mois
- [ ] Plan Pro : illimité + mise en avant
- [ ] Stripe Customer Portal pour gérer l'abonnement

### 21. Programme de parrainage
- [ ] Code de parrainage unique par client
- [ ] Crédit offert au parrain après 1ère mission du filleul

### 22. RGPD / Mentions légales
- [ ] Page CGU, CGV, Politique de confidentialité
- [ ] Bannière cookies (consentement)
- [ ] Route `DELETE /api/users/me` — suppression du compte et données

---

## 🔵 TECHNIQUE — Qualité & prod

### 23. Tests
- [ ] Tests unitaires (Jest) — lib/, services/
- [ ] Tests d'intégration — routes API critiques (auth, jobs, stripe)
- [ ] Tests E2E (Playwright) — parcours client complet + artisan complet

### 24. Sécurité
- [ ] Sanitisation HTML sur tous les champs texte libres (DOMPurify)
- [ ] Headers de sécurité (CSP, HSTS) via next.config.ts
- [ ] Audit des dépendances (`npm audit`)
- [ ] Rotation des tokens JWT (refresh token)

### 25. Performance
- [ ] Pagination sur toutes les listes admin
- [ ] Index PostgreSQL sur `jobs.status`, `jobs.city`, `assignments.artisanId`
- [ ] Image optimization (next/image) pour photos de mission
- [ ] Mise en cache des catégories (statiques)

### 26. Déploiement
- [ ] Vercel (Next.js) + Supabase (PostgreSQL)
- [ ] Variables d'environnement de production
- [ ] Pipeline CI/CD (GitHub Actions) : lint → tests → deploy
- [ ] Monitoring (Sentry) + logs (Vercel Analytics)
- [ ] Backups automatiques BDD

---

## Priorité suggérée pour lancer une beta privée

```
Sprint 1 (semaine 1-2) :
  ✅ Emails transactionnels (Resend)
  ✅ Vérification email
  ✅ Webhook Stripe
  ✅ Flow approbation artisan (UI admin)

Sprint 2 (semaine 3-4) :
  ✅ Onboarding artisan
  ✅ Notifications in-app
  ✅ Pages /services, /comment-ca-marche, /devenir-artisan
  ✅ Reset mot de passe

Sprint 3 (semaine 5-6) :
  ✅ Annulation mission
  ✅ Facturation PDF
  ✅ Rate limiting
  ✅ Tests E2E critiques

Launch 🚀
```
