export default function Impact() {
  return (
    <div className="bg-[#050505] text-white min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
            Small Code. <br />
            <span className="text-red-500">Big Impact.</span>
          </h1>
          <p className="text-gray-400 font-medium italic">
            "Our mission is to ensure no Nigerian dies from a fake pill."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-12 bg-white/5 rounded-[3rem] border border-white/5 flex flex-col justify-between h-[300px]">
            <h2 className="text-6xl font-black italic text-green-500">80k+</h2>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Potential Lives Saved by intercepting toxic batches.
            </p>
          </div>
          <div className="p-12 bg-white/5 rounded-[3rem] border border-white/5 flex flex-col justify-between h-[300px]">
            <h2 className="text-6xl font-black italic text-blue-500">100%</h2>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Traceability achieved for partnered local manufacturers.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-center">
            Community Stories
          </h3>
          <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 italic text-gray-400 text-sm leading-relaxed relative">
            <span className="text-6xl absolute top-4 left-4 opacity-10">"</span>
            "I scanned my mother's blood pressure medication and it came back as
            INVALID. We took it back to the pharmacy and found out it was part
            of a major counterfeit ring. Lumora saved her life."
            <p className="mt-4 font-black uppercase tracking-widest text-[10px] text-green-500 not-italic">
              — Chidi O., Lagos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
