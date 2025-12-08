import axios from "axios";
import { useState } from "react";
import Router from "next/router";
export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const submit = async (e:any) => {
    e.preventDefault();
    const res = await axios.post("/api/auth/login", form);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      Router.push("/admin/dashboard");
    } else alert("Login failed");
  };
  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /><br/>
        <input placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} /><br/>
        <button>Login</button>
      </form>
    </div>
  );
}
