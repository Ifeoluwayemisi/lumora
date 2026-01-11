"use client";
import Link from "next/link";

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t flex justify-around py-3 md:hidden">
      <Link href="/verify">Verify</Link>
      <Link href="/dashboard/user">History</Link>
      <Link href="/dashboard/user/profile">Profile</Link>
    </nav>
  );
}
