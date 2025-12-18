"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const homeRoutes = [
    "/",
    "/how-it-works",
    "/contact",
    "/impact",
    "/manufacturers",
  ];

  if (homeRoutes.includes(pathname)) return <Navbar />;
  return null;
}
