import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Page not found</h2>
      <p className="text-gray-500 text-sm mb-6">
        This event may have been taken down or does not exist.
      </p>
      <Link href="/">
        <Button>Go to feed</Button>
      </Link>
    </div>
  );
}
