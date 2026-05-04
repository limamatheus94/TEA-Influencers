/*
  Warnings:

  - Added the required column `updatedAt` to the `creator_platforms` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "creator_platforms" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "keyTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "pricePerPostCents" INTEGER,
ADD COLUMN     "profileCategory" TEXT,
ADD COLUMN     "topLocations" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "creator_profiles" ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedReason" TEXT;
