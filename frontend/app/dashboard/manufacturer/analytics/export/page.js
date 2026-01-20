"use client";

import { useState, useRef, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { toast } from "react-toastify";
import Link from "next/link";
import api from "@/services/api";

export default function ExportAnalyticsPage() {
  const [isPremium, setIsPremium] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(true);
  const [exportData, setExportData] = useState(null);
  const [selectedExports, setSelectedExports] = useState({
    revenue: true,
    verification: true,
    products: true,
    hotspots: true,
  });
  const [html2canvas, setHtml2canvas] = useState(null);
  const [jsPDF, setJsPDF] = useState(null);
  const chartRef = useRef(null);

  // Load PDF libraries and check premium on client side only
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        const html2canvasModule = await import("html2canvas");
        const jsPDFModule = await import("jspdf");
        setHtml2canvas(() => html2canvasModule.default);
        setJsPDF(() => jsPDFModule.jsPDF);

        // Check if premium
        const profileRes = await api.get("/manufacturer/profile");
        setIsPremium(profileRes.data?.manufacturer?.plan === "PREMIUM");
      } catch (error) {
        console.warn("Failed to load libraries or check plan:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLibraries();
  }, []);

  const toggleExport = (key) => {
    setSelectedExports((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fetchExportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/manufacturer/analytics/export?startDate=${startDate}&endDate=${endDate}`,
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setExportData(data);
    } catch (error) {
      console.error("Error fetching export data:", error);
      alert(error.message || "Failed to fetch export data");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (type, fileExtension = "csv") => {
    try {
      const params = `?startDate=${startDate}&endDate=${endDate}`;
      let url = "";

      switch (type) {
        case "revenue":
          url = `/api/manufacturer/analytics/export/revenue${params}`;
          break;
        case "verification":
          url = `/api/manufacturer/analytics/export/verification${params}`;
          break;
        case "products":
          url = `/api/manufacturer/analytics/export/products`;
          break;
        case "hotspots":
          url = `/api/manufacturer/analytics/export/hotspots${params}`;
          break;
        default:
          return;
      }

      console.log(`Downloading ${type} as ${fileExtension}...`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to download");
      }

      const blob = await response.blob();
      console.log(`Received blob of size ${blob.size}`);

      // Create download link with proper cleanup
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = urlBlob;
      link.download = `${type}-export-${new Date().getTime()}.${fileExtension}`;

      // Append to body, click, then remove
      document.body.appendChild(link);
      link.click();

      // Clean up - use setTimeout to ensure click is processed
      setTimeout(() => {
        try {
          document.body.removeChild(link);
        } catch (e) {
          console.warn("Could not remove download link:", e);
        }
        window.URL.revokeObjectURL(urlBlob);
      }, 100);

      console.log(`Successfully downloaded ${type}`);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      alert(`Failed to download ${type}: ${error.message}`);
    }
  };

  const downloadCSV = async (type) => {
    await downloadFile(type, "csv");
  };

  const generatePDF = async () => {
    if (!exportData || !jsPDF) {
      alert("PDF library not loaded. Please try again.");
      return;
    }

    try {
      setLoading(true);
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 10;

      // Title
      pdf.setFontSize(24);
      pdf.text("Analytics Export Report", 15, yPosition);
      yPosition += 15;

      // Date range
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(
        `Date Range: ${exportData.dateRange.start} to ${exportData.dateRange.end}`,
        15,
        yPosition,
      );
      yPosition += 10;

      // Reset color
      pdf.setTextColor(0);

      const addSection = (title, data) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 10;
        }

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, 15, yPosition);
        yPosition += 10;

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");

        if (data.summary) {
          pdf.text("Summary:", 15, yPosition);
          yPosition += 5;

          Object.entries(data.summary).forEach(([key, value]) => {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = 10;
            }
            pdf.text(`${key}: ${value}`, 20, yPosition);
            yPosition += 5;
          });
        }

        yPosition += 5;
      };

      if (selectedExports.revenue && exportData.revenue) {
        addSection("Revenue Analytics", exportData.revenue);
      }

      if (selectedExports.verification && exportData.verification) {
        addSection("Verification Analytics", exportData.verification);
      }

      if (selectedExports.products && exportData.products) {
        addSection("Product Analytics", exportData.products);
      }

      if (selectedExports.hotspots && exportData.hotspots) {
        addSection("Hotspot Analytics", exportData.hotspots);
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(
        `Generated on ${new Date().toLocaleString()}`,
        15,
        pageHeight - 5,
      );

      pdf.save(`analytics-export-${new Date().getTime()}.pdf`);
      alert("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 pt-12 md:pt-16">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Export Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Export your analytics data in CSV or PDF format
              </p>
            </div>
            {isPremium && (
              <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm font-semibold">
                ✓ Premium
              </div>
            )}
          </div>

          {/* Premium Feature Banner */}
          {!isPremium && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                  🚀 Unlock Advanced Analytics
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                  Export detailed analytics, revenue reports, and custom data - Premium feature
                </p>
              </div>
              <Link
                href="/dashboard/manufacturer/settings#billing"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                Upgrade Now
              </Link>
            </div>
          )}

          {/* Access Control */}
          {!isPremium ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Premium Feature
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Advanced analytics and data exports are available in our Premium plan.
              </p>
              <Link
                href="/dashboard/manufacturer/settings#billing"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-block"
              >
                Upgrade to Premium
              </Link>
            </div>
          ) : (
            <div className="max-w-4xl">
            {/* Date Range Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Select Date Range
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={fetchExportData}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Loading..." : "Load Export Data"}
              </button>
            </div>

            {/* Export Type Selection */}
            {exportData && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Select Data to Export
                </h2>

                <div className="space-y-3 mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedExports.revenue}
                      onChange={() => toggleExport("revenue")}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-gray-700">
                      💰 Revenue Analytics ({exportData.revenue.data.length}{" "}
                      transactions)
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedExports.verification}
                      onChange={() => toggleExport("verification")}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-gray-700">
                      ✓ Verification Analytics (
                      {exportData.verification.data.length} verifications)
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedExports.products}
                      onChange={() => toggleExport("products")}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-gray-700">
                      📦 Product Analytics ({exportData.products.data.length}{" "}
                      products)
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedExports.hotspots}
                      onChange={() => toggleExport("hotspots")}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-gray-700">
                      📍 Hotspot Analytics ({exportData.hotspots.data.length}{" "}
                      locations)
                    </span>
                  </label>
                </div>

                {/* Export Buttons */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Download as CSV
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {selectedExports.revenue && (
                      <button
                        onClick={() => downloadCSV("revenue")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm"
                      >
                        💰 Revenue CSV
                      </button>
                    )}
                    {selectedExports.verification && (
                      <button
                        onClick={() => downloadCSV("verification")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm"
                      >
                        ✓ Verification CSV
                      </button>
                    )}
                    {selectedExports.products && (
                      <button
                        onClick={() => downloadCSV("products")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm"
                      >
                        📦 Products CSV
                      </button>
                    )}
                    {selectedExports.hotspots && (
                      <button
                        onClick={() => downloadCSV("hotspots")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm"
                      >
                        📍 Hotspots CSV
                      </button>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Download as PDF
                    </h3>
                    <button
                      onClick={generatePDF}
                      disabled={loading}
                      className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      📄 Generate PDF Report
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      Creates a comprehensive PDF report with all selected
                      analytics
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Statistics */}
            {exportData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {selectedExports.revenue && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">
                      💰 Revenue Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(exportData.revenue.summary).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-semibold text-gray-900">
                              {value}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {selectedExports.verification && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">
                      ✓ Verification Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(exportData.verification.summary).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-semibold text-gray-900">
                              {value}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {selectedExports.products && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">
                      📦 Product Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(exportData.products.summary).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-semibold text-gray-900">
                              {value}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {selectedExports.hotspots && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">
                      📍 Hotspot Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(exportData.hotspots.summary).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-semibold text-gray-900">
                              {value}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-2">
                📋 Export Information
              </h3>
              <p className="text-blue-800 text-sm">
                You can export your analytics data in two formats:
              </p>
              <ul className="text-blue-800 text-sm mt-2 space-y-1 ml-4">
                <li>
                  <strong>CSV:</strong> Spreadsheet-compatible format, perfect
                  for further analysis in Excel or Google Sheets
                </li>
                <li>
                  <strong>PDF:</strong> Professional report format with
                  summaries, ready to share with stakeholders
                </li>
              </ul>
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
