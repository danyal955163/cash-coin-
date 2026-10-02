"use client";

export default function TigerCharacter({ aiming = false }: { aiming?: boolean }) {
  return (
    <div className={`relative h-36 w-36 shrink-0 transition-transform duration-300 ${aiming ? "-rotate-3 scale-105" : "animate-[pulse_3s_ease-in-out_infinite]"}`} aria-label="Tiger archer">
      <svg viewBox="0 0 180 180" className="h-full w-full drop-shadow-xl" role="img">
        <path d="M40 145c4-35 16-49 43-51 33-3 54 15 57 51H40Z" fill="#7c3f20" />
        <path d="M45 102c-9-25-5-61 16-76l19 12c14-8 31-8 45 0l18-12c21 16 25 51 15 76-11 28-82 29-113 0Z" fill="#f59e0b" stroke="#78350f" strokeWidth="5" />
        <path d="M61 41 72 66M119 41 108 66M49 74l18 4M131 74l-18 4M67 29l7 19M113 29l-7 19" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="74" cy="77" rx="11" ry="14" fill="white" /><ellipse cx="106" cy="77" rx="11" ry="14" fill="white" />
        <circle cx="76" cy="80" r="5" fill="#111827" /><circle cx="104" cy="80" r="5" fill="#111827" />
        <path d="M78 99c8 7 16 7 24 0" fill="none" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
        <path d="M86 91h8l-4 6Z" fill="#451a03" />
        <path d="M65 112c17 8 34 8 50 0" fill="none" stroke="#fef3c7" strokeWidth="18" strokeLinecap="round" />
        <path d="M118 119l24 24M132 116l-12 30" stroke="#fef3c7" strokeWidth="6" strokeLinecap="round" />
        <path d="M132 121c27 8 30 33 12 49" fill="none" stroke="#7c2d12" strokeWidth="5" />
        <path d="M137 122c-1 21-1 33 7 47" fill="none" stroke="#fbbf24" strokeWidth="2" />
        <path d="M48 123 29 104" stroke="#7c2d12" strokeWidth="12" strokeLinecap="round" />
        <path d="M31 107 13 91" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
        <path d="M27 106 13 111M28 104 20 89" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="absolute -right-1 bottom-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white shadow">ARCHER</span>
    </div>
  );
}
