import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";

export default async function CreatorProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) redirect("/onboarding");

  const { creatorProfile } = user;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Edit your public creator information.</p>
      </div>

      <div className="max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile information</CardTitle>
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
      </div>
    </div>
  );
}
