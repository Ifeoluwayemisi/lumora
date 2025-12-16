import clamscan from "clamscan";

let scanner: any = null;

export async function getClamScanner() {
  if (scanner) return scanner;
  const Clam = new clamscan().init({
    remove_infected: false,
    scan_recursively: false,
    clamdscan: {
      socket: false,
      host: process.env.CLAMAV_HOST || "127.0.0.1",
      port: parseInt(process.env.CLAMAV_PORT || "3310", 10),
      timeout: 60000,
      local_fallback: true,
    },
  });
  scanner = await Clam;
  return scanner;
}

export async function scanFile(fullPath: string) {
  const sc = await getClamScanner();
  const { is_infected, viruses } = await sc.scan_file(fullPath);
  return { infected: !!is_infected, viruses };
}
