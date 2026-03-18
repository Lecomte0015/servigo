import { z } from "zod";
import { normalizeCity } from "@/lib/normalize";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerClientSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
  phone: z.string().optional(),
});

export const registerArtisanSchema = registerClientSchema.extend({
  companyName: z.string().min(2, "Nom entreprise requis"),
  rcNumber: z.string().min(3, "Numéro RC requis"),
  city: z.string().trim().min(2, "Ville requise").transform(normalizeCity),
  description: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// ─── Job ────────────────────────────────────────────────────────────────────

export const createJobSchema = z.object({
  categoryId: z.string().uuid("Catégorie invalide"),
  description: z.string().min(10, "Description trop courte (min 10 caractères)"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().trim().min(2, "Ville requise").transform(normalizeCity),
  urgencyLevel: z.enum(["STANDARD", "URGENT"]),
  scheduledAt: z.string().optional(), // date planifiée (STANDARD uniquement)
  targetArtisanId: z.string().uuid().optional(), // demande directe depuis la carte
}).refine(
  (data) => data.urgencyLevel === "URGENT" || !!data.scheduledAt,
  { message: "Veuillez choisir une date d'intervention", path: ["scheduledAt"] }
);

// ─── Review ──────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  jobId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// ─── Artisan Service ─────────────────────────────────────────────────────────

export const artisanServiceSchema = z.object({
  categoryId: z.string().uuid(),
  basePrice: z.number().positive("Prix requis"),
  emergencyFee: z.number().min(0),
  isActive: z.boolean().default(true),
});

// ─── Profile Update ──────────────────────────────────────────────────────────

export const updateArtisanProfileSchema = z.object({
  companyName: z.string().min(2).optional(),
  description: z.string().max(1000).optional(),
  phone: z.string().optional(),
  emergencyAvailable: z.boolean().optional(),
});

export type RegisterClientInput = z.infer<typeof registerClientSchema>;
export type RegisterArtisanInput = z.infer<typeof registerArtisanSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ArtisanServiceInput = z.infer<typeof artisanServiceSchema>;
export type UpdateArtisanProfileInput = z.infer<typeof updateArtisanProfileSchema>;
