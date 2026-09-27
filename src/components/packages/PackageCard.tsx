import Link from "next/link";

export type PackageCardData = {
  id: string;
  name: string;
  price: number;
  daily_tasks: number;
  per_task_coins: number;
  duration: string;
  description: string | null;
};

export default function PackageCard({ package: packageData }: { package: PackageCardData }) {
  const isFree = packageData.price === 0;
  const href = isFree
    ? "/dashboard"
    : `/deposit?package=${encodeURIComponent(`${packageData.price} PKR Package`)}`;

  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">{packageData.name}</h2>
        {isFree && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Starter</span>}
      </div>
      <p className="mt-5 text-3xl font-bold text-emerald-600">{packageData.price === 0 ? "Free" : `${packageData.price} PKR`}</p>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-gray-500">Daily Tasks</dt><dd className="font-semibold text-gray-900">{packageData.daily_tasks}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-gray-500">Per Task Coins</dt><dd className="font-semibold text-gray-900">{packageData.per_task_coins}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-gray-500">Duration</dt><dd className="font-semibold text-gray-900">{packageData.duration}</dd></div>
      </dl>
      <p className="mt-6 flex-1 text-sm leading-6 text-gray-600">{packageData.description ?? "Earn coins by completing daily tasks."}</p>
      <Link href={href} className="mt-6 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
        {isFree ? "Start Free" : "Activate"}
      </Link>
    </article>
  );
}
