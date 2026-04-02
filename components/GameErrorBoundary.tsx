"use client";
import { Component, ReactNode } from "react";
import Link from "next/link";

interface Props { children: ReactNode; gameName?: string; }
interface State { hasError: boolean; message: string; }

export default class GameErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("[GameErrorBoundary]", error);
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="glass-card border-l-[5px] border-l-red-500 rounded-[1.75rem] p-10 max-w-[440px] w-[92%] text-center">
          <p className="text-6xl mb-4">⚠️</p>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {this.props.gameName ? `${this.props.gameName} crashed` : "Something went wrong"}
          </h2>
          <p className="text-gray-400 text-sm mb-6">{this.state.message || "An unexpected error occurred."}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.reset}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
            >
              🔄 Try Again
            </button>
            <Link href="/games" className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm">
              ← Back to Games
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
