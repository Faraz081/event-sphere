import {jsPDF} from "jspdf"
import autoTable from "jspdf-autotable"
import { imageToPngDataUrl } from "@/lib/imageToPngDataUrl";

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const drawBarRow = (doc, label, value, max, x, y, maxWidth) => {
  const safeMax = max > 0 ? max : 1;
  const barW = Math.max(2, (value / safeMax) * maxWidth);
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(`${label}: ${value}`, x, y);
  doc.setFillColor(196, 148, 36);
  doc.rect(x, y + 2, barW, 5, "F");
  return y + 12;
};

export const generateExpoReport = async (payload, branding = {}) => {
  const report = payload?.report || payload;
  const expo = report.expo || {};
  const websiteName = branding.websiteName?.trim() || "";
  const attendees = report.attendees || {};
  const booths = report.booths || {};
  const sessions = Array.isArray(report.sessions) ? report.sessions : [];
  const summary = report.summary || {};

  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  let y = 18;

  doc.setFillColor(47, 42, 36);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(227, 185, 74);
  doc.setFontSize(16);
  let headingX = 14;
  if (branding.logo?.trim()) {
    try {
      const logoData = await imageToPngDataUrl(branding.logo.trim());
      doc.addImage(logoData, "PNG", 14, 7, 12, 14, undefined, "FAST");
      headingX = 30;
    } catch (error) {
      console.warn("Could not add website logo to expo report:", error);
    }
  }
  if (websiteName) {
    const headingLines = doc.splitTextToSize(
      `${websiteName} — Expo Report`,
      pageW - headingX - 14
    );
    doc.text(headingLines[0], headingX, 12);
  } else if (headingX > 14) {
    headingX = 14;
  }
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(expo.title || "Untitled Expo", 14, 20);

  y = 38;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.text(`Date: ${formatDate(expo.date)}`, 14, y);
  doc.text(`Location: ${expo.location || "—"}`, 14, y + 6);
  doc.text(`Status: ${expo.status || "—"}`, 14, y + 12);
  doc.text(`Generated: ${formatDateTime(new Date())}`, 14, y + 18);

  y += 30;
  doc.setFontSize(13);
  doc.setTextColor(196, 148, 36);
  doc.text("1. Summary", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Attendees", String(summary.attendeeTotal ?? attendees.total ?? 0)],
      ["Engagement Rate", `${summary.engagementRate ?? attendees.engagementRate ?? 0}%`],
      ["Total Booths", String(summary.boothTotal ?? booths.total ?? 0)],
      ["Booth Occupancy", `${summary.occupancyRate ?? booths.occupancyRate ?? 0}%`],
      ["Sessions", String(summary.sessionCount ?? sessions.length)],
    ],
    theme: "striped",
    headStyles: { fillColor: [47, 42, 36], textColor: [227, 185, 74] },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(13);
  doc.setTextColor(196, 148, 36);
  doc.text("2. Attendee Engagement", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Registration Status", "Count"], ["Booking Status", "Count"]],
    body: [
      ["Registered", String(attendees.registered ?? 0), "Confirmed", String(attendees.bookingConfirmed ?? 0)],
      ["Confirmed", String(attendees.confirmed ?? 0), "Pending", String(attendees.bookingPending ?? 0)],
      ["Attended", String(attendees.attended ?? 0), "Cancelled", String(attendees.bookingCancelled ?? 0)],
      ["Cancelled", String(attendees.cancelled ?? 0), "", ""],
    ].map((row) => [row[0], row[1], row[2], row[3]]),
    theme: "striped",
    headStyles: { fillColor: [47, 42, 36], textColor: [227, 185, 74] },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;
  const attMax = Math.max(
    attendees.registered || 0,
    attendees.confirmed || 0,
    attendees.attended || 0,
    attendees.cancelled || 0,
    1
  );
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Registration breakdown", 14, y);
  y += 6;
  y = drawBarRow(doc, "Registered", attendees.registered || 0, attMax, 14, y, 120);
  y = drawBarRow(doc, "Confirmed", attendees.confirmed || 0, attMax, 14, y, 120);
  y = drawBarRow(doc, "Attended", attendees.attended || 0, attMax, 14, y, 120);
  y = drawBarRow(doc, "Cancelled", attendees.cancelled || 0, attMax, 14, y, 120);

  if (y > 250) {
    doc.addPage();
    y = 20;
  } else {
    y += 6;
  }

  doc.setFontSize(13);
  doc.setTextColor(196, 148, 36);
  doc.text("3. Booth Traffic", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Status", "Count"]],
    body: [
      ["Total", String(booths.total ?? 0)],
      ["Available", String(booths.available ?? 0)],
      ["Reserved", String(booths.reserved ?? 0)],
      ["Occupied", String(booths.occupied ?? 0)],
      ["Occupancy Rate", `${booths.occupancyRate ?? 0}%`],
    ],
    theme: "striped",
    headStyles: { fillColor: [47, 42, 36], textColor: [227, 185, 74] },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;
  const boothMax = Math.max(
    booths.available || 0,
    booths.reserved || 0,
    booths.occupied || 0,
    1
  );
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Booth status breakdown", 14, y);
  y += 6;
  y = drawBarRow(doc, "Available", booths.available || 0, boothMax, 14, y, 120);
  y = drawBarRow(doc, "Reserved", booths.reserved || 0, boothMax, 14, y, 120);
  y = drawBarRow(doc, "Occupied", booths.occupied || 0, boothMax, 14, y, 120);

  if (y > 240) {
    doc.addPage();
    y = 20;
  } else {
    y += 10;
  }

  doc.setFontSize(13);
  doc.setTextColor(196, 148, 36);
  doc.text("4. Sessions", 14, y);
  y += 4;

  if (sessions.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("No sessions scheduled for this expo.", 14, y + 6);
  } else {
    autoTable(doc, {
      startY: y,
      head: [["Title", "Speaker", "Topic", "Location", "Start", "End"]],
      body: sessions.map((s) => [
        s.title || "—",
        s.speaker || "—",
        s.topic || "—",
        s.location || "—",
        formatDateTime(s.startTime),
        formatDateTime(s.endTime),
      ]),
      theme: "striped",
      headStyles: { fillColor: [47, 42, 36], textColor: [227, 185, 74] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 14, doc.internal.pageSize.getHeight() - 8, {
      align: "right",
    });
  }

 const safeTitle = (expo.title || "expo").replace(/[^\w-]+/g, "_").slice(0, 40);
  doc.save(`${safeTitle}-report.pdf`);
};