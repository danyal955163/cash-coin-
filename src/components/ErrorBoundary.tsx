"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; title?: string };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("UI error boundary:", error, info); }
  render() { if (!this.state.hasError) return this.props.children; return <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-red-100"><h2 className="text-xl font-black text-slate-900">{this.props.title ?? "Something went wrong"}</h2><p className="mt-2 text-sm leading-6 text-slate-600">We could not load this section safely. Please refresh and try again.</p><button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white">Try Again</button></div>; }
}
