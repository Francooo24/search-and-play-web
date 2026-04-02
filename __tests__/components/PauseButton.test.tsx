import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PauseButton from "@/components/PauseButton";

describe("PauseButton", () => {
  it("renders Pause button by default", () => {
    render(<PauseButton />);
    expect(screen.getByText(/pause/i)).toBeInTheDocument();
  });

  it("shows Resume and overlay when clicked", () => {
    render(<PauseButton />);
    fireEvent.click(screen.getByText(/pause/i));
    expect(screen.getByText(/resume game/i)).toBeInTheDocument();
    expect(screen.getByText(/game paused/i)).toBeInTheDocument();
  });

  it("calls onPause with true when paused", () => {
    const onPause = jest.fn();
    render(<PauseButton onPause={onPause} />);
    fireEvent.click(screen.getByText(/pause/i));
    expect(onPause).toHaveBeenCalledWith(true);
  });

  it("calls onPause with false when resumed", () => {
    const onPause = jest.fn();
    render(<PauseButton onPause={onPause} />);
    fireEvent.click(screen.getByText(/pause/i));
    fireEvent.click(screen.getByText(/resume game/i));
    expect(onPause).toHaveBeenLastCalledWith(false);
  });

  it("does not toggle when disabled", () => {
    const onPause = jest.fn();
    render(<PauseButton onPause={onPause} disabled />);
    fireEvent.click(screen.getByText(/pause/i));
    expect(onPause).not.toHaveBeenCalled();
  });

  it("auto-resumes when disabled prop becomes true while paused", () => {
    const onPause = jest.fn();
    const { rerender } = render(<PauseButton onPause={onPause} />);
    fireEvent.click(screen.getByText(/pause/i));
    expect(onPause).toHaveBeenCalledWith(true);
    rerender(<PauseButton onPause={onPause} disabled />);
    expect(onPause).toHaveBeenLastCalledWith(false);
  });
});
