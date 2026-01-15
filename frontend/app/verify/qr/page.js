"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import { toast } from "react-toastify";
import api from "@/services/api";
import AuthGuard from "@/components/AuthGuard";
import { getLocationPermission } from "@/utils/geolocation";

function QRVerifyPageContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanActive, setScanActive] = useState(true);
  const [torchActive, setTorchActive] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const router = useRouter();
  const qrScannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);
  const fileInputRef = useRef(null);

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
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
    } catch (err) {
      console.error("Beep failed:", err);
    }
  };

  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      // Stop the scanner if it's running
      if (scannerInstanceRef.current && scanActive) {
        try {
          await scannerInstanceRef.current.stop();
        } catch (stopErr) {
          console.debug("Scanner stop error (safe to ignore):", stopErr);
        }
        setScanActive(false);
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const img = new Image();
          img.onload = async () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);

              const imageData = ctx.getImageData(0, 0, img.width, img.height);
              const code = jsQR(imageData.data, img.width, img.height);

              if (!code) {
                const msg = "No QR code found in image. Try another image.";
                setError(msg);
                toast.error(msg);
                setLoading(false);
                return;
              }

              playBeep();
              vibrate();

              try {
                // Get location with permission
                toast.info("📍 Requesting location permission...");
                const location = await getLocationPermission();

                const response = await api.post("/verify/qr", {
                  qrData: code.data.trim(),
                  latitude: location.latitude,
                  longitude: location.longitude,
                });

                // Store the verification result in localStorage
                if (response.data) {
                  localStorage.setItem(
                    "verificationResult",
                    JSON.stringify(response.data)
                  );
                }

                toast.success("QR code verified! Redirecting...");
                const status = response.data?.verification?.state || "UNKNOWN";
                // Add small delay to ensure localStorage persists before navigation
                setTimeout(() => {
                  router.push(
                    `/verify/states/${encodeURIComponent(
                      status
                    )}?code=${encodeURIComponent(code.data.trim())}`
                  );
                }, 100);
              } catch (apiErr) {
                const errorMsg =
                  apiErr.response?.data?.error ||
                  apiErr.response?.data?.message ||
                  apiErr.message ||
                  "Failed to verify QR code";
                setError(errorMsg);
                toast.error(errorMsg);
                setLoading(false);
              }
            } catch (err) {
              const errorMsg = "Failed to process image";
              setError(errorMsg);
              toast.error(errorMsg);
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
      console.error("Torch not supported:", err);
    }
  };

  useEffect(() => {
    if (!scanActive || uploadMode) return;

    const timer = setTimeout(async () => {
      const element = document.getElementById("qr_reader");
      if (!element) return;

      try {
        const qrCode = new Html5Qrcode("qr_reader");
        scannerInstanceRef.current = qrCode;

        const onScanSuccess = async (decodedText) => {
          playBeep();
          vibrate();
          setScanActive(false);
          setLoading(true);
          setError("");

          try {
            // Get location with permission
            toast.info("📍 Requesting location permission...");
            const location = await getLocationPermission();

            await qrCode.stop();
            const response = await api.post("/verify/qr", {
              qrData: decodedText.trim(),
              latitude: location.latitude,
              longitude: location.longitude,
            });

            // Store the verification result in localStorage
            if (response.data) {
              localStorage.setItem(
                "verificationResult",
                JSON.stringify(response.data)
              );
            }

            setTimeout(() => {
              const status = response.data?.verification?.state || "UNKNOWN";
              // Add small delay to ensure localStorage persists before navigation
              setTimeout(() => {
                router.push(
                  `/verify/states/${encodeURIComponent(
                    status
                  )}?code=${encodeURIComponent(decodedText.trim())}`
                );
              }, 100);
            }, 500);
          } catch (err) {
            console.error("Verification error:", err);
            setError(
              err.response?.data?.message ||
                err.message ||
                "Verification failed"
            );
            setLoading(false);
            setScanActive(true);
          }
        };

        const onScanFailure = (error) => {
          console.debug("Scan attempt:", error);
        };

        await qrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          onScanFailure
        );
      } catch (err) {
        console.error("Failed to start QR scanner:", err);
        setError(
          `Unable to access camera: ${err.message || "Permission denied"}`
        );
        setLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerInstanceRef.current) {
        try {
          scannerInstanceRef.current.stop().catch(() => {});
        } catch (err) {
          // Scanner cleanup error - safe to ignore
          console.debug("Scanner cleanup error (safe to ignore):", err);
        }
      }
    };
  }, [scanActive, uploadMode, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-8">
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
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          z-index: 10;
        }
      `}</style>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <span className="text-4xl">📱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Scan QR Code
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Point your camera at the product QR code
          </p>
        </div>

        {/* Camera/Upload Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Camera/Upload Area */}
          <div className="p-6">
            {uploadMode ? (
              /* Upload Mode */
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  <span className="text-4xl mb-3 block">🖼️</span>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    Choose Image
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select a QR code photo from your device
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  onClick={() => setUploadMode(false)}
                  className="w-full py-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  ← Back to Camera
                </button>
              </div>
            ) : (
              /* Camera Mode */
              <div className="space-y-4">
                {scanActive && !loading ? (
                  <>
                    <div
                      id="qr_reader"
                      ref={qrScannerRef}
                      className="w-full rounded-lg overflow-hidden relative bg-black"
                      style={{ minHeight: "320px" }}
                    >
                      <div className="scanline"></div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={toggleTorch}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 ${
                          torchActive
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        }`}
                      >
                        <span>{torchActive ? "🔦" : "💡"}</span>
                        {torchActive ? "Torch On" : "Light"}
                      </button>
                      <button
                        onClick={() => setUploadMode(true)}
                        className="flex-1 py-3 px-4 rounded-lg font-medium text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition flex items-center justify-center gap-2"
                      >
                        <span>📷</span>
                        Upload
                      </button>
                    </div>

                    {/* Hint */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      ✓ Position QR code in the center of the frame
                    </p>
                  </>
                ) : (
                  /* Loading State */
                  <div className="py-16 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Verifying code...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex gap-3">
          <Link
            href="/verify"
            className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition text-center flex items-center justify-center gap-2"
          >
            <span>⌨️</span>
            Manual Entry
          </Link>
          <Link
            href="/dashboard/user"
            className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition text-center flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            Home
          </Link>
        </div>
      </div>
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
