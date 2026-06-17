import { NextResponse } from "next/server";
import { generateChallenge } from "@/lib/altcha";

export async function GET() {
  const challenge = await generateChallenge();
  return NextResponse.json(challenge);
}
