import { prisma } from "@/lib/prisma";
import type { NotificationPayload } from "@/types";

export async function createNotification(payload: NotificationPayload): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      message: payload.message,
      ...(payload.link ? { link: payload.link } : {}),
    },
  });
}

export async function markNotificationsRead(
  userId: string,
  notificationIds: string[]
): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: { in: notificationIds }, userId },
    data: { read: true },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}
