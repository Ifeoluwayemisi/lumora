import { Facebook, Linkedin, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    { icon: <Facebook size={20} />, href: "https://facebook.com" },
    { icon: <Linkedin size={20} />, href: "https://linkedin.com" },
    { icon: <Twitter size={20} />, href: "https://twitter.com" },
    { icon: <Instagram size={20} />, href: "https://instagram.com" },
  ];

  return (
    <footer className="bg-black py-20 border-t border-white/5 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 md:col-span-1 space-y-6">
            <h2 className="text-2xl font-black italic tracking-tighter text-green-500">
              LUMORA
            </h2>
            <p className="text-gray-500 text-xs font-bold leading-relaxed uppercase tracking-wider">
              Nigeria's Digital Infrastructure <br /> for Pharmaceutical Safety.
            </p>
          </div>

          {[
            { title: "Protocol", links: ["Verify", "Audit", "Api Docs"] },
            {
              title: "Company",
              links: ["About", "NAFDAC Partnership", "Impact"],
            },
            { title: "Legal", links: ["Privacy", "Terms", "Compliance"] },
          ].map((group) => (
            <div key={group.title} className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                {group.title}
              </h4>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs font-bold text-gray-600 hover:text-green-500 transition"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Media Section */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Follow Us
            </h4>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-500 transition"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
            © 2025 Lumora Technologies. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <div className="w-2 h-2 rounded-full bg-green-500/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </footer>
  );
}
