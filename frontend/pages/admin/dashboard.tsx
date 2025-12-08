import { useEffect, useState } from "react";
import axios from "axios";
export default function AdminDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/manufacturers/pending", { headers: { Authorization: `Bearer ${token}` } });
      setPending(res.data.mans || []);
    };
    load();
  }, []);
  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard</h2>
      <div>
        {pending.length === 0 && <div>No pending manufacturers</div>}
        {pending.map(m=>(
          <div key={m.id} style={{ border: "1px solid #eee", padding: 8, marginBottom: 8 }}>
            <div>{m.companyName} ({m.email})</div>
          </div>
        ))}
      </div>
    </div>
  );
}
