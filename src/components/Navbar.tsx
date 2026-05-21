"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Calendar, Bookmark, LayoutDashboard, Shield } from "lucide-react";
import Button from "./ui/Button";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = session?.user?.role;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 text-lg">
          <Calendar className="h-5 w-5" />
          <span>SL Events</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100">
            Feed
          </Link>
          {session && role === "attendee" && (
            <Link href="/saved" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1">
              <Bookmark className="h-4 w-4" /> Saved
            </Link>
          )}
          {session && role === "club" && (
            <Link href="/club/dashboard" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          )}
          {session && role === "admin" && (
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
          {session ? (
            <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
              Sign out
            </Button>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="secondary" size="sm">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 flex flex-col gap-1">
          <Link href="/" className="text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
            Feed
          </Link>
          {session && role === "attendee" && (
            <Link href="/saved" className="text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
              Saved Events
            </Link>
          )}
          {session && role === "club" && (
            <Link href="/club/dashboard" className="text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          )}
          {session && role === "admin" && (
            <Link href="/admin" className="text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
              Admin Panel
            </Link>
          )}
          <div className="pt-2 border-t border-gray-100 flex gap-2">
            {session ? (
              <Button variant="secondary" size="sm" className="w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
                Sign out
              </Button>
            ) : (
              <>
                <Link href="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">Sign in</Button>
                </Link>
                <Link href="/signup" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
