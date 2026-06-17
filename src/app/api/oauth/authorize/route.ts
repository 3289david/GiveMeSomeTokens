import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope") ?? "";
  const state = searchParams.get("state") ?? "";
  const responseType = searchParams.get("response_type");
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");

  if (responseType !== "code") {
    return NextResponse.json({ error: "unsupported_response_type" }, { status: 400 });
  }
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "invalid_request", description: "missing client_id or redirect_uri" }, { status: 400 });
  }
  // PKCE: if provided, only S256 is accepted
  if (codeChallenge && codeChallengeMethod !== "S256") {
    return NextResponse.json({ error: "invalid_request", description: "only S256 code_challenge_method is supported" }, { status: 400 });
  }

  const app = await db.oAuthApp.findUnique({ where: { clientId } });
  if (!app) return NextResponse.json({ error: "invalid_client" }, { status: 400 });

  // Strict exact-match URI check
  if (!app.redirectUris.includes(redirectUri)) {
    return NextResponse.json({ error: "invalid_redirect_uri" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user) {
    const returnUrl = encodeURIComponent(req.url);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${returnUrl}`, req.url));
  }

  const code = randomBytes(32).toString("hex");
  const scopes = scope.split(" ").filter(Boolean);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10-minute auth codes

  await db.oAuthAuthCode.create({
    data: {
      code,
      appId: app.id,
      userId: session.user.id,
      scopes,
      expiresAt,
    },
  });

  const redirect = new URL(redirectUri);
  redirect.searchParams.set("code", code);
  if (state) redirect.searchParams.set("state", state);

  return NextResponse.redirect(redirect.toString());
}
