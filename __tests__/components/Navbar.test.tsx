import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock("next/link", () => ({ __esModule: true, default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }));

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ unread: 0 }) })
) as jest.Mock;

import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";

const mockSession = (session: any) =>
  (useSession as jest.Mock).mockReturnValue({
    data: session,
    status: session ? "authenticated" : "unauthenticated",
  });

beforeEach(() => jest.clearAllMocks());

describe("Navbar", () => {
  it("renders Sign In link when not logged in", async () => {
    mockSession(null);
    await act(async () => { render(<Navbar />); });
    expect(screen.getAllByText(/sign in/i).length).toBeGreaterThan(0);
  });

  it("renders nav items when not logged in", async () => {
    mockSession(null);
    await act(async () => { render(<Navbar />); });
    expect(screen.getAllByText("Games").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Leaderboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dictionary").length).toBeGreaterThan(0);
  });

  it("renders user name when logged in", async () => {
    mockSession({ user: { name: "Alice", is_admin: false } });
    await act(async () => { render(<Navbar />); });
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
  });

  it("renders admin panel link for admin users", async () => {
    mockSession({ user: { name: "Admin", is_admin: true } });
    await act(async () => { render(<Navbar />); });
    expect(screen.getAllByText(/hello, admin/i).length).toBeGreaterThan(0);
  });

  it("hides nav items for admin users", async () => {
    mockSession({ user: { name: "Admin", is_admin: true } });
    await act(async () => { render(<Navbar />); });
    expect(screen.queryByText("Games")).not.toBeInTheDocument();
  });

  it("toggles mobile menu on hamburger click", async () => {
    mockSession(null);
    await act(async () => { render(<Navbar />); });
    const hamburger = document.querySelector(".md\\:hidden.flex.flex-col") as HTMLElement;
    if (hamburger) await act(async () => { fireEvent.click(hamburger); });
    const mobileMenu = document.querySelector(".translate-x-0");
    expect(mobileMenu).toBeInTheDocument();
  });
});
