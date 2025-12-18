"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Define routes where you want the footer to appear
  const homeRoutes = [
    "/",
    "/how-it-works",
    "/contact",
    "/impact",
    "/manufacturers",
  ];

  if (homeRoutes.includes(pathname)) return <Footer />;
  return null;
}
