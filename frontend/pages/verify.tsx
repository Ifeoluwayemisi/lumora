import { useState } from "react";
import axios from "axios";
export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const submit = async (allow = false) => {
    try {
      const res = await axios.post("/api/verify", { code, lat: undefined, lng: undefined, locationConsent: allow });
      setResult(res.data);
    } catch (err:any) {
      setResult({ error: err?.response?.data || err.message });
    }
  };
  return (
    <div style={{ padding: 24 }}>
      <h2>Verify product code</h2>
      <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter code" />
      <div style={{ marginTop: 8 }}>
        <button onClick={()=>setConsentOpen(true)}>Verify</button>
      </div>
      {consentOpen && (
        <div style={{ marginTop: 8 }}>
          <p>Allow to send approximate location if this code is used?</p>
          <button onClick={()=>{ setConsentOpen(false); submit(true); }}>Allow</button>
          <button onClick={()=>{ setConsentOpen(false); submit(false); }}>Deny</button>
        </div>
      )}
      {result && <pre style={{ background: "#f4f4f4", padding: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
