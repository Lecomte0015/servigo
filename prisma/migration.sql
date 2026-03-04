-- ============================================================
-- ServiGo — Migration complète
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enums
CREATE TYPE "Role" AS ENUM ('CLIENT', 'ARTISAN', 'ADMIN');
CREATE TYPE "UrgencyLevel" AS ENUM ('STANDARD', 'URGENT');
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'MATCHING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'RELEASED', 'REFUNDED');

-- User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- ArtisanProfile
CREATE TABLE "ArtisanProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "rcNumber" TEXT NOT NULL,
    "insuranceVerified" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "city" TEXT NOT NULL,
    "description" TEXT,
    "emergencyAvailable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArtisanProfile_pkey" PRIMARY KEY ("id")
);

-- ServiceCategory
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- ArtisanService
CREATE TABLE "ArtisanService" (
    "id" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "emergencyFee" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ArtisanService_pkey" PRIMARY KEY ("id")
);

-- JobRequest
CREATE TABLE "JobRequest" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "urgencyLevel" "UrgencyLevel" NOT NULL DEFAULT 'STANDARD',
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "estimatedPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobRequest_pkey" PRIMARY KEY ("id")
);

-- JobAssignment
CREATE TABLE "JobAssignment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "finalPrice" DOUBLE PRECISION,
    CONSTRAINT "JobAssignment_pkey" PRIMARY KEY ("id")
);

-- Review
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Payment
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- ─── Indexes ──────────────────────────────────────────────

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");

CREATE UNIQUE INDEX "ArtisanProfile_userId_key" ON "ArtisanProfile"("userId");
CREATE INDEX "ArtisanProfile_city_idx" ON "ArtisanProfile"("city");
CREATE INDEX "ArtisanProfile_isApproved_emergencyAvailable_idx" ON "ArtisanProfile"("isApproved", "emergencyAvailable");

CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");
CREATE INDEX "ServiceCategory_slug_idx" ON "ServiceCategory"("slug");

CREATE INDEX "ArtisanService_artisanId_isActive_idx" ON "ArtisanService"("artisanId", "isActive");
CREATE UNIQUE INDEX "ArtisanService_artisanId_categoryId_key" ON "ArtisanService"("artisanId", "categoryId");

CREATE INDEX "JobRequest_clientId_idx" ON "JobRequest"("clientId");
CREATE INDEX "JobRequest_status_idx" ON "JobRequest"("status");
CREATE INDEX "JobRequest_city_status_idx" ON "JobRequest"("city", "status");

CREATE UNIQUE INDEX "JobAssignment_jobId_key" ON "JobAssignment"("jobId");
CREATE INDEX "JobAssignment_artisanId_idx" ON "JobAssignment"("artisanId");

CREATE UNIQUE INDEX "Review_jobId_key" ON "Review"("jobId");
CREATE INDEX "Review_artisanId_idx" ON "Review"("artisanId");

CREATE UNIQUE INDEX "Payment_jobId_key" ON "Payment"("jobId");
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");
CREATE INDEX "Payment_stripePaymentIntentId_idx" ON "Payment"("stripePaymentIntentId");

CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- ─── Foreign Keys ─────────────────────────────────────────

ALTER TABLE "ArtisanProfile"
  ADD CONSTRAINT "ArtisanProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArtisanService"
  ADD CONSTRAINT "ArtisanService_artisanId_fkey"
  FOREIGN KEY ("artisanId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArtisanService"
  ADD CONSTRAINT "ArtisanService_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "JobRequest"
  ADD CONSTRAINT "JobRequest_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "JobRequest"
  ADD CONSTRAINT "JobRequest_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "JobAssignment"
  ADD CONSTRAINT "JobAssignment_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "JobRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "JobAssignment"
  ADD CONSTRAINT "JobAssignment_artisanId_fkey"
  FOREIGN KEY ("artisanId") REFERENCES "ArtisanProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "JobRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_artisanId_fkey"
  FOREIGN KEY ("artisanId") REFERENCES "ArtisanProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "JobRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
