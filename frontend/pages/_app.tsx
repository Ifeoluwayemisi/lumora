import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import RegisterSW from "../utils/registerServiceWorker";
export default function App({ Component, pageProps }: AppProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  useEffect(() => {
    RegisterSW({ onUpdate: () => setUpdateAvailable(true) });
  }, []);
  return (
    <>
      {updateAvailable && (
        <div style={{ position: "fixed", bottom: 20, right: 20, background: "#4f46e5", color: "white", padding: 12, borderRadius: 8 }}>
          New version available. Refresh to update.
        </div>
      )}
      <Component {...pageProps} />
    </>
  );
}
