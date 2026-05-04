-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Platform" ADD VALUE 'FACEBOOK';
ALTER TYPE "Platform" ADD VALUE 'PRESS';

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "artistName" TEXT,
ADD COLUMN     "songLink" TEXT,
ADD COLUMN     "songTitle" TEXT;

-- CreateTable
CREATE TABLE "campaign_selections" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "creatorPlatformId" TEXT NOT NULL,
    "agreedPriceCents" INTEGER NOT NULL,

    CONSTRAINT "campaign_selections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_selections_campaignId_creatorPlatformId_key" ON "campaign_selections"("campaignId", "creatorPlatformId");

-- AddForeignKey
ALTER TABLE "campaign_selections" ADD CONSTRAINT "campaign_selections_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_selections" ADD CONSTRAINT "campaign_selections_creatorPlatformId_fkey" FOREIGN KEY ("creatorPlatformId") REFERENCES "creator_platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
