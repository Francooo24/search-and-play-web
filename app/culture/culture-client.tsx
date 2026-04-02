"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface WordOfDay { word: string; english_word: string; definition: string; }

const FUN_FACTS = [
  "Did you know? The word 'alphabet' comes from the first two Greek letters: alpha + beta.",
  "Did you know? The word 'democracy' comes from the Greek words 'demos' (people) and 'kratos' (power).",
  "Did you know? Ancient Greeks invented the concept of the Olympic truce — all wars stopped during the Games.",
  "Did you know? The word 'music' comes from the Greek 'mousike', meaning art of the Muses.",
  "Did you know? Hippocrates, a Greek physician, is considered the father of modern medicine.",
  "Did you know? The word 'philosophy' comes from Greek: 'philos' (love) + 'sophia' (wisdom).",
  "Did you know? Ancient Greeks were the first to use coins as currency around 600 BCE.",
  "Did you know? The word 'theatre' comes from the Greek 'theatron', meaning a place for viewing.",
  "Did you know? Greece has more archaeological museums than any other country in the world.",
  "Did you know? The Greek alphabet is the oldest alphabet still in use today.",
];

const CARDS = [
  { id: "Socrates",        title: "Socrates",            category: "People",     searchWord: "philosophy",   game: "/games/trivia",        gameLabel: "Trivia",           image: "https://hips.hearstapps.com/hmg-prod/images/statue-of-socrates-the-philosopher-with-sky-in-royalty-free-image-1731944768.jpg?crop=0.66667xw:1xh;center,top&resize=640:*", href: "https://en.wikipedia.org/wiki/Socrates", back: ["Ancient Greece is the birthplace of Western philosophy, with great thinkers like Socrates, Plato, and Aristotle laying the foundations of logical reasoning and ethics.", "Their teachings on wisdom, virtue, and the pursuit of knowledge continue to influence modern thought and education worldwide."] },
  { id: "greek Mythology", title: "Greek mythology",     category: "History",    searchWord: "myth",         game: "/games/fakeorfact",    gameLabel: "Fake or Fact",     image: "https://content.api.news/v3/images/bin/7f3fd1e111ae42e4ff9bd9afb025c286", href: "https://en.wikipedia.org/wiki/Greek_mythology", back: ["Greek mythology features powerful gods like Zeus, Athena, and Apollo, along with epic tales of heroes like Hercules and Odysseus.", "These stories have shaped literature, art, and culture for millennia, providing timeless lessons about human nature and morality."] },
  { id: "Parthenon",       title: "Parthenon",           category: "Art",        searchWord: "architecture", game: "/games/picturepuzzle", gameLabel: "Picture Puzzle",   image: "https://storage.architecturecompetitions.com/upload/pages/pages/00-comp/Nicks%20article/art%2032/The%20Parthenon%20features%20Doric%20columns%20.jpg", href: "https://en.wikipedia.org/wiki/Parthenon", back: ["Greek architecture introduced the iconic Doric, Ionic, and Corinthian columns, with masterpieces like the Parthenon showcasing perfect proportions and harmony.", "These architectural principles continue to influence buildings worldwide, from government structures to modern museums."] },
  { id: "Greek Cuisine",   title: "Greek cuisine",       category: "Food",       searchWord: "food",         game: "/games/wordassoc",    gameLabel: "Word Association", image: "https://www.greece-is.com/wp-content/uploads/2019/02/011-trapezi.jpg", href: "https://en.wikipedia.org/wiki/Greek_cuisine", back: ["Greek cuisine features fresh ingredients like olive oil, feta cheese, olives, and herbs. Dishes like moussaka, souvlaki, and Greek salad are beloved worldwide.", "The Mediterranean diet, rooted in Greek traditions, emphasizes healthy eating and the social aspect of sharing meals with family and friends."] },
  { id: "Greek Language",  title: "Greek language",      category: "History",    searchWord: "language",    game: "/games/spellingbee",  gameLabel: "Spelling Bee",     image: "https://warwick.ac.uk/fac/arts/classics/intranets/students/modules/gklang/screenshot_2022-07-21_at_10.48.28.png", href: "https://en.wikipedia.org/wiki/Greek_language", back: ["The Greek language has a 3,400-year written history, making it one of the oldest recorded languages. Many English words derive from Greek roots.", "The Greek alphabet, developed around 800 BCE, became the foundation for Latin and Cyrillic scripts, influencing writing systems across the world."] },
  { id: "Ancient Greek art", title: "Ancient Greek art", category: "Art",       searchWord: "art",          game: "/games/memory",       gameLabel: "Memory",           image: "https://theclassicalscroll.wordpress.com/wp-content/uploads/2019/02/655px-niobid_painter_-_red-figure_amphora_with_musical_scene_-_walters_482712_-_side_a.jpg?w=560", href: "https://en.wikipedia.org/wiki/Ancient_Greek_art", back: ["Greek pottery, sculpture, and painting set artistic standards for centuries. Black-figure and red-figure pottery depicted myths and daily life.", "Greek artisans also excelled in jewelry making, weaving, and metalwork, creating beautiful objects that combined functionality with aesthetic beauty."] },
  { id: "Family",          title: "Family & Traditions", category: "Traditions", searchWord: "family",      game: "/games/wordconnect",  gameLabel: "Word Connect",     image: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Traditional_Greek_Orthodox_Paschal_%28Easter%29_foods.jpg", href: "https://www.google.com/search?q=Greek+family+traditions", back: ["Greek families are close-knit, with strong emphasis on respect for elders and maintaining traditions across generations.", "Celebrations like name days, Easter, and weddings are elaborate affairs that bring extended families together, featuring traditional music, dancing, and feasting."] },
  { id: "Festivals",       title: "Festivals",           category: "Traditions", searchWord: "festival",    game: "/games/triviablitz",  gameLabel: "Trivia Blitz",     image: "https://centralca.cdn-anvilcms.net/media/images/2018/10/05/images/5368-greek.max-752x423.png", href: "https://en.wikipedia.org/wiki/Festivals_in_Greece", back: ["Greek festivals celebrate religious holidays, local saints, and cultural traditions with music, dancing, and traditional foods.", "Events like the Athens Festival, Carnival celebrations, and local panigiri (village festivals) showcase Greek hospitality and community spirit."] },
  { id: "Greek Theatre",   title: "Greek Theatre",       category: "Art",        searchWord: "theatre",     game: "/games/contextclues", gameLabel: "Context Clues",    image: "https://www.elissos.com/wp-content/uploads/2015/07/ancient-greek-theater-odeon_feature-scaled.jpg", href: "https://en.wikipedia.org/wiki/Theatre_of_ancient_Greece", back: ["Ancient Greece gave birth to theatre as an art form. Playwrights like Sophocles, Euripides, and Aristophanes created the foundations of tragedy and comedy that still shape storytelling today.", "Greek amphitheatres like the Theatre of Epidaurus were engineering marvels with near-perfect acoustics, seating thousands of spectators for performances honoring the god Dionysus."] },
  { id: "Olympic Games",   title: "Olympic Games",       category: "History",    searchWord: "victory",     game: "/games/trivia",       gameLabel: "Trivia",           image: "https://las.illinois.edu/sites/default/files/inline-images/Classics_Olympics_story_0.jpg", href: "https://en.wikipedia.org/wiki/Ancient_Olympic_Games", back: ["The Olympic Games originated in Ancient Olympia, Greece, in 776 BCE as a religious festival honoring Zeus. Athletes from across the Greek world competed in running, wrestling, chariot racing, and more.", "The modern Olympics, revived in Athens in 1896, carry on this ancient tradition. The Olympic flame is still lit in Olympia, Greece, before every Games as a symbol of continuity."] },
  { id: "Greek Music",     title: "Greek Music",         category: "Art",        searchWord: "music",       game: "/games/rhymetime",    gameLabel: "Rhyme Time",       image: "https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ba69adf-0b86-468d-82fb-46c229109278_1000x1000.png", href: "https://en.wikipedia.org/wiki/Music_of_Greece", back: ["Greek music has a rich history spanning thousands of years. Traditional instruments like the bouzouki, lyra, and baglamas form the backbone of folk and rebetiko music — often called the 'Greek blues'.", "Folk dances like the sirtaki, syrtaki, and hasapiko are central to Greek celebrations. Music and dance remain deeply tied to Greek identity, from village festivals to modern concerts."] },
  { id: "Mathematics",     title: "Mathematics & Science", category: "People",  searchWord: "wisdom",      game: "/games/mathrace",     gameLabel: "Math Race",        image: "https://libraryforkids.com/wp-content/uploads/2021/09/math_science.gif", href: "https://en.wikipedia.org/wiki/Greek_mathematics", back: ["Ancient Greeks revolutionized mathematics and science. Pythagoras developed his famous theorem, Euclid laid the foundations of geometry, and Archimedes made breakthroughs in physics and engineering.", "Hippocrates established medicine as a discipline separate from religion, while Eratosthenes calculated the Earth's circumference with remarkable accuracy — all centuries before modern tools existed."] },
  { id: "Greek Islands",   title: "Greek Islands",       category: "History",    searchWord: "island",      game: "/games/flagquiz",     gameLabel: "Flag Quiz",        image: "https://handluggageonly.co.uk/wp-content/uploads/2015/05/Hand-Luggage-Only-17.jpg", href: "https://en.wikipedia.org/wiki/Greek_islands", back: ["Greece has over 6,000 islands, of which about 227 are inhabited. Santorini is famous for its volcanic caldera and iconic blue-domed churches, while Mykonos is known for its vibrant culture and windmills.", "Crete, the largest island, was home to the ancient Minoan civilization — one of Europe's earliest. Each island has its own dialect, cuisine, and traditions, making the Greek islands a mosaic of culture."] },
  { id: "Olive Tree",      title: "Olive Tree",          category: "Traditions", searchWord: "olive",       game: "/games/vocabquiz",    gameLabel: "Vocab Quiz",       image: "https://www.oliveoil.com/content/images/size/w1520/2023/04/PJ-Kabos_Greek-extra-virgin-olive-oil_award-winning_evoo_olives_high-phenolic_polyphenols_healthy_mediterranean-diet__premium_Greece_highest_nobu-matsuhisa_organic_about_sustainable.jpg", href: "https://en.wikipedia.org/wiki/Olive_oil_in_Greece", back: ["The olive tree is one of Greece's most sacred symbols. According to myth, the goddess Athena gifted the olive tree to Athens, winning the city's patronage. Olive branches symbolized peace and victory in ancient times.", "Greece is one of the world's top producers of olive oil, which is central to Greek cuisine, medicine, and religion. Ancient olive trees still standing in Greece are over 2,000 years old and continue to bear fruit."] },
];

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%231a1a2e'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' font-family='serif'%3E🏛️%3C/text%3E%3C/svg%3E";

function FlipCard({ title, image, back, searchWord, game, gameLabel, onOpenDetails }: {
  title: string; image: string; back: string[]; searchWord: string; game: string; gameLabel: string; onOpenDetails: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const src = imgError ? FALLBACK : image;
  return (
    <div className="flip-card aspect-[4/5] cursor-pointer w-full max-w-[320px] mx-auto" onClick={() => setFlipped(!flipped)}>
      <div className={`flip-card-inner ${flipped ? "flipped" : ""}`} style={{ height: "100%" }}>
        <div className="flip-card-front relative flex items-center justify-center p-6">
          <img src={src} alt={title} className="absolute inset-0 w-full h-full object-cover" onError={() => setImgError(true)} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.65) 70%)" }} />
          <button type="button" className="absolute inset-0 z-10" aria-label={`Open details for ${title}`} tabIndex={-1} onClick={e => { e.stopPropagation(); onOpenDetails(); }} />
          <h2 className="relative z-20 text-xl font-bold text-white text-center px-4 py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", textShadow: "0 2px 10px rgba(0,0,0,0.7)", fontFamily: "'Playfair Display', serif" }}>{title}</h2>
        </div>
        <div className="flip-card-back flex flex-col justify-between p-6 sm:p-8 text-sm sm:text-base leading-relaxed" style={{ background: "#ffffff" }}>
          <div>
            <h3 className="text-orange-500 font-bold text-lg mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
            <div className="space-y-2">{back.map((p, i) => <p key={i} className="text-gray-900 font-medium">{p}</p>)}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Link href={`/signin-prompt?from=${encodeURIComponent(game)}`} onClick={e => e.stopPropagation()} className="w-full text-center text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-3 py-2 rounded-xl transition shadow-md shadow-orange-500/20">
              🎮 Test Your Knowledge — {gameLabel}
            </Link>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-xs">Tap to flip back</p>
              <Link href={`/search?word=${encodeURIComponent(searchWord)}`} onClick={e => e.stopPropagation()} className="text-xs font-bold text-orange-500 hover:text-orange-400 transition">
                🔍 Search in Dictionary
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CultureClient() {
  const [mounted, setMounted] = useState(false);
  const [wod, setWod] = useState<WordOfDay | null>(null);
  const [factIndex, setFactIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<(typeof CARDS)[number] | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/word-of-day").then(r => r.json()).then(d => { if (d?.word) setWod(d); }).catch(() => {});
    tickerRef.current = setInterval(() => setFactIndex(i => (i + 1) % FUN_FACTS.length), 4000);
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, []);

  useEffect(() => {
    if (!selectedCard) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedCard(null); };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = prev; };
  }, [selectedCard]);

  const categories = ["All", "History", "Art", "Food", "People", "Traditions"];
  const filtered = CARDS.filter(c =>
    (activeCategory === "All" || c.category === activeCategory) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="w-full bg-orange-500/10 border-b border-orange-500/20 py-2 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="shrink-0 text-orange-400 text-xs font-black uppercase tracking-widest">⚡ Fun Fact</span>
          <span className="text-gray-400 text-xs">·</span>
          <p className="text-gray-300 text-xs flex-1 truncate" suppressHydrationWarning>{mounted ? FUN_FACTS[factIndex] : FUN_FACTS[0]}</p>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-10 pb-2">
        <div className="flex flex-col sm:flex-row gap-3 items-center mb-4">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search topics..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition text-xs">✕</button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${activeCategory === cat ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white/5 border-white/10 text-gray-400 hover:border-orange-500/40 hover:text-white"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-4 pb-2">
        {wod && (
          <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(249,115,22,0.12),transparent_60%)] pointer-events-none" />
            <div className="shrink-0 flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">✨ Word of the Day</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl font-black text-amber-400" style={{ fontFamily: "'Playfair Display', serif" }}>{wod.word}</span>
                <span className="text-gray-400 text-sm font-medium">— {wod.english_word}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1 line-clamp-1">{wod.definition}</p>
            </div>
            <Link href={`/search?word=${encodeURIComponent(wod.english_word)}`} className="shrink-0 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/20">
              Explore Word →
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 w-full max-w-7xl mx-auto p-6 sm:p-8 lg:p-12 place-items-center">
        {filtered.map(card => (
          <FlipCard key={card.id} title={card.title} image={card.image} back={card.back}
            searchWord={card.searchWord} game={card.game} gameLabel={card.gameLabel}
            onOpenDetails={() => setSelectedCard(card)} />
        ))}
        {filtered.length === 0 && mounted && (
          <div className="col-span-full flex flex-col items-center py-20 gap-3">
            <p className="text-4xl">🏛️</p>
            <p className="text-gray-400 font-semibold">No topics found for &quot;{search}&quot;</p>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="text-xs text-orange-400 hover:text-orange-300 transition">Clear filters</button>
          </div>
        )}
      </div>

      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="culture-details-title" onMouseDown={() => setSelectedCard(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden" onMouseDown={e => e.stopPropagation()}>
            <div className="p-5 sm:p-6 flex flex-col max-h-[80vh]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="culture-details-title" className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>{selectedCard.title}</h2>
                  <p className="text-gray-400 text-sm mt-1">Tap outside to close</p>
                </div>
                <button type="button" className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition" style={{ background: "#f3f4f6", border: "1px solid #d1d5db", color: "#374151" }} onClick={() => setSelectedCard(null)}>Close</button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                <div className="w-full aspect-[16/9] md:aspect-auto md:h-full rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
                  <img src={selectedCard.image} alt={selectedCard.title} className="h-full w-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }} />
                </div>
                <div className="min-h-0 flex flex-col">
                  <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-3 leading-relaxed">
                    {selectedCard.back.map((p, i) => <p key={i} className="text-gray-900 font-medium">{p}</p>)}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2 justify-end">
                    <Link href={`/signin-prompt?from=${encodeURIComponent(selectedCard.game)}`} className="w-full sm:w-auto text-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-4 py-2 text-sm font-black text-white transition shadow-md shadow-orange-500/20">
                      🎮 Test Your Knowledge — {selectedCard.gameLabel}
                    </Link>
                    {selectedCard.href && (
                      <a className="w-full sm:w-auto text-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition" href={selectedCard.href} target="_blank" rel="noopener noreferrer">
                        Full details (sources)
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
