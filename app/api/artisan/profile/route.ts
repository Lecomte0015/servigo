import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiForbidden, apiServerError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { geocodeCity } from "@/lib/geocoding";
import { normalizeCity } from "@/lib/normalize";
import { z } from "zod";

const updateSchema = z.object({
  companyName: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  city: z.string().min(1).max(50).optional(),
  emergencyAvailable: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
  phone: z.string().max(20).optional().nullable(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;
  if (auth.payload.role !== "ARTISAN") return apiForbidden();

  try {
    const profile = await prisma.artisanProfile.findUnique({
      where: { userId: auth.payload.userId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        services: {
          include: { category: { select: { name: true, slug: true } } },
        },
      },
    });

    return apiSuccess(profile);
  } catch {
    return apiServerError();
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;
  if (auth.payload.role !== "ARTISAN") return apiForbidden();

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return apiSuccess({ error: "Données invalides" });
    }

    const { firstName, lastName, phone, ...profileData } = parsed.data;

    // Update user personal info if provided
    if (firstName || lastName || phone !== undefined) {
      await prisma.user.update({
        where: { id: auth.payload.userId },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone !== undefined && { phone }),
        },
      });
    }

    // Geocode city if it changed (async, don't block)
    let geoData: { latitude?: number; longitude?: number } = {};
    if (profileData.city) {
      const coords = await geocodeCity(normalizeCity(profileData.city));
      if (coords) {
        geoData = { latitude: coords.lat, longitude: coords.lng };
      }
    }

    const updated = await prisma.artisanProfile.update({
      where: { userId: auth.payload.userId },
      data: {
        ...(profileData.companyName && { companyName: profileData.companyName }),
        ...(profileData.description !== undefined && { description: profileData.description }),
        ...(profileData.city && { city: normalizeCity(profileData.city) }),
        ...(profileData.emergencyAvailable !== undefined && {
          emergencyAvailable: profileData.emergencyAvailable,
        }),
        ...(profileData.onboardingCompleted !== undefined && {
          onboardingCompleted: profileData.onboardingCompleted,
        }),
        ...geoData, // lat/lng mis à jour si city changée
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    return apiSuccess(updated);
  } catch {
    return apiServerError();
  }
}
