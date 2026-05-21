import Navbar from "@/components/Navbar";

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pb-12">{children}</main>
    </div>
  );
}
