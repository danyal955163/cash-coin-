"use client";

export default function BoyArcher({ aiming = false }: { aiming?: boolean }) {
  return (
    <div className={`relative h-36 w-36 shrink-0 transition-transform duration-300 ${aiming ? "-rotate-3 scale-105" : "animate-[pulse_3s_ease-in-out_infinite]"}`} aria-label="Boy archer">
      <svg viewBox="0 0 180 180" className="h-full w-full drop-shadow-xl" role="img">
        <path d="M54 164c3-35 14-53 37-53s35 18 38 53H54Z" fill="#2563eb" />
        <path d="M63 133h56v31H63z" fill="#1d4ed8" />
        <circle cx="91" cy="72" r="38" fill="#f6b67b" stroke="#7c2d12" strokeWidth="4" />
        <path d="M55 67c-1-30 19-48 43-48 25 0 38 17 35 42-14-11-25-18-41-17-12 1-22 10-37 23Z" fill="#3f2b1f" />
        <path d="M59 54c10-20 27-29 52-25" fill="none" stroke="#1f2937" strokeWidth="9" strokeLinecap="round" />
        <circle cx="78" cy="75" r="5" fill="#111827" /><circle cx="105" cy="75" r="5" fill="#111827" />
        <path d="M83 93c7 5 13 5 20 0" fill="none" stroke="#7c2d12" strokeWidth="4" strokeLinecap="round" />
        <path d="M62 120 36 143M117 120l24 21" stroke="#f6b67b" strokeWidth="12" strokeLinecap="round" />
        <path d="M31 142c27 10 39 10 58-1" fill="none" stroke="#8b4513" strokeWidth="6" strokeLinecap="round" />
        <path d="M36 142c-1-26 2-39 10-56" fill="none" stroke="#8b4513" strokeWidth="5" />
        <path d="M37 142c15-18 31-27 53-30" fill="none" stroke="#fbbf24" strokeWidth="2" className={aiming ? "animate-pulse" : ""} />
        <path d="M139 140 110 111" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
        <path d="M111 111 101 103l13 2Z" fill="#facc15" />
      </svg>
      <span className="absolute -right-1 bottom-1 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black text-white shadow">ARCHER</span>
    </div>
  );
}
