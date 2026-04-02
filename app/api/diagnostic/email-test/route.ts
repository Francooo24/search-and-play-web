import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass)
    return NextResponse.json({ ok: false, error: "EMAIL_USER or EMAIL_PASS not set in .env.local" });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.verify();
    return NextResponse.json({ ok: true, message: `Email connection verified: ${user}` });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? "Email connection failed" });
  }
}
