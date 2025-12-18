import { Mail, Phone, MapPin } from "lucide-react";
import {FaWhatsapp} from "react-icons/fa";
export default function Contact() {
  return (
    <div className="bg-[#050505] text-white min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-8">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.9]">
            Get In <br />
            <span className="text-green-500">Touch.</span>
          </h1>
          <p className="text-gray-400 font-medium">
            Whether you’re a manufacturer, regulator, or concerned consumer —
            Lumora is built to listen and respond.
          </p>
          
          <div className="space-y-6">
            {/* EMAIL */}
            <a
              href="mailto:hello@lumora.security"
              className="flex items-center gap-4 group"
            >
              <div className="p-4 bg-white/5 rounded-2xl text-green-500 group-hover:bg-green-500 group-hover:text-black transition">
                <Mail size={20} />
              </div>
              <p className="text-sm font-bold group-hover:text-green-500 transition">
                hello@lumora.security
              </p>
            </a>

            {/* PHONE */}
            <a
              href="tel:+234800586672"
              className="flex items-center gap-4 group"
            >
              <div className="p-4 bg-white/5 rounded-2xl text-green-500 group-hover:bg-green-500 group-hover:text-black transition">
                <Phone size={20} />
              </div>
              <p className="text-sm font-bold group-hover:text-green-500 transition">
                +234 800 LUMORA
              </p>
            </a>

            {/* WHATSAPP */}
            <a
              href="https://wa.me/+2349152026763"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group"
            >
              <div className="p-4 bg-white/5 rounded-2xl text-green-500 group-hover:bg-green-500 group-hover:text-black transition">
                <FaWhatsapp size={20} />
              </div>
              <p className="text-sm font-bold group-hover:text-green-500 transition">
                Chat on WhatsApp
              </p>
            </a>
          </div>
        </div>

        <form className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="NAME"
              className="bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-green-500 text-xs font-bold"
            />
            <input
              placeholder="EMAIL"
              className="bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-green-500 text-xs font-bold"
            />
          </div>
          <select className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-green-500 text-[10px] font-black uppercase text-gray-500">
            <option>MANUFACTURER INQUIRY</option>
            <option>REGULATORY PARTNERSHIP</option>
            <option>GENERAL SUPPORT</option>
          </select>
          <textarea
            rows={4}
            placeholder="MESSAGE"
            className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-green-500 text-xs font-bold"
          />
          <button className="w-full py-5 bg-green-500 text-black rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all">
            Submit Inquiry
          </button>
        </form>
      </div>
    </div>
  );
}
