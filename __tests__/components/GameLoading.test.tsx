import { render, screen } from "@testing-library/react";
import GameLoading from "@/components/GameLoading";

describe("GameLoading", () => {
  it("renders loading text", () => {
    render(<GameLoading />);
    expect(screen.getByText("Loading game...")).toBeInTheDocument();
  });

  it("renders the spinner element", () => {
    const { container } = render(<GameLoading />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });
});
