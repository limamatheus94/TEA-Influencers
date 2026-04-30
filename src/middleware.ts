import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/for-creators",
  "/for-brands",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding",
  "/api/webhooks/(.*)",
]);

const isCreatorRoute = createRouteMatcher(["/creator(.*)"]);
const isBrandRoute = createRouteMatcher(["/brand(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/outreach(.*)", "/discovery(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next();

  const { userId, sessionClaims } = await auth.protect();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;

  if (isCreatorRoute(req) && role !== "CREATOR" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isBrandRoute(req) && role !== "BRAND" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAdminRoute(req) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
