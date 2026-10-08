'use client';

export default function UserRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center px-4 py-12">
      <section className="w-full rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">CashCoin</p>
        <h1 className="mt-3 text-2xl font-black text-slate-900">We could not load this page</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Please try again. If the problem continues, refresh the page after checking your connection.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
        >
          Try again
        </button>
        {process.env.NODE_ENV === "development" && error.message ? (
          <p className="mt-4 break-words text-xs text-slate-400">{error.message}</p>
        ) : null}
      </section>
    </main>
  );
}
