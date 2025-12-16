import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { VerificationResult } from "../../libs/type";

export default function ResultCard({
  result,
  reset,
}: {
  result: VerificationResult;
  reset: () => void;
}) {
  if (result.status === "GENUINE") {
    return (
      <div className="p-6 bg-green-500/10 rounded-2xl">
        <CheckCircle2 className="text-green-500" />
        <p>{result.name}</p>
      </div>
    );
  }

  if (result.status === "REUSED") {
    return (
      <div className="p-6 bg-amber-500/10 rounded-2xl">
        <ShieldAlert className="text-amber-500" />
        <p>Previously scanned: {result.lastScanned}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-red-500/10 rounded-2xl">
      <ShieldAlert className="text-red-500" />
      <p>Invalid product</p>
    </div>
  );
}
