"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import api from "@/services/api";
import AuthGuard from "@/components/AuthGuard";

function QRVerifyPageContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanActive, setScanActive] = useState(true);
  const [torchActive, setTorchActive] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const router = useRouter();
  const qrScannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);
  const audioContextRef = useRef(null);
  const fileInputRef = useRef(null);

  const playBeep = () => {
    try {
      const audioContext =
        audioContextRef.current ||
        new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);

      setHasAudioPermission(true);
    } catch (err) {
      console.error("Beep failed:", err);
    }
  };

  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const toggleTorch = async () => {
    if (!scannerInstanceRef.current) return;
    try {
      if (!torchActive) {
        await scannerInstanceRef.current.applyConstraints({
          advanced: [{ torch: true }],
        });
        setTorchActive(true);
      } else {
        await scannerInstanceRef.current.applyConstraints({
          advanced: [{ torch: false }],
        });
        setTorchActive(false);
      }
    } catch (err) {
      console.error("Torch not supported on this device:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const img = new Image();
          img.onload = async () => {
            try {
              // Create canvas and draw image
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);

              // Get image data
              const imageData = ctx.getImageData(0, 0, img.width, img.height);
              const code = jsQR(imageData.data, img.width, img.height);

              if (!code) {
                setError("No QR code found in image. Try another image.");
                setLoading(false);
                return;
              }

              console.log(`QR Code from image: ${code.data}`);
              playBeep();
              vibrate();

              const result = await api.post("/verify/qr", {
                qrData: code.data.trim(),
              });

              router.push(
                `/verify/result?code=${encodeURIComponent(code.data.trim())}`
              );
            } catch (err) {
              console.error("QR decode error:", err);
              const errorMsg =
                err.response?.data?.message ||
                err.message ||
                "Failed to decode QR code";
              setError(`Verification error: ${errorMsg}`);
              setLoading(false);
            }
          };
          img.onerror = () => {
            setError(
              "Failed to load image. Make sure it's a valid image file."
            );
            setLoading(false);
          };
          img.src = event.target.result;
        } catch (err) {
          setError(`File reading error: ${err.message}`);
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(`File upload error: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!scanActive) return;

    const timer = setTimeout(async () => {
      const element = document.getElementById("qr_reader");
      if (!element) {
        console.error("QR reader element not found");
        setError("Camera element not found. Please refresh the page.");
        return;
      }

      try {
        const qrCode = new Html5Qrcode("qr_reader");
        scannerInstanceRef.current = qrCode;

        const onScanSuccess = async (decodedText) => {
          console.log(`QR Code detected: ${decodedText}`);

          // User interaction triggers
          playBeep();
          vibrate();

          setScanActive(false);
          setLoading(true);
          setError("");

          try {
            // Stop scanning
            await qrCode.stop();

            const result = await api.post("/verify/qr", {
              qrData: decodedText.trim(),
            });

            // Auto-pause before redirect
            setTimeout(() => {
              router.push(
                `/verify/result?code=${encodeURIComponent(decodedText.trim())}`
              );
            }, 500);
          } catch (err) {
            console.error("Verification error:", err);
            setError(err.message || "Verification failed");
            setLoading(false);
            setScanActive(true);
            try {
              await qrCode.start(
                { facingMode: "user" },
                {
                  fps: 10,
                  qrbox: { width: 250, height: 250 },
                },
                onScanSuccess,
                onScanFailure
              );
            } catch (restartErr) {
              console.error("Failed to restart scanner:", restartErr);
            }
          }
        };

        const onScanFailure = (error) => {
          console.debug("Scan attempt:", error);
        };

        await qrCode.start(
          { facingMode: "user" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          onScanSuccess,
          onScanFailure
        );

        console.log("QR Code scanner started successfully");
      } catch (err) {
        console.error("Failed to start QR scanner:", err);
        setError(
          `Unable to access camera: ${
            err.message || "Permission denied or camera not available"
          }`
        );
        setLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.stop().catch(() => {});
      }
    };
  }, [scanActive, router]);

  const handleRetry = () => {
    setError("");
    setScanActive(true);
  };

  return (
    <div className="flex flex-col items-center p-4 pt-6 md:pt-12">
      <h1 className="text-2xl font-bold dark:text-white mb-4">Scan QR Code</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Point your camera at the Lumora QR code to verify instantly.
      </p>

      {error && (
        <div className="w-full max-w-md mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
        {scanActive ? (
          <>
            <div
              id="qr_reader"
              ref={qrScannerRef}
              className="w-full h-80 rounded-md overflow-hidden relative"
              style={{ minHeight: "320px" }}
            >
              {/* Animated scanning line */}
              <style>{`
                @keyframes scanline {
                  0% { top: 0%; }
                  50% { top: 100%; }
                  100% { top: 0%; }
                }
                .scanline {
                  animation: scanline 2s infinite;
                  position: absolute;
                  left: 0;
                  right: 0;
                  height: 3px;
                  background: linear-gradient(
                    90deg,
                    transparent,
                    #3b82f6,
                    transparent
                  );
                  z-index: 10;
                }
              `}</style>
              <div className="scanline"></div>
            </div>

            {/* Control buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={toggleTorch}
                className={`flex-1 py-2 px-4 rounded font-medium text-sm transition ${
                  torchActive
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {torchActive ? "🔦 Torch On" : "🔦 Torch Off"}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition"
              >
                📷 Upload Image
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </>
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md">
            {loading ? (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Verifying...
                </p>
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">Redirecting...</p>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        Make sure you have camera permissions enabled and good lighting.
      </p>
    </div>
  );
}

export default function QRVerifyPage() {
  return (
    <AuthGuard>
      <QRVerifyPageContent />
    </AuthGuard>
  );
}
