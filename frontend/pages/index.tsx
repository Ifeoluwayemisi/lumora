import Link from "next/link";
export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Lumora</h1>
        <nav>
          <Link href="/verify">Verify</Link> | <Link href="/manufacturer/register">Manufacturer</Link> | <Link href="/admin/login">Admin</Link>
        </nav>
      </header>
      <main style={{ marginTop: 40 }}>
        <h2>Universal Product Verification</h2>
        <p>Scan QR codes or enter product codes to verify authenticity.</p>
        <p><Link href="/verify">Start verification</Link></p>
      </main>
    </div>
  );
}
