import { Shield, Zap, Database, Smartphone, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Database />,
      title: "Cryptographic Generation",
      desc: "Manufacturers generate unique, non-sequential cryptographic hashes for every single product unit at the point of production.",
    },
    {
      icon: <Zap />,
      title: "Secure Labeling",
      desc: "These hashes are embedded as tamper-proof QR codes or 6-digit alphanumeric IDs printed directly on product packaging.",
    },
    {
      icon: <Smartphone />,
      title: "Consumer Scan",
      desc: "Consumers scan the code using Lumora, instantly querying our distributed verification system for authenticity.",
    },
    {
      icon: <Shield />,
      title: "Instant Audit",
      desc: "Lumora validates the product’s digital birth certificate and flags reuse, cloning, or suspicious scan patterns in real time.",
    },
  ];

  return (
    <div className="bg-[#050505] text-white min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-20">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
            How Lumora Works
          </h1>

          <p className="text-green-500 text-sm font-bold uppercase tracking-widest">
            One scan can save a life.
          </p>

          <p className="text-gray-500 max-w-xl mx-auto font-bold uppercase tracking-widest text-xs">
            Securing the Nigerian pharmaceutical supply chain from factory to
            consumer
          </p>
        </div>

        {/* STEPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="p-10 bg-white/5 border border-white/5 rounded-[3rem] space-y-6 hover:border-green-500/30 transition"
            >
              <div className="w-14 h-14 bg-green-500 text-black rounded-2xl flex items-center justify-center">
                {step.icon}
              </div>

              <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                {step.title}
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* FINAL CALLOUT */}
        <div className="bg-green-500/10 border border-green-500/20 p-12 rounded-[4rem] text-center">
          <h2 className="text-3xl font-black italic uppercase mb-4">
            Fake Drugs Don’t Survive Lumora
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm mb-8 font-medium">
            Unlike traditional scratch-codes, Lumora uses a zero-trust,
            multi-factor verification model — combining code uniqueness, scan
            frequency, and geolocation signals to expose counterfeits even when
            a code is perfectly cloned.
          </p>

          <CheckCircle className="mx-auto text-green-500" size={48} />
        </div>
      </div>
    </div>
  );
}
