"use client";
import { useEffect, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

interface QrScannerProps {
  onScan: (code: string) => void;
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();

    let active = true;

    // decode once from video device (auto stops after first detection)
    codeReader
      .decodeOnceFromVideoDevice(undefined, videoRef.current!)
      .then((result) => {
        if (active && result) {
          active = false;
          onScan(result.getText());
        }
      })
      .catch((err) => {
        console.error("QR scan error:", err);
      });

    return () => {
      active = false;
      try {
        codeReader.reset(); // stops camera
      } catch {
        /* ignore if already reset */
      }
    };
  }, [onScan]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 w-full max-w-sm mx-auto">
      <video
        ref={videoRef}
        className="w-full aspect-square object-cover"
        autoPlay
        playsInline
        muted
      />
      <p className="text-center text-xs text-gray-500 mt-2">
        Point your camera at the QR code
      </p>
    </div>
  );
}
