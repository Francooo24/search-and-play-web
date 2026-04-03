"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "Dictionary",  href: "/" },
  { label: "Games",       href: "/games",       requireAuth: true },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Culture",     href: "/culture" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!session?.user) return;
    const since = localStorage.getItem("notif_last_read") ?? new Date(0).toISOString();
    fetch(`/api/notifications?since=${encodeURIComponent(since)}`)
      .then(r => r.json())
      .then(d => setUnreadCount(d.unread ?? 0))
      .catch(() => {});
  }, [session]);

  const isAdmin = (session?.user as any)?.is_admin;

  function handleNavClick(e: React.MouseEvent, item: typeof NAV_ITEMS[0]) {
    if (item.requireAuth && !session?.user) {
      e.preventDefault();
      router.push(`/signin-prompt?from=${item.href}`);
    }
  }

  return (
    <>
      <nav className="flex justify-between items-center px-4 md:px-8 py-6 text-white z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-700 rounded-xl flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="font-bold text-xl md:text-2xl tracking-tight">
            <span className="text-white group-hover:text-gray-200 transition">Search</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 mx-1.5">&</span>
            <span className="text-white group-hover:text-gray-200 transition">Play</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-2">
          {!isAdmin && NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (item.requireAuth && status !== "authenticated") {
                  e.preventDefault();
                  router.push(`/signin-prompt?from=${encodeURIComponent(item.href)}`);
                }
              }}
              className={`nav-link py-3 px-6 text-sm font-medium rounded-lg transition ${pathname === item.href ? "nav-link-active" : "hover:bg-white/5"}`}
            >
              {item.label}
            </Link>
          ))}


          {isAdmin ? (
            <>
              <Link href="/admin" className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/30 hover:border-indigo-400/60 py-2 px-4 rounded-xl transition-all duration-300 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div className="leading-tight">
                  <p className="text-sm text-white font-bold">Hello, Admin</p>
                </div>
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 hover:border-red-400/60 hover:from-red-500/20 hover:to-rose-500/20 py-2.5 px-4 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 transition-all duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>
            </>
          ) : session?.user ? (
            <>
              <div className="relative">
                <button onClick={() => setDropdownOpen(o => !o)} className="flex items-center space-x-3 bg-gradient-to-r from-orange-500/10 to-amber-500/10 py-2 px-5 rounded-lg border border-orange-400/20 hover:border-orange-400/40 transition">
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-orange-100">{session.user.name}</span>
                  <svg className="w-3.5 h-3.5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-t-xl transition">
                        <span>👤</span> My Profile
                      </Link>
                      <Link href="/search-history" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition">
                        <span>🔍</span> Search History
                      </Link>
                      <Link href="/favorites" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition">
                        <span>⭐</span> My Favorites
                      </Link>
                      <Link href="/stats" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition">
                        <span>📊</span> Game Statistics
                      </Link>
                      <Link href="/achievements" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition">
                        <span>🏆</span> Achievements
                      </Link>
                      <Link href="/notifications" onClick={() => { setDropdownOpen(false); setUnreadCount(0); localStorage.setItem("notif_last_read", new Date().toISOString()); }} className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition">
                        <span>🔔</span> Notifications
                        {unreadCount > 0 && <span className="ml-auto bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                      </Link>
                      <div className="border-t border-white/8 mx-3" />
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-b-xl transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="bg-gradient-to-r from-orange-600 to-amber-700 py-3 px-7 rounded-lg text-sm font-semibold hover:from-orange-700 hover:to-amber-800 shadow-lg transition">Sign In</Link>
          )}
        </div>

        {/* Hamburger */}
        <button className="md:hidden flex flex-col justify-between w-7 h-6 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`h-0.5 bg-white rounded-full transition-all ${menuOpen ? "rotate-45 translate-y-2.5" : ""}`} />
          <span className={`h-0.5 bg-white rounded-full transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 bg-white rounded-full transition-all ${menuOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
        </button>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMenuOpen(false)} />}

      {/* Mobile menu */}
      <div className={`fixed top-0 left-0 w-80 h-full bg-gradient-to-b from-gray-950 to-black backdrop-blur-xl p-8 z-50 md:hidden transition-transform ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col space-y-4 mt-16">
          {!isAdmin && NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (item.requireAuth && status !== "authenticated") {
                  e.preventDefault();
                  setMenuOpen(false);
                  router.push(`/signin-prompt?from=${encodeURIComponent(item.href)}`);
                } else {
                  setMenuOpen(false);
                }
              }}
              className={`py-4 px-6 rounded-xl text-base font-medium transition ${pathname === item.href ? "bg-white/5 border border-white/10" : "hover:bg-white/5"}`}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-white/5 my-4" />
          {isAdmin ? (
            <>
              <Link href="/admin" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/30 py-3 px-5 rounded-xl transition">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <p className="text-sm text-white font-bold">Hello, Admin</p>
              </Link>
              <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                className="flex items-center gap-3 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 py-3 px-5 rounded-xl text-red-400 font-semibold transition w-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>
            </>
          ) : session?.user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-4 px-6 rounded-xl hover:bg-white/5 text-base font-medium transition">
                <span>👤</span> My Profile
              </Link>
              <Link href="/search-history" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-4 px-6 rounded-xl hover:bg-white/5 text-base font-medium transition">
                <span>🔍</span> Search History
              </Link>
              <Link href="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-4 px-6 rounded-xl hover:bg-white/5 text-base font-medium transition">
                <span>⭐</span> My Favorites
              </Link>
              <Link href="/stats" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-4 px-6 rounded-xl hover:bg-white/5 text-base font-medium transition">
                <span>📊</span> Game Statistics
              </Link>
              <Link href="/achievements" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-4 px-6 rounded-xl hover:bg-white/5 text-base font-medium transition">
                <span>🏆</span> Achievements
              </Link>
              <Link href="/notifications" onClick={() => { setMenuOpen(false); setUnreadCount(0); localStorage.setItem("notif_last_read", new Date().toISOString()); }} className="flex items-center gap-3 py-4 px-6 rounded-xl hover:bg-white/5 text-base font-medium transition">
                <span>🔔</span> Notifications
                {unreadCount > 0 && <span className="ml-auto bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </Link>
              <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="bg-gradient-to-r from-red-600 to-red-700 py-4 px-6 rounded-xl text-base font-bold transition text-left">Log Out</button>
            </>
          ) : (
            <Link href="/login" className="bg-gradient-to-r from-orange-600 to-amber-700 py-4 px-6 rounded-xl text-base font-bold transition" onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
        </div>
      </div>
    </>
  );
}
