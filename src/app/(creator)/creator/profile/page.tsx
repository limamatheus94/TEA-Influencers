import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "./profile-form";
import { PlatformProfileSection } from "./platform-form";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const approvalBadge = {
  PENDING:  { icon: Clock,         label: "Pending approval",  cls: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { icon: CheckCircle2,  label: "Approved",          cls: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { icon: XCircle,       label: "Rejected",          cls: "bg-red-50 text-red-700 border-red-200" },
};

export default async function CreatorProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      creatorProfile: {
        include: { platforms: true },
      },
    },
  });
  if (!user?.creatorProfile) redirect("/onboarding");

  const { creatorProfile } = user;
  const approval = approvalBadge[creatorProfile.approvalStatus];
  const ApprovalIcon = approval.icon;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Edit your public creator information.</p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${approval.cls}`}>
          <ApprovalIcon className="h-3.5 w-3.5" />
          {approval.label}
        </div>
      </div>

      {creatorProfile.approvalStatus === "REJECTED" && creatorProfile.rejectedReason && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Rejection reason:</strong> {creatorProfile.rejectedReason}
        </div>
      )}

      {creatorProfile.approvalStatus === "PENDING" && creatorProfile.platforms.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Your profile is under review. You'll be notified once approved.
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">General information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            profile={{
              id: creatorProfile.id,
              displayName: creatorProfile.displayName,
              bio: creatorProfile.bio ?? "",
              location: creatorProfile.location ?? "",
              genres: creatorProfile.genres.join(", "),
              mediaKitUrl: creatorProfile.mediaKitUrl ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My platforms</CardTitle>
          <p className="text-xs text-gray-500 mt-1">
            Fill in your details for each platform you want to offer. Each save sends your profile for admin review.
          </p>
        </CardHeader>
        <CardContent>
          <PlatformProfileSection
            existingPlatforms={creatorProfile.platforms.map((p) => ({
              platform: p.platform,
              handle: p.handle,
              url: p.url,
              followersCount: p.followersCount,
              logoUrl: p.logoUrl ?? null,
              profileCategory: p.profileCategory ?? null,
              genres: p.genres,
              keyTopics: p.keyTopics,
              topLocations: (p.topLocations as { rank: number; country: string; pct: number }[] | null),
              pricePerPostCents: p.pricePerPostCents ?? null,
              currency: p.currency,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
