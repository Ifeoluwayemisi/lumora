import { BarChart3, ShieldAlert, Users, Globe } from "lucide-react";

export default function Manufacturers() {
  return (
    <div className="bg-[#050505] text-white min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.9]">
              Armour For <br />
              <span className="text-green-500">Your Brand.</span>
            </h1>
            <p className="text-gray-400 font-medium leading-relaxed">
              Counterfeit drugs cost the industry billions and claim lives.
              Lumora provides the digital infrastructure to protect your revenue
              and your patients.
            </p>
            <button className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-500 transition-all">
              Request Partnership
            </button>
          </div>
          <div className="bg-white/5 rounded-[3rem] border border-white/10 p-2 overflow-hidden">
            <div className="bg-black rounded-[2.5rem] p-8 aspect-video flex items-center justify-center border border-white/5">
              <BarChart3 size={80} className="text-green-500 opacity-20" />
              <p className="absolute text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                Live Analytics Preview
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            {
              icon: <ShieldAlert />,
              title: "Fraud Interception",
              desc: "Get real-time alerts when your products are scanned in suspicious clusters.",
            },
            {
              icon: <Users />,
              title: "Consumer Insight",
              desc: "Understand exactly where and when your products are being consumed.",
            },
            {
              icon: <Globe />,
              title: "Supply Chain Visibility",
              desc: "Track the movement of batches from the factory to the final patient.",
            },
          ].map((item, i) => (
            <div key={i} className="space-y-4 flex flex-col items-center">
              <div className="text-green-500">{item.icon}</div>
              <h4 className="text-xl font-black uppercase italic tracking-tighter">
                {item.title}
              </h4>
              <p className="text-gray-500 text-xs font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
