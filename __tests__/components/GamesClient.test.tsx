import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("next/navigation", () => ({ useRouter: jest.fn(() => ({ push: jest.fn() })) }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }));
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, saved: true }) })) as jest.Mock;

import GamesClient from "@/components/GamesClient";

const mockSections = [
  { group: "kids",  label: "Kids",  subtitle: "Fun for kids",  color: "blue"   },
  { group: "teen",  label: "Teen",  subtitle: "For teens",     color: "green"  },
  { group: "adult", label: "Adult", subtitle: "For adults",    color: "orange" },
];

const mockGames = [
  { slug: "hangman",  name: "Hangman",  icon: "🎯", desc: "Guess the word", group: "kids"  },
  { slug: "wordle",   name: "Wordle",   icon: "📝", desc: "Word puzzle",    group: "teen"  },
  { slug: "crossword",name: "Crossword",icon: "🔤", desc: "Fill the grid",  group: "adult" },
];

describe("GamesClient", () => {
  it("renders all game cards", () => {
    render(<GamesClient sections={mockSections} games={mockGames} favGames={[]} />);
    expect(screen.getByText("Hangman")).toBeInTheDocument();
    expect(screen.getByText("Wordle")).toBeInTheDocument();
    expect(screen.getByText("Crossword")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<GamesClient sections={mockSections} games={mockGames} favGames={[]} />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("filters games by search query", () => {
    render(<GamesClient sections={mockSections} games={mockGames} favGames={[]} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "hang" } });
    expect(screen.getByText("Hangman")).toBeInTheDocument();
    expect(screen.queryByText("Wordle")).not.toBeInTheDocument();
  });

  it("shows no results message when search has no matches", () => {
    render(<GamesClient sections={mockSections} games={mockGames} favGames={[]} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzzzz" } });
    expect(screen.getByText(/no games found/i)).toBeInTheDocument();
  });

  it("clears search when X button is clicked", () => {
    render(<GamesClient sections={mockSections} games={mockGames} favGames={[]} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "hang" } });
    fireEvent.click(screen.getByLabelText(/clear search/i));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByText("Wordle")).toBeInTheDocument();
  });

  it("shows result count in aria-live region", () => {
    render(<GamesClient sections={mockSections} games={mockGames} favGames={[]} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "hang" } });
    expect(screen.getByText(/1 result/i)).toBeInTheDocument();
  });

  it("renders HowToPlay boxes for each section", () => {
    render(<GamesClient sections={mockSections} games={mockGames} favGames={[]} />);
    expect(screen.getByText(/kids games guide/i)).toBeInTheDocument();
    expect(screen.getByText(/teen games guide/i)).toBeInTheDocument();
    expect(screen.getByText(/adult games guide/i)).toBeInTheDocument();
  });

  it("expands HowToPlay box on click", () => {
    render(<GamesClient sections={mockSections} games={mockGames} favGames={[]} />);
    const btn = screen.getByText(/kids games guide/i).closest("button")!;
    fireEvent.click(btn);
    expect(screen.getByText(/pick any game/i)).toBeInTheDocument();
  });

  it("renders fav button as filled star for saved games", () => {
    render(<GamesClient sections={mockSections} games={mockGames} favGames={["Hangman"]} />);
    const stars = screen.getAllByText("★");
    expect(stars.length).toBeGreaterThan(0);
  });
});
