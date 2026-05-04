-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('OPEN_CALL', 'PICK_AND_CHOOSE');

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "campaignType" "CampaignType" NOT NULL DEFAULT 'OPEN_CALL';
