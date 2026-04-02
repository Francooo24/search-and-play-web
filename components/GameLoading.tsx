export default function GameLoading() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
      <p className="text-gray-400 text-sm animate-pulse">Loading game...</p>
    </div>
  );
}
