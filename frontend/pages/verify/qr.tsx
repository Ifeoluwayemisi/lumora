import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
export default function QRScannerPage() {
  const [scanned, setScanned] = useState<string | null>(null);
  useEffect(() => {
    // placeholder: instruct user to paste decoded payload
  }, []);
  const send = async () => {
    if (!scanned) return;
    try {
      const parsed = JSON.parse(scanned);
      const code = parsed.code ?? scanned;
      const res = await axios.post("/api/verify", { code });
      alert(JSON.stringify(res.data));
    } catch (e) {
      alert("Invalid QR payload");
    }
  };
  return (
    <div style={{ padding: 24 }}>
      <h2>QR Scanner (placeholder)</h2>
      <p>For demo: paste scanned QR JSON payload below.</p>
      <textarea value={scanned ?? ""} onChange={(e)=>setScanned(e.target.value)} style={{ width: "100%", height: 120 }} />
      <div style={{ marginTop: 8 }}><button onClick={send}>Send to verify</button></div>
    </div>
  );
}
