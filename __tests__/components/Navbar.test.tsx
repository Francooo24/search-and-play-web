import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("next/navigation", () => ({ usePathname: jest.fn(() => "/") }));
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock("next/link", () => ({ __esModule: true, default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }));

import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";

const mockSession = (session: any) => (useSession as jest.Mock).mockReturnValue({ data: session });

beforeEach(() => jest.clearAllMocks());

describe("Navbar", () => {
  it("renders Sign In link when not logged in", () => {
    mockSession(null);
    render(<Navbar />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it("renders nav items when not logged in", () => {
    mockSession(null);
    render(<Navbar />);
    expect(screen.getByText("Games")).toBeInTheDocument();
    expect(screen.getByText("Leaderboard")).toBeInTheDocument();
    expect(screen.getByText("Culture")).toBeInTheDocument();
  });

  it("renders user name when logged in", () => {
    mockSession({ user: { name: "Alice", is_admin: false } });
    render(<Navbar />);
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
  });

  it("renders admin panel link for admin users", () => {
    mockSession({ user: { name: "Admin", is_admin: true } });
    render(<Navbar />);
    expect(screen.getByText(/hello, admin/i)).toBeInTheDocument();
  });

  it("hides nav items for admin users", () => {
    mockSession({ user: { name: "Admin", is_admin: true } });
    render(<Navbar />);
    expect(screen.queryByText("Games")).not.toBeInTheDocument();
  });

  it("toggles mobile menu on hamburger click", () => {
    mockSession(null);
    render(<Navbar />);
    const hamburger = screen.getByRole("button", { hidden: true });
    fireEvent.click(hamburger);
    // Mobile menu should slide in (translate-x-0)
    const mobileMenu = document.querySelector(".translate-x-0");
    expect(mobileMenu).toBeInTheDocument();
  });
});
