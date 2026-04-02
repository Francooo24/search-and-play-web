import {
  isValidEmail,
  isValidId,
  isValidScore,
  isValidGameName,
  isValidWord,
  isValidSlug,
  isValidPassword,
  sanitize,
} from "@/lib/validate";

describe("isValidEmail", () => {
  it.each(["user@example.com", "a@b.co", "test+tag@domain.org"])("accepts valid email: %s", (e) => {
    expect(isValidEmail(e)).toBe(true);
  });
  it.each(["notanemail", "@no-local.com", "no-at-sign", "a@b", ""])("rejects invalid email: %s", (e) => {
    expect(isValidEmail(e)).toBe(false);
  });
  it("rejects email over 254 chars", () => {
    expect(isValidEmail("a".repeat(250) + "@b.com")).toBe(false);
  });
});

describe("isValidId", () => {
  it.each([1, 100, 999999])("accepts positive integer: %s", (id) => {
    expect(isValidId(id)).toBe(true);
  });
  it.each([0, -1, 1.5, "abc", null, undefined])("rejects invalid id: %s", (id) => {
    expect(isValidId(id)).toBe(false);
  });
});

describe("isValidScore", () => {
  it.each([0, 1, 500, 1_000_000])("accepts valid score: %s", (s) => {
    expect(isValidScore(s)).toBe(true);
  });
  it.each([-1, 1_000_001, Infinity, NaN, "abc"])("rejects invalid score: %s", (s) => {
    expect(isValidScore(s)).toBe(false);
  });
});

describe("isValidGameName", () => {
  it("accepts normal game name", () => expect(isValidGameName("Speed Trivia")).toBe(true));
  it("rejects empty string", () => expect(isValidGameName("")).toBe(false));
  it("rejects whitespace only", () => expect(isValidGameName("   ")).toBe(false));
  it("rejects name over 100 chars", () => expect(isValidGameName("a".repeat(101))).toBe(false));
});

describe("isValidSlug", () => {
  it.each(["hangman", "trivia-blitz", "abc123"])("accepts valid slug: %s", (s) => {
    expect(isValidSlug(s)).toBe(true);
  });
  it.each(["Has Spaces", "UPPER", "special!", ""])("rejects invalid slug: %s", (s) => {
    expect(isValidSlug(s)).toBe(false);
  });
});

describe("isValidPassword", () => {
  it("accepts password of 6+ chars", () => expect(isValidPassword("abc123")).toBe(true));
  it("rejects password under 6 chars", () => expect(isValidPassword("abc")).toBe(false));
  it("rejects empty string", () => expect(isValidPassword("")).toBe(false));
  it("rejects password over 128 chars", () => expect(isValidPassword("a".repeat(129))).toBe(false));
});

describe("sanitize", () => {
  it("trims whitespace", () => expect(sanitize("  hello  ")).toBe("hello"));
  it("replaces newlines and tabs with spaces", () => expect(sanitize("a\nb\tc")).toBe("a b c"));
  it("truncates to 255 chars", () => expect(sanitize("a".repeat(300))).toHaveLength(255));
});
