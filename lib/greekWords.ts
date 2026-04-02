export type GreekWord = {
  greek: string;
  transliteration: string;
  english: string;
  category: string;
};

export const greekWords: GreekWord[] = [
  // Mythology
  { greek: "χάος", transliteration: "chaos", english: "the void, primordial emptiness", category: "Mythology" },
  { greek: "ἔρως", transliteration: "eros", english: "romantic desire", category: "Mythology" },
  { greek: "νέμεσις", transliteration: "nemesis", english: "retribution, divine vengeance", category: "Mythology" },
  { greek: "μοῖρα", transliteration: "moira", english: "fate, destiny, one's share", category: "Mythology" },
  { greek: "ψυχή", transliteration: "psyche", english: "soul, mind, spirit", category: "Mythology" },
  { greek: "ἄτλας", transliteration: "atlas", english: "one who carries, endures", category: "Mythology" },
  { greek: "φοῖνιξ", transliteration: "phoenix", english: "a bird reborn from ashes", category: "Mythology" },
  { greek: "ὕβρις", transliteration: "hubris", english: "excessive pride, arrogance", category: "Mythology" },
  { greek: "τιτάν", transliteration: "titan", english: "a powerful giant deity", category: "Mythology" },
  { greek: "ὄλυμπος", transliteration: "olympos", english: "home of the gods, Mount Olympus", category: "Mythology" },
  { greek: "ἀμβροσία", transliteration: "ambrosia", english: "food of the gods, immortality", category: "Mythology" },
  { greek: "νέκταρ", transliteration: "nektar", english: "drink of the gods", category: "Mythology" },
  { greek: "ἅδης", transliteration: "hades", english: "the underworld, realm of the dead", category: "Mythology" },
  { greek: "ἐλύσιον", transliteration: "elysion", english: "paradise, realm of the blessed dead", category: "Mythology" },
  { greek: "τάρταρος", transliteration: "tartaros", english: "the deepest abyss, place of punishment", category: "Mythology" },
  { greek: "μῦθος", transliteration: "mythos", english: "myth, story, legend", category: "Mythology" },
  { greek: "ἥρως", transliteration: "heros", english: "hero, warrior of great strength", category: "Mythology" },
  { greek: "δράκων", transliteration: "drakon", english: "dragon, serpent", category: "Mythology" },
  { greek: "σειρήν", transliteration: "seiren", english: "siren, enchanting creature", category: "Mythology" },
  { greek: "κένταυρος", transliteration: "kentauros", english: "centaur, half-man half-horse", category: "Mythology" },

  // Philosophy
  { greek: "λόγος", transliteration: "logos", english: "word, reason, discourse", category: "Philosophy" },
  { greek: "ἀρετή", transliteration: "arete", english: "virtue, excellence, moral goodness", category: "Philosophy" },
  { greek: "σοφία", transliteration: "sophia", english: "wisdom, knowledge", category: "Philosophy" },
  { greek: "ἀλήθεια", transliteration: "aletheia", english: "truth, disclosure, unconcealedness", category: "Philosophy" },
  { greek: "εἰρήνη", transliteration: "eirene", english: "tranquility, stillness", category: "Philosophy" },
  { greek: "δικαιοσύνη", transliteration: "dikaiosyne", english: "justice, righteousness", category: "Philosophy" },
  { greek: "ἐλευθερία", transliteration: "eleutheria", english: "freedom, liberty", category: "Philosophy" },
  { greek: "κόσμος", transliteration: "kosmos", english: "order, universe", category: "Philosophy" },
  { greek: "φιλοσοφία", transliteration: "philosophia", english: "love of wisdom", category: "Philosophy" },
  { greek: "ἐπιστήμη", transliteration: "episteme", english: "knowledge, understanding, science", category: "Philosophy" },
  { greek: "ἦθος", transliteration: "ethos", english: "character, moral nature, custom", category: "Philosophy" },
  { greek: "πάθος", transliteration: "pathos", english: "suffering, emotion, experience", category: "Philosophy" },
  { greek: "τέλος", transliteration: "telos", english: "end, purpose, goal", category: "Philosophy" },
  { greek: "ἀγαθόν", transliteration: "agathon", english: "the good, goodness", category: "Philosophy" },
  { greek: "εὐδαιμονία", transliteration: "eudaimonia", english: "human flourishing, well-being", category: "Philosophy" },
  { greek: "φρόνησις", transliteration: "phronesis", english: "practical wisdom, prudence", category: "Philosophy" },
  { greek: "δόξα", transliteration: "doxa", english: "opinion, belief, glory", category: "Philosophy" },
  { greek: "νοῦς", transliteration: "nous", english: "mind, intellect, reason", category: "Philosophy" },
  { greek: "ἀπορία", transliteration: "aporia", english: "puzzlement, philosophical impasse", category: "Philosophy" },
  { greek: "διαλεκτική", transliteration: "dialektike", english: "dialectic, art of debate", category: "Philosophy" },

  // Emotions
  { greek: "ἀγάπη", transliteration: "agape", english: "unconditional divine affection", category: "Emotions" },
  { greek: "φιλία", transliteration: "philia", english: "friendship, affection between companions", category: "Emotions" },
  { greek: "λύπη", transliteration: "lype", english: "grief, sorrow, sadness", category: "Emotions" },
  { greek: "χαρά", transliteration: "chara", english: "joy, delight", category: "Emotions" },
  { greek: "θυμός", transliteration: "thymos", english: "anger, spirit, passion", category: "Emotions" },
  { greek: "φόβος", transliteration: "phobos", english: "fear, panic, dread", category: "Emotions" },
  { greek: "ἐλπίς", transliteration: "elpis", english: "hope, expectation", category: "Emotions" },
  { greek: "ζῆλος", transliteration: "zelos", english: "zeal, jealousy, rivalry", category: "Emotions" },
  { greek: "στοργή", transliteration: "storge", english: "familial bond, natural affection", category: "Emotions" },
  { greek: "αἰδώς", transliteration: "aidos", english: "shame, modesty, reverence", category: "Emotions" },
  { greek: "ἄχθος", transliteration: "achthos", english: "burden, grief, distress", category: "Emotions" },
  { greek: "μέριμνα", transliteration: "merimna", english: "anxiety, worry, care", category: "Emotions" },
  { greek: "θαῦμα", transliteration: "thauma", english: "wonder, amazement, marvel", category: "Emotions" },
  { greek: "ἀγανάκτησις", transliteration: "aganaktesis", english: "indignation, righteous anger", category: "Emotions" },
  { greek: "νόστος", transliteration: "nostos", english: "homecoming, longing to return", category: "Emotions" },
  { greek: "μελαγχολία", transliteration: "melancholia", english: "melancholy, deep sadness", category: "Emotions" },

  // Nature
  { greek: "γῆ", transliteration: "ge", english: "earth, land, soil", category: "Nature" },
  { greek: "ὕδωρ", transliteration: "hydor", english: "water", category: "Nature" },
  { greek: "πῦρ", transliteration: "pyr", english: "fire", category: "Nature" },
  { greek: "ἄνεμος", transliteration: "anemos", english: "wind", category: "Nature" },
  { greek: "ἥλιος", transliteration: "helios", english: "sun", category: "Nature" },
  { greek: "σελήνη", transliteration: "selene", english: "moon", category: "Nature" },
  { greek: "ἄστρον", transliteration: "astron", english: "star, constellation", category: "Nature" },
  { greek: "θάλασσα", transliteration: "thalassa", english: "sea, ocean", category: "Nature" },
  { greek: "ὄρος", transliteration: "oros", english: "mountain", category: "Nature" },
  { greek: "ποταμός", transliteration: "potamos", english: "river", category: "Nature" },
  { greek: "δάσος", transliteration: "dasos", english: "forest, woodland", category: "Nature" },
  { greek: "νεφέλη", transliteration: "nephele", english: "cloud", category: "Nature" },
  { greek: "χιών", transliteration: "chion", english: "snow", category: "Nature" },
  { greek: "βροντή", transliteration: "bronte", english: "thunder", category: "Nature" },
  { greek: "ἀστραπή", transliteration: "astrape", english: "lightning", category: "Nature" },
  { greek: "ἄνθος", transliteration: "anthos", english: "flower, blossom", category: "Nature" },
  { greek: "δένδρον", transliteration: "dendron", english: "tree", category: "Nature" },
  { greek: "πέτρα", transliteration: "petra", english: "rock, stone", category: "Nature" },
  { greek: "ἀήρ", transliteration: "aer", english: "air, atmosphere", category: "Nature" },
  { greek: "σεισμός", transliteration: "seismos", english: "earthquake, shaking", category: "Nature" },

  // Medical
  { greek: "καρδία", transliteration: "kardia", english: "heart", category: "Medical" },
  { greek: "ψυχιατρική", transliteration: "psychiatrike", english: "psychiatry, healing of the mind", category: "Medical" },
  { greek: "βιολογία", transliteration: "biologia", english: "biology, study of life", category: "Medical" },
  { greek: "νευρολογία", transliteration: "neurologia", english: "neurology, study of nerves", category: "Medical" },
  { greek: "φαρμακολογία", transliteration: "pharmakologia", english: "pharmacology, study of drugs", category: "Medical" },
  { greek: "ἀνατομία", transliteration: "anatomia", english: "anatomy, cutting up the body", category: "Medical" },
  { greek: "παθολογία", transliteration: "pathologia", english: "pathology, study of disease", category: "Medical" },
  { greek: "χειρουργία", transliteration: "cheirourgía", english: "surgery, working with hands", category: "Medical" },
  { greek: "δερματολογία", transliteration: "dermatologia", english: "dermatology, study of skin", category: "Medical" },
  { greek: "ὀφθαλμολογία", transliteration: "ophthalmologia", english: "ophthalmology, study of eyes", category: "Medical" },
  { greek: "ὀδοντολογία", transliteration: "odontologia", english: "dentistry, study of teeth", category: "Medical" },
  { greek: "ὀρθοπαιδεία", transliteration: "orthopaedeia", english: "orthopedics, correction of bones", category: "Medical" },
  { greek: "γυναικολογία", transliteration: "gynaikologia", english: "gynecology, study of women's health", category: "Medical" },
  { greek: "παιδιατρική", transliteration: "paediatrike", english: "pediatrics, care of children", category: "Medical" },
  { greek: "ἐπιδημία", transliteration: "epidemia", english: "epidemic, widespread disease", category: "Medical" },
  { greek: "διάγνωσις", transliteration: "diagnosis", english: "diagnosis, distinguishing a disease", category: "Medical" },
  { greek: "θεραπεία", transliteration: "therapeia", english: "therapy, healing, treatment", category: "Medical" },
  { greek: "ὑγιεινή", transliteration: "hygiene", english: "hygiene, health practices", category: "Medical" },

  // Common Words
  { greek: "ἄνθρωπος", transliteration: "anthropos", english: "human being, person", category: "Common" },
  { greek: "οἶκος", transliteration: "oikos", english: "house, home, household", category: "Common" },
  { greek: "χρόνος", transliteration: "chronos", english: "time", category: "Common" },
  { greek: "τόπος", transliteration: "topos", english: "place, location", category: "Common" },
  { greek: "φῶς", transliteration: "phos", english: "light", category: "Common" },
  { greek: "σκότος", transliteration: "skotos", english: "darkness, shadow", category: "Common" },
  { greek: "ζωή", transliteration: "zoe", english: "life", category: "Common" },
  { greek: "θάνατος", transliteration: "thanatos", english: "death", category: "Common" },
  { greek: "δύναμις", transliteration: "dynamis", english: "power, force, ability", category: "Common" },
  { greek: "γνῶσις", transliteration: "gnosis", english: "knowledge, insight", category: "Common" },
  { greek: "ὄνομα", transliteration: "onoma", english: "name", category: "Common" },
  { greek: "λόγος", transliteration: "logos", english: "word, speech", category: "Common" },
  { greek: "ἀριθμός", transliteration: "arithmos", english: "number, count", category: "Common" },
  { greek: "χρῆμα", transliteration: "chrema", english: "thing, money, matter", category: "Common" },
  { greek: "ὁδός", transliteration: "hodos", english: "road, way, path", category: "Common" },
  { greek: "πόλις", transliteration: "polis", english: "city, city-state", category: "Common" },
  { greek: "ἀγορά", transliteration: "agora", english: "marketplace, public gathering place", category: "Common" },
  { greek: "βιβλίον", transliteration: "biblion", english: "book, scroll", category: "Common" },
  { greek: "γράμμα", transliteration: "gramma", english: "letter, writing", category: "Common" },
  { greek: "μουσική", transliteration: "mousike", english: "music, art of the muses", category: "Common" },

  // Virtues & Values
  { greek: "σωφροσύνη", transliteration: "sophrosyne", english: "temperance, self-control, moderation", category: "Virtues" },
  { greek: "ἀνδρεία", transliteration: "andreia", english: "courage, bravery, manliness", category: "Virtues" },
  { greek: "πίστις", transliteration: "pistis", english: "faith, trust, loyalty", category: "Virtues" },
  { greek: "ταπεινοφροσύνη", transliteration: "tapeinophrosyne", english: "humility, lowliness of mind", category: "Virtues" },
  { greek: "φιλανθρωπία", transliteration: "philanthropia", english: "benevolence toward humanity", category: "Virtues" },
  { greek: "εὐσέβεια", transliteration: "eusebeia", english: "piety, reverence, godliness", category: "Virtues" },
  { greek: "ἐγκράτεια", transliteration: "enkrateia", english: "self-mastery, continence", category: "Virtues" },
  { greek: "μεγαλοψυχία", transliteration: "megalopsychia", english: "greatness of soul, magnanimity", category: "Virtues" },
  { greek: "φιλοτιμία", transliteration: "philotimia", english: "love of honor, ambition", category: "Virtues" },
  { greek: "χάρις", transliteration: "charis", english: "grace, favor, gratitude", category: "Virtues" },

  // Arts & Culture
  { greek: "ποίησις", transliteration: "poiesis", english: "poetry, creation, making", category: "Arts" },
  { greek: "τέχνη", transliteration: "techne", english: "art, craft, skill", category: "Arts" },
  { greek: "μοῦσα", transliteration: "mousa", english: "muse, source of inspiration", category: "Arts" },
  { greek: "θέατρον", transliteration: "theatron", english: "theater, place for viewing", category: "Arts" },
  { greek: "τραγῳδία", transliteration: "tragodia", english: "tragedy, goat song", category: "Arts" },
  { greek: "κωμῳδία", transliteration: "komodia", english: "comedy, festive song", category: "Arts" },
  { greek: "ῥυθμός", transliteration: "rhythmos", english: "rhythm, measured motion", category: "Arts" },
  { greek: "ἁρμονία", transliteration: "harmonia", english: "harmony, agreement, concord", category: "Arts" },
  { greek: "χορός", transliteration: "choros", english: "dance, chorus, group dance", category: "Arts" },
  { greek: "εἰκών", transliteration: "eikon", english: "image, likeness, icon", category: "Arts" },

  // Science & Math
  { greek: "γεωμετρία", transliteration: "geometria", english: "geometry, measuring the earth", category: "Science" },
  { greek: "ἀστρονομία", transliteration: "astronomia", english: "astronomy, law of the stars", category: "Science" },
  { greek: "φυσική", transliteration: "physike", english: "physics, study of nature", category: "Science" },
  { greek: "χημεία", transliteration: "chemeia", english: "chemistry, art of transformation", category: "Science" },
  { greek: "μαθηματικά", transliteration: "mathematika", english: "mathematics, things learned", category: "Science" },
  { greek: "γεωγραφία", transliteration: "geographia", english: "geography, writing about the earth", category: "Science" },
  { greek: "ψυχολογία", transliteration: "psychologia", english: "psychology, study of the soul", category: "Science" },
  { greek: "κοσμολογία", transliteration: "kosmologia", english: "cosmology, study of the universe", category: "Science" },
  { greek: "ἄτομον", transliteration: "atomon", english: "atom, indivisible particle", category: "Science" },
  { greek: "θεωρία", transliteration: "theoria", english: "theory, contemplation, speculation", category: "Science" },

  // Religion & Spirituality
  { greek: "θεός", transliteration: "theos", english: "god, deity", category: "Religion" },
  { greek: "ἄγγελος", transliteration: "angelos", english: "angel, messenger", category: "Religion" },
  { greek: "εὐαγγέλιον", transliteration: "euangelion", english: "gospel, good news", category: "Religion" },
  { greek: "ἐκκλησία", transliteration: "ekklesia", english: "church, assembly of the called", category: "Religion" },
  { greek: "βάπτισμα", transliteration: "baptisma", english: "baptism, immersion in water", category: "Religion" },
  { greek: "προφήτης", transliteration: "prophetes", english: "prophet, one who speaks forth", category: "Religion" },
  { greek: "ἀπόστολος", transliteration: "apostolos", english: "apostle, one who is sent", category: "Religion" },
  { greek: "παράδεισος", transliteration: "paradeisos", english: "paradise, garden, heaven", category: "Religion" },
  { greek: "ἁμαρτία", transliteration: "hamartia", english: "sin, missing the mark", category: "Religion" },
  { greek: "σωτηρία", transliteration: "soteria", english: "salvation, deliverance", category: "Religion" },

  // Body & Mind
  { greek: "κεφαλή", transliteration: "kephale", english: "head", category: "Body" },
  { greek: "χείρ", transliteration: "cheir", english: "hand", category: "Body" },
  { greek: "πούς", transliteration: "pous", english: "foot", category: "Body" },
  { greek: "ὀφθαλμός", transliteration: "ophthalmos", english: "eye", category: "Body" },
  { greek: "οὖς", transliteration: "ous", english: "ear", category: "Body" },
  { greek: "στόμα", transliteration: "stoma", english: "mouth", category: "Body" },
  { greek: "γλῶσσα", transliteration: "glossa", english: "tongue, language", category: "Body" },
  { greek: "ὀστέον", transliteration: "osteon", english: "bone", category: "Body" },
  { greek: "αἷμα", transliteration: "haima", english: "blood", category: "Body" },
  { greek: "πνεῦμα", transliteration: "pneuma", english: "breath, spirit, wind", category: "Body" },
];

export function searchGreekWords(query: string): GreekWord[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return greekWords.filter(
    (w) =>
      w.greek.includes(q) ||
      w.transliteration.toLowerCase().includes(q) ||
      w.english.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q)
  );
}
