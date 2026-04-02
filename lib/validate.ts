// Shared input validation helpers — no external dependencies

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function isValidId(id: any): boolean {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
}

export function isValidScore(score: any): boolean {
  const n = Number(score);
  return Number.isFinite(n) && n >= 0 && n <= 1_000_000;
}

export function isValidGameName(game: string): boolean {
  return typeof game === "string" && game.trim().length > 0 && game.length <= 100;
}

export function isValidWord(word: string): boolean {
  return typeof word === "string" && word.trim().length > 0 && word.length <= 100;
}

export function isValidSlug(slug: string): boolean {
  return typeof slug === "string" && /^[a-z0-9-]+$/.test(slug) && slug.length <= 64;
}

export function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 6 && password.length <= 128;
}

export function sanitize(str: string): string {
  return str.replace(/[\r\n\t]/g, " ").trim().slice(0, 255);
}
