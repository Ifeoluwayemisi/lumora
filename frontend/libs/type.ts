export type VerificationResult =
  | {
      status: "GENUINE";
      name: string;
      manufacturer: string;
      expiry: string;
    }
  | {
      status: "REUSED";
      lastScanned: string;
    }
  | {
      status: "INVALID";
    };
