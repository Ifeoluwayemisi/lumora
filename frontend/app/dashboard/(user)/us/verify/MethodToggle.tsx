import { Keyboard, QrCode } from "lucide-react";

export default function MethodToggle({ method, setMethod }: any) {
  return (
    <div className="flex bg-white/5 p-1 rounded-xl mb-8">
      <button
        onClick={() => setMethod("manual")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg ${
          method === "manual" ? "bg-green-600" : "hover:bg-white/5"
        }`}
      >
        <Keyboard size={20} /> Manual Code
      </button>
      <button
        onClick={() => setMethod("qr")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg ${
          method === "qr" ? "bg-green-600" : "hover:bg-white/5"
        }`}
      >
        <QrCode size={20} /> QR Scan
      </button>
    </div>
  );
}
