import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  // Allow public access to the directory page
  if (request.nextUrl.pathname === "/browse-services") {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Matches /browse-services/:id, /browse-services/:id/booking, etc. (1 or more segments)
    // Does NOT match the base /browse-services directory
    "/browse-services/:path+",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
