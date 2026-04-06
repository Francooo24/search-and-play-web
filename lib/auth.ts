import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import jwt from "jsonwebtoken";

function getAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function parseAge(birthdate: any): number | null {
  if (!birthdate) return null;
  try {
    // Handle Date object from MySQL or string
    const str = birthdate instanceof Date
      ? birthdate.toISOString().slice(0, 10)
      : String(birthdate).slice(0, 10);
    const age = getAge(str);
    return isNaN(age) ? null : age;
  } catch {
    return null;
  }
}

// Verify a Django token was signed with the current secret
function isValidDjangoToken(token: string): boolean {
  try {
    const secret = process.env.DJANGO_SECRET_KEY ?? process.env.SECRET_KEY ?? "django-insecure-change-me-in-production";
    jwt.verify(token, secret, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

// Mint a Django SimpleJWT-compatible token pair directly using the Django SECRET_KEY.
// SimpleJWT uses HS256 with the Django SECRET_KEY as the signing secret.
function mintDjangoTokens(playerId: number): { access: string; refresh: string; accessExpiry: number } {
  const secret = process.env.DJANGO_SECRET_KEY ?? process.env.SECRET_KEY ?? "django-insecure-change-me-in-production";
  const now = Math.floor(Date.now() / 1000);
  const accessExp  = now + 25 * 60;       // 25 minutes — matches SIMPLE_JWT settings
  const refreshExp = now + 24 * 60 * 60;  // 1 day

  const access = jwt.sign(
    { token_type: "access",  exp: accessExp,  iat: now, jti: crypto.randomUUID(), user_id: playerId },
    secret,
    { algorithm: "HS256" }
  );
  const refresh = jwt.sign(
    { token_type: "refresh", exp: refreshExp, iat: now, jti: crypto.randomUUID(), user_id: playerId },
    secret,
    { algorithm: "HS256" }
  );
  return { access, refresh, accessExpiry: accessExp * 1000 };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = (req as any)?.headers?.["x-forwarded-for"] ?? "unknown";
        if (rateLimit(`login:${ip}`, 10, 600_000))
          throw new Error("Too many login attempts. Please wait 10 minutes.");
        const email = credentials.email.trim().toLowerCase().slice(0, 254);
        const password = credentials.password.slice(0, 128);

        const { rows } = await pool.query(
          "SELECT * FROM players WHERE email = $1 LIMIT 1",
          [email]
        );

        const player = rows[0];
        if (!player) return null;
        if (player.status === "banned") throw new Error("Your account has been banned.");

        const valid = await bcrypt.compare(password, player.password);
        if (!valid) return null;

        // Log login activity (sanitize player_name to prevent log injection)
        const safeName = player.player_name.replace(/[\r\n\t]/g, " ").slice(0, 100);
        await pool.query(
          "INSERT INTO activity_logs (player_name, activity) VALUES ($1, $2)",
          [safeName, "Logged in"]
        );

        const age = parseAge(player.birthdate);

        return {
          id:          String(player.id),
          name:        player.player_name,
          email:       player.email,
          is_admin:    player.is_admin === 1 || player.is_admin === true || Number(player.is_admin) === 1,
          age:         age,
          show_kids:   player.show_kids  === 1 || player.show_kids  === true,
          show_teen:   player.show_teen  === 1 || player.show_teen  === true,
          show_adult:  player.show_adult === 1 || player.show_adult === true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id         = user.id;
        token.is_admin   = (user as any).is_admin;
        token.age        = (user as any).age;
        token.show_kids  = (user as any).show_kids;
        token.show_teen  = (user as any).show_teen;
        token.show_adult = (user as any).show_adult;
        // Mint Django JWT directly — no HTTP call needed
        const { access, refresh, accessExpiry } = mintDjangoTokens(Number(user.id));
        token.djangoAccess       = access;
        token.djangoRefresh      = refresh;
        token.djangoAccessExpiry = accessExpiry;
      }

      // Refresh when access token is within 30s of expiry OR secret changed
      const expiry = token.djangoAccessExpiry as number | undefined;
      const needsRefresh = !token.djangoAccess
        || (expiry && Date.now() > expiry - 30_000)
        || !isValidDjangoToken(token.djangoAccess as string);
      if (needsRefresh && token.id) {
        const { access, refresh, accessExpiry } = mintDjangoTokens(Number(token.id));
        token.djangoAccess       = access;
        token.djangoRefresh      = refresh;
        token.djangoAccessExpiry = accessExpiry;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id         = token.id;
        (session.user as any).is_admin   = token.is_admin;
        (session.user as any).age        = token.age;
        (session.user as any).show_kids  = token.show_kids;
        (session.user as any).show_teen  = token.show_teen;
        (session.user as any).show_adult = token.show_adult;
      }
      (session as any).accessToken = token.djangoAccess;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
