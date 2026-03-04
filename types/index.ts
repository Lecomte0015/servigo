import type { Role, UrgencyLevel, JobStatus, PaymentStatus } from "@prisma/client";

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
}

// ─── API Responses ──────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  totalRevenue?: number;
  averageRating?: number;
}

// ─── Job ────────────────────────────────────────────────────────────────────

export interface JobRequestWithDetails {
  id: string;
  description: string;
  address: string;
  city: string;
  urgencyLevel: UrgencyLevel;
  status: JobStatus;
  estimatedPrice: number | null;
  createdAt: Date;
  category: { id: string; name: string; slug: string };
  client: { id: string; firstName: string; lastName: string; phone: string | null };
  assignment?: {
    artisan: {
      companyName: string;
      ratingAverage: number;
      user: { phone: string | null };
    };
    startedAt: Date | null;
    completedAt: Date | null;
    finalPrice: number | null;
  };
  payment?: { status: PaymentStatus; amount: number };
  review?: { rating: number; comment: string | null };
}

// ─── Artisan ─────────────────────────────────────────────────────────────────

export interface ArtisanWithServices {
  id: string;
  companyName: string;
  city: string;
  ratingAverage: number;
  ratingCount: number;
  emergencyAvailable: boolean;
  isApproved: boolean;
  description: string | null;
  services: Array<{
    category: { name: string; slug: string };
    basePrice: number;
    emergencyFee: number;
  }>;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
}

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationType =
  | "JOB_MATCHED"
  | "JOB_ASSIGNED"
  | "JOB_STARTED"
  | "JOB_COMPLETED"
  | "REVIEW_RECEIVED"
  | "PROFILE_APPROVED"
  | "PAYMENT_CAPTURED";

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  message: string;
}
