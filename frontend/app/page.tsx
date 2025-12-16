// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }

// app/page.tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Zap, MapPin, Search, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="bg-[#050505] text-white min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 mb-6 border border-green-500/30 rounded-full bg-green-500/10 text-green-400 text-sm font-medium animate-pulse">
            Trusted by 50+ Manufacturers in Nigeria
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Verify Your World. <br />
            <span className="text-green-500">Protect Your Health.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Lumora uses AI to detect counterfeit drugs and goods instantly. Stop
            the fakes before they reach your home.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/verify"
              className="flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition"
            >
              Verify a Product <Search size={20} />
            </a>
            <a
              href="/howitworks"
              className="flex items-center justify-center gap-2 border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/5 transition"
            >
              How it works <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-green-500/50 transition">
          <Zap className="text-green-500 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">Instant AI Scan</h3>
          <p className="text-gray-400">
            Scan any QR code and get a verification result in under 2 seconds.
          </p>
        </div>
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-green-500/50 transition">
          <MapPin className="text-green-500 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">Hotspot Tracking</h3>
          <p className="text-gray-400">
            We map reported fakes to warn you about high-risk markets.
          </p>
        </div>
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-green-500/50 transition">
          <ShieldCheck className="text-green-500 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">Brand Protection</h3>
          <p className="text-gray-400">
            Manufacturers get real-time alerts when their products are cloned.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}