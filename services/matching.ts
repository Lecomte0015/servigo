import { prisma } from "@/lib/prisma";
import { createNotification } from "@/services/notification";

const MAX_ARTISANS_NOTIFIED = 5;

/**
 * Finds the best available artisans for a job and notifies them.
 * Selection criteria:
 *  - Same city as the job
 *  - Approved profile
 *  - Emergency available
 *  - Offers the requested service category (active)
 * Sorted by rating DESC.
 */
export async function matchArtisans(
  jobId: string,
  categoryId: string,
  city: string
): Promise<void> {
  const artisans = await prisma.artisanProfile.findMany({
    where: {
      city,
      isApproved: true,
      emergencyAvailable: true,
      services: {
        some: {
          categoryId,
          isActive: true,
        },
      },
    },
    orderBy: { ratingAverage: "desc" },
    take: MAX_ARTISANS_NOTIFIED,
    include: {
      user: { select: { id: true, firstName: true } },
      services: {
        where: { categoryId, isActive: true },
        select: { basePrice: true, emergencyFee: true },
      },
    },
  });

  if (artisans.length === 0) {
    // No artisan available — update job status back to PENDING
    await prisma.jobRequest.update({
      where: { id: jobId },
      data: { status: "PENDING" },
    });
    return;
  }

  // Notify each matched artisan
  await Promise.allSettled(
    artisans.map((artisan) =>
      createNotification({
        userId: artisan.user.id,
        type: "JOB_MATCHED",
        message: `Nouvelle demande à ${city} — Acceptez vite !`,
      })
    )
  );
}

/**
 * Notifie un artisan spécifique d'une demande directe (via carte interactive).
 * Si l'artisan n'existe pas ou n'est pas approuvé, remet le job en PENDING.
 */
export async function notifyTargetArtisan(
  jobId: string,
  artisanId: string,
  city: string
): Promise<void> {
  const artisan = await prisma.artisanProfile.findUnique({
    where: { id: artisanId, isApproved: true },
    include: { user: { select: { id: true, firstName: true } } },
  });

  if (!artisan) {
    // Artisan non trouvé ou non approuvé → fallback matching classique
    const job = await prisma.jobRequest.findUnique({
      where: { id: jobId },
      select: { categoryId: true },
    });
    if (job) {
      await matchArtisans(jobId, job.categoryId, city);
    }
    return;
  }

  await createNotification({
    userId: artisan.user.id,
    type: "JOB_MATCHED",
    message: `Un client vous a envoyé une demande directe — Acceptez vite !`,
  });
}

/**
 * Returns artisans available for a given category in a city,
 * with estimated prices.
 */
export async function getAvailableArtisans(categoryId: string, city: string) {
  return prisma.artisanProfile.findMany({
    where: {
      city,
      isApproved: true,
      emergencyAvailable: true,
      services: { some: { categoryId, isActive: true } },
    },
    orderBy: { ratingAverage: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true } },
      services: {
        where: { categoryId },
        select: { basePrice: true, emergencyFee: true },
      },
    },
  });
}
