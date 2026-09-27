import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-emerald-600">
            CashCoin
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-gray-700 transition hover:text-emerald-600"
          >
            Login
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 py-20 lg:px-8">
        <div className="w-full max-w-3xl text-center">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Welcome to CashCoin
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Earn Coins by Completing Tasks
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Pakistan&apos;s trusted task earning platform
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-w-36 items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="inline-flex min-w-36 items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-emerald-600 hover:text-emerald-600"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-6 py-6 text-center text-sm text-gray-500">
        © 2025 CashCoin. All rights reserved.
      </footer>
    </main>
  );
}
