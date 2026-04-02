import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("next/link", () => ({ __esModule: true, default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }));
jest.mock("@/lib/submitScore", () => ({ submitScore: jest.fn(() => Promise.resolve([])), fetchBestScore: jest.fn(() => Promise.resolve(0)) }));
jest.mock("@/lib/useSound", () => ({ useSound: () => ({ playCorrect: jest.fn(), playWrong: jest.fn() }) }));
jest.mock("@/components/AchievementToast", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/GameErrorBoundary", () => ({ __esModule: true, default: ({ children }: any) => <>{children}</> }));
jest.mock("@/components/HowToPlay", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/PauseButton", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/DifficultySelect", () => ({
  __esModule: true,
  default: ({ onSelect }: any) => <button onClick={() => onSelect("Easy")}>Easy</button>,
  DIFF_STYLES: { Easy: { color: "text-green-400" }, Medium: { color: "text-yellow-400" }, Hard: { color: "text-red-400" } },
  Difficulty: {},
}));
jest.mock("@/components/GameLoading", () => ({ __esModule: true, default: () => <div>Loading...</div> }));

import { submitScore } from "@/lib/submitScore";

// ── ABC Order ─────────────────────────────────────────────────────────────────
describe("ABCOrder game logic", () => {
  let ABCOrderPage: any;

  beforeAll(async () => {
    ({ default: ABCOrderPage } = await import("@/app/games/abcorder/page"));
  });

  beforeEach(() => jest.clearAllMocks());

  it("renders the game title", () => {
    render(<ABCOrderPage />);
    expect(screen.getByText("ABC Order")).toBeInTheDocument();
  });

  it("shows score starting at 0", () => {
    render(<ABCOrderPage />);
    expect(screen.getByText(/score: 0/i)).toBeInTheDocument();
  });

  it("moves word to arranged area when clicked", () => {
    render(<ABCOrderPage />);
    const wordButtons = screen.getAllByRole("button").filter(
      b => !b.textContent?.match(/check|next|play|pause|back|how/i)
    );
    if (wordButtons.length > 0) {
      fireEvent.click(wordButtons[0]);
      expect(screen.getByText(/✕/)).toBeInTheDocument();
    }
  });

  it("shows Check button when all words are arranged", () => {
    render(<ABCOrderPage />);
    const wordButtons = screen.getAllByRole("button").filter(
      b => !b.textContent?.match(/check|next|play|pause|back|how/i)
    );
    wordButtons.forEach(b => fireEvent.click(b));
    expect(screen.getByText(/check/i)).toBeInTheDocument();
  });
});

// ── Fake or Fact ──────────────────────────────────────────────────────────────
describe("FakeOrFact game logic", () => {
  let FakeOrFactPage: any;

  beforeAll(async () => {
    ({ default: FakeOrFactPage } = await import("@/app/games/fakeorfact/page"));
  });

  beforeEach(() => jest.clearAllMocks());

  it("shows difficulty select screen initially", () => {
    render(<FakeOrFactPage />);
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });

  it("starts game after selecting difficulty", async () => {
    render(<FakeOrFactPage />);
    fireEvent.click(screen.getByText("Easy"));
    await waitFor(() => expect(screen.getByText(/fake or fact/i)).toBeInTheDocument());
  });

  it("shows FACT and FAKE buttons after difficulty selected", async () => {
    render(<FakeOrFactPage />);
    fireEvent.click(screen.getByText("Easy"));
    await waitFor(() => {
      expect(screen.getByText(/✅ fact/i)).toBeInTheDocument();
      expect(screen.getByText(/❌ fake/i)).toBeInTheDocument();
    });
  });

  it("shows explanation after answering", async () => {
    render(<FakeOrFactPage />);
    fireEvent.click(screen.getByText("Easy"));
    await waitFor(() => screen.getByText(/✅ fact/i));
    fireEvent.click(screen.getByText(/✅ fact/i));
    await waitFor(() => expect(screen.getByText(/💡/)).toBeInTheDocument());
  });

  it("calls submitScore when all questions are answered", async () => {
    render(<FakeOrFactPage />);
    fireEvent.click(screen.getByText("Easy"));

    for (let i = 0; i < 4; i++) {
      await waitFor(() => screen.getByText(/✅ fact/i));
      fireEvent.click(screen.getByText(/✅ fact/i));
      await waitFor(() => screen.getByText(/next →|see results/i));
      fireEvent.click(screen.getByText(/next →|see results/i));
    }

    await waitFor(() =>
      expect(submitScore).toHaveBeenCalledWith("Fake or Fact", expect.any(Number))
    );
  });
});

// ── Flag Quiz ─────────────────────────────────────────────────────────────────
describe("FlagQuiz game logic", () => {
  let FlagQuizPage: any;

  beforeAll(async () => {
    ({ default: FlagQuizPage } = await import("@/app/games/flagquiz/page"));
  });

  beforeEach(() => jest.clearAllMocks());

  it("renders the game title", () => {
    render(<FlagQuizPage />);
    expect(screen.getByText("Flag Quiz")).toBeInTheDocument();
  });

  it("shows score starting at 0", () => {
    render(<FlagQuizPage />);
    expect(screen.getByText(/score: 0/i)).toBeInTheDocument();
  });

  it("shows 4 answer options", async () => {
    render(<FlagQuizPage />);
    await waitFor(() => {
      const options = screen.getAllByRole("button").filter(
        b => !b.textContent?.match(/←|play again|pause|how/i)
      );
      expect(options.length).toBe(4);
    });
  });

  it("highlights answer after picking", async () => {
    render(<FlagQuizPage />);
    await waitFor(() => screen.getAllByRole("button"));
    const options = screen.getAllByRole("button").filter(
      b => !b.textContent?.match(/←|play again|pause|how/i)
    );
    if (options.length >= 1) {
      fireEvent.click(options[0]);
      await waitFor(() => {
        const green = document.querySelector(".bg-green-500\\/30");
        const red   = document.querySelector(".bg-red-500\\/30");
        expect(green || red).toBeTruthy();
      });
    }
  });
});
