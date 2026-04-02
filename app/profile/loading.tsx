export default function ProfileLoading() {
  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 md:px-8 pb-16 animate-pulse">

      {/* Hero skeleton */}
      <div className="rounded-3xl bg-white/5 border border-white/8 h-44 mb-8 mt-4" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-3 gap-3 md:gap-5 mb-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/5 border border-white/8 h-24" />
        ))}
      </div>

      {/* Game stats + recent skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="rounded-2xl bg-white/5 border border-white/8 h-72" />
        <div className="rounded-2xl bg-white/5 border border-white/8 h-72" />
      </div>

      {/* Favorites skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="rounded-2xl bg-white/5 border border-white/8 h-48" />
        <div className="rounded-2xl bg-white/5 border border-white/8 h-48" />
      </div>

      {/* Achievements skeleton */}
      <div className="rounded-2xl bg-white/5 border border-white/8 h-48 mb-10" />

      {/* Search history skeleton */}
      <div className="rounded-2xl bg-white/5 border border-white/8 h-48" />
    </div>
  );
}
