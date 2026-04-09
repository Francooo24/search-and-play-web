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
"[project]/web/app/api/leaderboard/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const dynamic = "force-dynamic";
const TIERS = [
    {
        name: "Novice",
        min: 0,
        max: 99,
        icon: "🌱",
        color: "text-gray-400",
        bg: "bg-gray-500/10",
        border: "border-gray-500/30"
    },
    {
        name: "Explorer",
        min: 100,
        max: 499,
        icon: "🗺️",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30"
    },
    {
        name: "Adventurer",
        min: 500,
        max: 1499,
        icon: "⚔️",
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/30"
    },
    {
        name: "Champion",
        min: 1500,
        max: 4999,
        icon: "🏆",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30"
    },
    {
        name: "Master",
        min: 5000,
        max: 14999,
        icon: "👑",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30"
    },
    {
        name: "Grandmaster",
        min: 15000,
        max: 49999,
        icon: "💎",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30"
    },
    {
        name: "Legend",
        min: 50000,
        max: 0,
        icon: "🌟",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30"
    }
];
function getTier(pts) {
    const tier = [
        ...TIERS
    ].reverse().find((t)=>pts >= t.min) ?? TIERS[0];
    const isMax = tier.max === 0;
    const rng = isMax ? 1 : tier.max - tier.min + 1;
    const progress = isMax ? 100 : Math.min(100, Math.round((pts - tier.min) / rng * 100));
    return {
        tier,
        progress
    };
}
function calcAgeGroup(birthdate) {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || m === 0 && today.getDate() < birth.getDate()) age--;
    if (age <= 12) return "kids";
    if (age <= 17) return "teen";
    return "adult";
}
async function GET(req) {
    const { searchParams } = req.nextUrl;
    const view = searchParams.get("view") ?? "leaderboard";
    const game = searchParams.get("game") ?? "";
    const period = searchParams.get("period") ?? "all";
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const ageGroup = searchParams.get("age_group") ?? "";
    const limit = 20;
    try {
        // ── Per-game view ──────────────────────────────────────────
        if (view === "pergame") {
            const { rows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query(`SELECT l.game, l.player_name, MAX(l.score) as score, p.country
         FROM leaderboard l JOIN players p ON l.user_id = p.id
         WHERE p.is_admin = FALSE
         GROUP BY l.game, l.player_name, p.country
         ORDER BY l.game, score DESC`);
            const { rows: gameListRows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query(`SELECT DISTINCT game FROM leaderboard ORDER BY game`);
            const games = {};
            for (const r of rows){
                if (!games[r.game]) games[r.game] = [];
                if (games[r.game].length < 3) games[r.game].push({
                    player_name: r.player_name,
                    score: Number(r.score),
                    country: r.country
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                games,
                game_list: gameListRows.map((r)=>r.game)
            });
        }
        // ── Single game detail ─────────────────────────────────────
        if (view === "game") {
            const { rows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query(`SELECT l.player_name, MAX(l.score) as best_score, COUNT(*) as plays,
                MAX(l.created_at) as last_played, p.country
         FROM leaderboard l JOIN players p ON l.user_id = p.id
         WHERE l.game = $1 AND p.is_admin = FALSE
         GROUP BY l.player_name, p.country
         ORDER BY best_score DESC LIMIT 10`, [
                game
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                players: rows.map((r)=>({
                        player_name: r.player_name,
                        best_score: Number(r.best_score),
                        plays: Number(r.plays),
                        last_played: String(r.last_played),
                        country: r.country
                    }))
            });
        }
        // ── Rankings view ──────────────────────────────────────────
        if (view === "rankings") {
            const { rows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query(`SELECT p.id, p.player_name, COALESCE(SUM(l.score),0) AS total_points,
                COUNT(l.id) AS total_games, COALESCE(AVG(l.score),0) AS avg_score,
                MAX(l.created_at) AS last_played, p.birthdate, p.country
         FROM players p LEFT JOIN leaderboard l ON p.id = l.user_id
         WHERE p.is_admin = FALSE
         GROUP BY p.id, p.player_name, p.birthdate, p.country
         HAVING COALESCE(SUM(l.score),0) > 0
         ORDER BY total_points DESC LIMIT 50`);
            const players = rows.map((r)=>{
                const pts = Number(r.total_points);
                const { tier, progress } = getTier(pts);
                const ag = calcAgeGroup(r.birthdate);
                return {
                    id: r.id,
                    player_name: r.player_name,
                    total_points: pts,
                    total_games: Number(r.total_games),
                    avg_score: parseFloat(r.avg_score),
                    last_played: String(r.last_played),
                    tier,
                    progress,
                    age_group: ag,
                    country: r.country
                };
            }).filter((r)=>!ageGroup || r.age_group === ageGroup);
            return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                players,
                tiers: TIERS
            });
        }
        // ── Default leaderboard ────────────────────────────────────
        const conditions = [
            "p.is_admin = FALSE"
        ];
        const params = [];
        if (game) {
            conditions.push(`l.game = $${params.length + 1}`);
            params.push(game);
        }
        if (period === "daily") conditions.push("l.created_at >= CURRENT_DATE");
        if (period === "weekly") conditions.push(`l.created_at >= NOW() - INTERVAL '7 days'`);
        if (period === "monthly") conditions.push(`l.created_at >= NOW() - INTERVAL '30 days'`);
        const where = "WHERE " + conditions.join(" AND ");
        const gameCol = game ? "" : ", MAX(l.game) as game";
        const limitIdx = params.length + 1;
        const offIdx = params.length + 2;
        const { rows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query(`SELECT l.player_name, l.user_id, SUM(l.score) as total_score,
              MAX(l.created_at) as last_played ${gameCol},
              p.birthdate, p.country, COUNT(l.id) as total_games
       FROM leaderboard l LEFT JOIN players p ON l.user_id = p.id
       ${where}
       GROUP BY l.player_name, l.user_id, p.birthdate, p.country
       HAVING SUM(l.score) > 0
       ORDER BY total_score DESC
       LIMIT $${limitIdx} OFFSET $${offIdx}`, [
            ...params,
            limit,
            offset
        ]);
        const { rows: gameTypeRows } = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query(`SELECT DISTINCT l.game FROM leaderboard l JOIN players p ON l.user_id = p.id
       WHERE p.is_admin = FALSE ORDER BY l.game`);
        const colOffset = game ? 0 : 1;
        const players = rows.map((r)=>({
                player_name: r.player_name,
                user_id: r.user_id,
                total_score: Number(r.total_score),
                last_played: String(r.last_played),
                game: game ? null : r.game,
                age_group: calcAgeGroup(game ? r.birthdate : r.birthdate),
                country: r.country,
                total_games: Number(r.total_games)
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            players,
            game_types: gameTypeRows.map((r)=>r.game),
            has_more: rows.length === limit
        }, {
            headers: {
                "Cache-Control": "no-store"
            }
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

//# sourceMappingURL=%5Broot-of-the-server%5D__06e4iqf._.js.map