module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/web/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$web$2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/web/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$web$2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$web$2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
let _pool = null;
function getPool() {
    if (_pool) return _pool;
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL is not set");
    }
    _pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$web$2f$node_modules$2f$pg$29$__["Pool"]({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        },
        max: 8,
        idleTimeoutMillis: 60000
    });
    return _pool;
}
const __TURBOPACK__default__export__ = {
    query: (text, params)=>getPool().query(text, params)
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/web/lib/rateLimit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "rateLimit",
    ()=>rateLimit,
    "rateLimitResponse",
    ()=>rateLimitResponse
]);
const store = new Map();
function rateLimit(key, limit, windowMs) {
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || now > entry.reset) {
        store.set(key, {
            count: 1,
            reset: now + windowMs
        });
        return false;
    }
    if (entry.count >= limit) return true;
    entry.count++;
    return false;
}
function rateLimitResponse(message = "Too many requests. Please try again later.") {
    return Response.json({
        error: message
    }, {
        status: 429
    });
}
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[project]/web/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "authOptions",
    ()=>authOptions,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/rateLimit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
function parseAge(birthdate) {
    if (!birthdate) return null;
    try {
        const str = birthdate instanceof Date ? birthdate.toISOString().slice(0, 10) : String(birthdate).slice(0, 10);
        const birth = new Date(str);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || m === 0 && today.getDate() < birth.getDate()) age--;
        return isNaN(age) ? null : age;
    } catch  {
        return null;
    }
}
function isValidDjangoToken(token) {
    try {
        const secret = process.env.DJANGO_SECRET_KEY ?? process.env.SECRET_KEY ?? "django-insecure-change-me-in-production";
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, secret, {
            algorithms: [
                "HS256"
            ]
        });
        return true;
    } catch  {
        return false;
    }
}
function mintDjangoTokens(playerId) {
    const secret = process.env.DJANGO_SECRET_KEY ?? process.env.SECRET_KEY ?? "django-insecure-change-me-in-production";
    const now = Math.floor(Date.now() / 1000);
    const accessExp = now + 25 * 60;
    const refreshExp = now + 24 * 60 * 60;
    const access = __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign({
        token_type: "access",
        exp: accessExp,
        iat: now,
        jti: crypto.randomUUID(),
        user_id: playerId
    }, secret, {
        algorithm: "HS256"
    });
    const refresh = __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign({
        token_type: "refresh",
        exp: refreshExp,
        iat: now,
        jti: crypto.randomUUID(),
        user_id: playerId
    }, secret, {
        algorithm: "HS256"
    });
    return {
        access,
        refresh,
        accessExpiry: accessExp * 1000
    };
}
const authOptions = {
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    console.log("[auth] missing credentials");
                    return null;
                }
                try {
                    const ip = req?.headers?.["x-forwarded-for"] ?? "unknown";
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimit"])(`login:${ip}`, 10, 600_000)) throw new Error("Too many login attempts. Please wait 10 minutes.");
                    const email = credentials.email.trim().toLowerCase().slice(0, 254);
                    const password = credentials.password.slice(0, 128);
                    // Test DB connection first
                    await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query("SELECT 1").catch((e)=>{
                        console.log("[auth] DB connection failed:", e.message);
                        throw new Error("Database connection failed.");
                    });
                    const { rows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query(`SELECT id, player_name, email, password, status, birthdate,
                    show_kids, show_teen, show_adult, country
             FROM players WHERE email = $1 LIMIT 1`, [
                        email
                    ]);
                    console.log("[auth] query done, rows found:", rows.length);
                    const player = rows[0];
                    if (!player) {
                        console.log("[auth] no player found for:", email);
                        return null;
                    }
                    if (player.status === "banned") throw new Error("Your account has been banned.");
                    const valid = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, player.password);
                    console.log("[auth] password valid:", valid);
                    if (!valid) return null;
                    // is_admin — try separately, default false if column missing
                    let is_admin = false;
                    try {
                        const { rows: ar } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query("SELECT is_admin FROM players WHERE id = $1 LIMIT 1", [
                            player.id
                        ]);
                        is_admin = ar[0]?.is_admin === true || ar[0]?.is_admin === 1;
                    } catch  {
                        console.log("[auth] is_admin column missing, defaulting to false");
                    }
                    // Log activity — never block login
                    __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query("INSERT INTO activity_logs (player_name, activity, created_at) VALUES ($1, $2, NOW())", [
                        player.player_name.replace(/[\r\n\t]/g, " ").slice(0, 100),
                        "Logged in"
                    ]).catch(()=>{});
                    console.log("[auth] login success for:", email, "is_admin:", is_admin);
                    return {
                        id: String(player.id),
                        name: player.player_name,
                        email: player.email,
                        is_admin,
                        age: parseAge(player.birthdate),
                        show_kids: player.show_kids === true || player.show_kids === 1,
                        show_teen: player.show_teen === true || player.show_teen === 1,
                        show_adult: player.show_adult === true || player.show_adult === 1
                    };
                } catch (err) {
                    console.log("[auth] authorize threw:", err.message);
                    if (err.message?.includes("Too many") || err.message?.includes("banned")) throw err;
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt ({ token, user }) {
            if (user) {
                token.id = user.id;
                token.is_admin = user.is_admin;
                token.age = user.age;
                token.show_kids = user.show_kids;
                token.show_teen = user.show_teen;
                token.show_adult = user.show_adult;
                const { access, refresh, accessExpiry } = mintDjangoTokens(Number(user.id));
                token.djangoAccess = access;
                token.djangoRefresh = refresh;
                token.djangoAccessExpiry = accessExpiry;
            }
            const expiry = token.djangoAccessExpiry;
            const needsRefresh = !token.djangoAccess || expiry && Date.now() > expiry - 30_000 || !isValidDjangoToken(token.djangoAccess);
            if (needsRefresh && token.id) {
                const { access, refresh, accessExpiry } = mintDjangoTokens(Number(token.id));
                token.djangoAccess = access;
                token.djangoRefresh = refresh;
                token.djangoAccessExpiry = accessExpiry;
            }
            return token;
        },
        async session ({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.is_admin = token.is_admin;
                session.user.age = token.age;
                session.user.show_kids = token.show_kids;
                session.user.show_teen = token.show_teen;
                session.user.show_adult = token.show_adult;
            }
            session.accessToken = token.djangoAccess;
            return session;
        }
    },
    pages: {
        signIn: "/login"
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
};
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(authOptions);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/web/app/api/daily-challenge/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function GET() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
    if (!session?.user) return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        challenge: null,
        streak: 0,
        history: []
    });
    const playerId = session.user.id;
    const today = new Date().toISOString().split("T")[0];
    try {
        const { rows: challengeRows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query("SELECT * FROM daily_challenges WHERE challenge_date = $1 LIMIT 1", [
            today
        ]);
        const challenge = challengeRows[0] ?? null;
        if (!challenge) return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            challenge: null,
            streak: 0,
            history: []
        });
        const { rows: completedRows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query("SELECT id FROM daily_challenge_completions WHERE player_id = $1 AND challenge_id = $2 LIMIT 1", [
            playerId,
            challenge.id
        ]);
        const completed = completedRows.length > 0;
        const { rows: progressRows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query("SELECT COUNT(*) as count FROM leaderboard WHERE user_id = $1 AND game = $2 AND DATE(created_at) = $3", [
            playerId,
            challenge.game,
            today
        ]);
        const progress = Number(progressRows[0]?.count ?? 0);
        const can_claim = !completed && progress >= challenge.target_value;
        let streak = 0;
        const { rows: dateRows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query(`SELECT DISTINCT dc.challenge_date
       FROM daily_challenge_completions dcc
       JOIN daily_challenges dc ON dcc.challenge_id = dc.id
       WHERE dcc.player_id = $1
       ORDER BY dc.challenge_date DESC`, [
            playerId
        ]);
        const checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);
        for (const row of dateRows){
            const d = new Date(row.challenge_date);
            d.setHours(0, 0, 0, 0);
            const expected = new Date(checkDate);
            expected.setDate(checkDate.getDate() - streak);
            if (d.getTime() === expected.getTime()) streak++;
            else break;
        }
        const { rows: historyRows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query(`SELECT dc.challenge_date, dc.game, dc.title, dc.bonus_points, dcc.completed_at
       FROM daily_challenge_completions dcc
       JOIN daily_challenges dc ON dcc.challenge_id = dc.id
       WHERE dcc.player_id = $1
       ORDER BY dcc.completed_at DESC LIMIT 7`, [
            playerId
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            challenge: {
                id: challenge.id,
                game: challenge.game,
                title: challenge.title,
                description: challenge.description,
                target_value: challenge.target_value,
                bonus_points: challenge.bonus_points
            },
            completed,
            progress,
            can_claim,
            streak,
            history: historyRows.map((r)=>({
                    challenge_date: String(r.challenge_date),
                    game: r.game,
                    title: r.title,
                    bonus_points: r.bonus_points,
                    completed_at: r.completed_at
                }))
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            challenge: null,
            streak: 0,
            history: [],
            error: err.message
        });
    }
}
async function POST() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
    if (!session?.user) return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Unauthorized"
    }, {
        status: 401
    });
    const playerId = session.user.id;
    const playerName = session.user.name ?? "Unknown";
    const today = new Date().toISOString().split("T")[0];
    try {
        const { rows: challengeRows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query("SELECT * FROM daily_challenges WHERE challenge_date = $1 LIMIT 1", [
            today
        ]);
        const challenge = challengeRows[0];
        if (!challenge) return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "No challenge today"
        }, {
            status: 404
        });
        const { rows: existing } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query("SELECT id FROM daily_challenge_completions WHERE player_id = $1 AND challenge_id = $2 LIMIT 1", [
            playerId,
            challenge.id
        ]);
        if (existing.length > 0) return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Already claimed"
        }, {
            status: 400
        });
        const { rows: progressRows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query("SELECT COUNT(*) as count FROM leaderboard WHERE user_id = $1 AND game = $2 AND DATE(created_at) = $3", [
            playerId,
            challenge.game,
            today
        ]);
        const progress = Number(progressRows[0]?.count ?? 0);
        if (progress < challenge.target_value) return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Challenge not completed yet"
        }, {
            status: 400
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query("INSERT INTO daily_challenge_completions (player_id, challenge_id, completed_at) VALUES ($1, $2, NOW())", [
            playerId,
            challenge.id
        ]);
        await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query("INSERT INTO leaderboard (user_id, player_name, game, score, created_at) VALUES ($1, $2, $3, $4, NOW())", [
            playerId,
            playerName,
            "Daily Challenge",
            challenge.bonus_points
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            bonus_points: challenge.bonus_points
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0iydvd~._.js.map