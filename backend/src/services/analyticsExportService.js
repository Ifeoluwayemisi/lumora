import { PrismaClient } from "@prisma/client";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

const prisma = new PrismaClient();

/**
 * Get revenue analytics for export
 */
async function getRevenueData(manufacturerId, startDate, endDate) {
  const payments = await prisma.billingHistory.findMany({
    where: {
      manufacturerId,
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
      status: "completed",
    },
    select: {
      reference: true,
      amount: true,
      planId: true,
      status: true,
      transactionDate: true,
    },
    orderBy: { transactionDate: "desc" },
  });

  // Transform data for export
  const data = payments.map((payment) => ({
    "Transaction Reference": payment.reference,
    "Plan ID": payment.planId,
    Amount: `₦${(payment.amount / 100).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
    })}`,
    Status: payment.status,
    Date: new Date(payment.transactionDate).toLocaleDateString(),
  }));

  // Calculate summary
  const summary = {
    "Total Transactions": payments.length,
    "Total Revenue": `₦${(
      payments.reduce((sum, p) => sum + p.amount, 0) / 100
    ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
    "Date Range": `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
  };

  return { data, summary };
}

/**
 * Get verification analytics for export
 */
async function getVerificationData(manufacturerId, startDate, endDate) {
  const verifications = await prisma.verificationLog.findMany({
    where: {
      manufacturerId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      codeValue: true,
      verificationState: true,
      location: true,
      timestamp: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by status
  const statusCounts = {
    GENUINE: 0,
    CODE_ALREADY_USED: 0,
    INVALID: 0,
    UNREGISTERED_PRODUCT: 0,
    SUSPICIOUS_PATTERN: 0,
  };

  verifications.forEach((v) => {
    statusCounts[v.verificationState]++;
  });

  // Transform data for export
  const data = verifications.map((v) => ({
    "Code Value": v.codeValue,
    Status: v.verificationState.replace(/_/g, " "),
    Location: v.location || "N/A",
    Date: new Date(v.timestamp).toLocaleString(),
  }));

  const summary = {
    "Total Verifications": verifications.length,
    Genuine: statusCounts.GENUINE,
    "Already Used": statusCounts.CODE_ALREADY_USED,
    Invalid: statusCounts.INVALID,
    "Unregistered Products": statusCounts.UNREGISTERED_PRODUCT,
    "Suspicious Pattern": statusCounts.SUSPICIOUS_PATTERN,
    "Date Range": `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
  };

  return { data, summary, statusCounts };
}

/**
 * Get product analytics for export
 */
async function getProductData(manufacturerId) {
  const products = await prisma.product.findMany({
    where: { manufacturerId },
    include: {
      batches: {
        include: {
          codes: {
            select: { isUsed: true },
          },
        },
      },
    },
  });

  const data = products.map((product) => {
    const totalCodes = product.batches.reduce(
      (sum, batch) => sum + batch.codes.length,
      0,
    );
    const usedCodes = product.batches.reduce(
      (sum, batch) => sum + batch.codes.filter((c) => c.isUsed).length,
      0,
    );

    return {
      "Product Name": product.name,
      Category: product.category,
      "Total Batches": product.batches.length,
      "Total Codes": totalCodes,
      "Used Codes": usedCodes,
      "Remaining Codes": totalCodes - usedCodes,
      "Usage Rate": `${((usedCodes / totalCodes) * 100).toFixed(2)}%`,
    };
  });

  const summary = {
    "Total Products": products.length,
    "Total Batches": products.reduce((sum, p) => sum + p.batches.length, 0),
    "Total Codes": data.reduce((sum, p) => sum + parseInt(p["Total Codes"]), 0),
  };

  return { data, summary };
}

/**
 * Get hotspot data for export
 */
async function getHotspotData(manufacturerId, startDate, endDate) {
  const verifications = await prisma.verificationLog.findMany({
    where: {
      manufacturerId,
      latitude: { not: null },
      longitude: { not: null },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      latitude: true,
      longitude: true,
      location: true,
      verificationState: true,
      createdAt: true,
    },
  });

  // Group by location
  const locationMap = {};
  verifications.forEach((v) => {
    const key = `${v.latitude.toFixed(4)},${v.longitude.toFixed(4)}`;
    if (!locationMap[key]) {
      locationMap[key] = {
        latitude: v.latitude,
        longitude: v.longitude,
        location: v.location,
        count: 0,
        genuine: 0,
        suspicious: 0,
      };
    }
    locationMap[key].count++;
    if (v.verificationState === "GENUINE") {
      locationMap[key].genuine++;
    } else if (v.verificationState === "SUSPICIOUS_PATTERN") {
      locationMap[key].suspicious++;
    }
  });

  const data = Object.values(locationMap)
    .sort((a, b) => b.count - a.count)
    .map((h) => ({
      Location: h.location || `${h.latitude}, ${h.longitude}`,
      Latitude: h.latitude.toFixed(6),
      Longitude: h.longitude.toFixed(6),
      Verifications: h.count,
      Genuine: h.genuine,
      Suspicious: h.suspicious,
      "Suspicion Rate": `${((h.suspicious / h.count) * 100).toFixed(2)}%`,
    }));

  const summary = {
    "Total Locations": Object.keys(locationMap).length,
    "Total Verifications": verifications.length,
    "Average Verifications per Location": (
      verifications.length / Object.keys(locationMap).length
    ).toFixed(2),
  };

  return { data, summary };
}

/**
 * Export data as CSV
 */
async function exportAsCSV(data, summary, fileName) {
  try {
    // Create CSV from data
    const json2csvParser = new Parser();
    let csv = json2csvParser.parse(data);

    // Add summary section
    if (summary && Object.keys(summary).length > 0) {
      csv += "\n\n--- SUMMARY ---\n";
      Object.entries(summary).forEach(([key, value]) => {
        csv += `${key},${value}\n`;
      });
    }

    return csv;
  } catch (error) {
    console.error("Error generating CSV:", error);
    throw error;
  }
}

/**
 * Create PDF document with data and charts
 */
async function createPDFWithCharts(title, data, summary, canvas) {
  return new Promise((resolve, reject) => {
    try {
      const pdf = new PDFDocument();
      const chunks = [];

      pdf.on("data", (chunk) => chunks.push(chunk));
      pdf.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      pdf.on("error", reject);

      // Title
      pdf.fontSize(24).font("Helvetica-Bold").text(title, { align: "center" });
      pdf.moveDown();

      // Summary section
      if (summary && Object.keys(summary).length > 0) {
        pdf
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("Summary", { underline: true });
        pdf.fontSize(10).font("Helvetica");
        Object.entries(summary).forEach(([key, value]) => {
          pdf.text(`${key}: ${value}`);
        });
        pdf.moveDown();
      }

      // Data table
      if (data && data.length > 0) {
        pdf
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("Data", { underline: true });
        pdf.fontSize(9).font("Helvetica");

        // Create simple table
        const columns = Object.keys(data[0]);
        const rowHeight = 20;
        const colWidth = (pdf.page.width - 40) / columns.length;

        // Header
        pdf.rect(20, pdf.y, pdf.page.width - 40, rowHeight).stroke();
        columns.forEach((col, i) => {
          pdf.text(col, 20 + i * colWidth + 5, pdf.y - rowHeight + 5, {
            width: colWidth - 10,
            fontSize: 8,
          });
        });
        pdf.moveDown(1);

        // Rows (limit to first 20 to keep PDF size reasonable)
        data.slice(0, 20).forEach((row) => {
          pdf.rect(20, pdf.y, pdf.page.width - 40, rowHeight).stroke();
          columns.forEach((col, i) => {
            pdf.text(
              String(row[col]).substring(0, 30),
              20 + i * colWidth + 5,
              pdf.y - rowHeight + 5,
              {
                width: colWidth - 10,
                fontSize: 8,
              },
            );
          });
          pdf.moveDown(1);
        });

        if (data.length > 20) {
          pdf.fontSize(9).text(`... and ${data.length - 20} more rows`);
        }
      }

      // Add chart image if provided
      if (canvas) {
        pdf.moveDown();
        pdf
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("Chart", { underline: true });
        // Note: Canvas would need to be converted to image buffer first
      }

      // Footer
      pdf
        .fontSize(8)
        .text(
          `Generated on ${new Date().toLocaleString()}`,
          20,
          pdf.page.height - 30,
          {
            align: "center",
          },
        );

      pdf.end();
    } catch (error) {
      reject(error);
    }
  });
}

export {
  getRevenueData,
  getVerificationData,
  getProductData,
  getHotspotData,
  exportAsCSV,
  createPDFWithCharts,
};
