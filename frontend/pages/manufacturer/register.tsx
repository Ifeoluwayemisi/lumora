import axios from "axios";
import { useState } from "react";
import Router from "next/router";
export default function Register() {
  const [form, setForm] = useState({ name: "", companyName: "", email: "", password: "", nafdaNumber: "" });
  const [file, setFile] = useState<File | null>(null);
  const submit = async (e:any) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    data.append("companyName", form.companyName);
    data.append("email", form.email);
    data.append("password", form.password);
    data.append("nafdaNumber", form.nafdaNumber);
    if (file) data.append("certificate", file);
    await axios.post("/api/manufacturer/register", data, { headers: { "Content-Type": "multipart/form-data" } });
    alert("Registered. Await admin verification.");
    Router.push("/");
  };
  return (
    <div style={{ padding: 24 }}>
      <h2>Manufacturer Registration</h2>
      <form onSubmit={submit}>
        <input required placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /><br/>
        <input required placeholder="Company name" value={form.companyName} onChange={(e)=>setForm({...form,companyName:e.target.value})} /><br/>
        <input required placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /><br/>
        <input required placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} /><br/>
        <input placeholder="NAFDAC number" value={form.nafdaNumber} onChange={(e)=>setForm({...form,nafdaNumber:e.target.value})} /><br/>
        <div>
          <label>Upload certificate</label><input type="file" accept="image/*,application/pdf" onChange={(e:any)=>setFile(e.target.files?.[0] ?? null)} />
        </div>
        <button>Register</button>
      </form>
    </div>
  );
}
