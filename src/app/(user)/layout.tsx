import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
