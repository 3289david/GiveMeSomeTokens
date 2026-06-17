import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash, randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    body = await req.json();
  } else {
    const form = await req.formData();
    body = Object.fromEntries(form.entries()) as Record<string, string>;
  }

  const { grant_type, code, client_id, client_secret, redirect_uri } = body;

  if (grant_type !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }

  const app = await db.oAuthApp.findUnique({ where: { clientId: client_id } });
  if (!app) return NextResponse.json({ error: "invalid_client" }, { status: 401 });

  const secretHash = createHash("sha256").update(client_secret ?? "").digest("hex");
  if (secretHash !== app.clientSecretHash) return NextResponse.json({ error: "invalid_client" }, { status: 401 });

  const authCode = await db.oAuthAuthCode.findUnique({ where: { code } });
  if (!authCode || authCode.appId !== app.id || authCode.used || authCode.expiresAt < new Date()) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  if (redirect_uri && !app.redirectUris.includes(redirect_uri)) {
    return NextResponse.json({ error: "invalid_redirect_uri" }, { status: 400 });
  }

  await db.oAuthAuthCode.update({ where: { id: authCode.id }, data: { used: true } });

  const accessToken = "gmt_oauth_" + randomBytes(32).toString("hex");
  await db.oAuthToken.create({
    data: {
      userId: authCode.userId,
      appId: app.id,
      accessToken,
      scopes: authCode.scopes,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({
    access_token: accessToken,
    token_type: "bearer",
    scope: authCode.scopes.join(" "),
    expires_in: 365 * 24 * 3600,
  });
}
