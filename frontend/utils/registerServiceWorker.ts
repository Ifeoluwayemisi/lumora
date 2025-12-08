import { Workbox } from "workbox-window";
type Options = { onUpdate?: (registration: ServiceWorkerRegistration) => void; };
export default function RegisterSW(opts: Options = {}) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (process.env.NODE_ENV !== "production") return;
  const wb = new Workbox("/sw.js");
  wb.addEventListener("waiting", (event) => { opts.onUpdate && opts.onUpdate(event as any); });
  wb.register().catch((err) => console.warn("SW registration failed", err));
}
