import React from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

const EntryPass = ({ booking, user }) => {
  const handleDownloadPass = () => {
    try {
      const qrCanvas = document.querySelector(`#entry-pass-${booking._id} canvas`);

      if (!qrCanvas) {
        toast.error("Could not prepare the QR code");
        return;
      }

      const pdf = new jsPDF("l", "mm", [210, 95]); 
      const ticketWidth = 210;
      const ticketHeight = 95;

      const attendeeName = user?.name || "Valued Guest";
      const expoName = booking.expo?.title || booking.eventName || "EventSphere Expo";
      const date = booking.expo?.date
        ? new Date(booking.expo.date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A";
      const location = booking.expo?.location || "Main Arena";

      pdf.setFillColor(248, 245, 239); 
      pdf.rect(0, 0, ticketWidth, ticketHeight, "F");

      pdf.setFillColor(255, 253, 249);
      pdf.roundedRect(6, 6, 198, 83, 6, 6, "F");

      pdf.setDrawColor(196, 148, 36);
      pdf.setLineWidth(1);
      pdf.roundedRect(6, 6, 198, 83, 6, 6, "S");

      pdf.setFillColor(196, 148, 36);
      pdf.roundedRect(10, 10, 132, 16, 4, 4, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("times", "bold");
      pdf.setFontSize(10);
      pdf.text("EVENTSPHERE EXCLUSIVE ACCESS", 14, 21);

      pdf.setTextColor(47, 42, 36);
      pdf.setFont("times", "bold");
      pdf.setFontSize(16);
      const expoLines = pdf.splitTextToSize(expoName, 125);
      pdf.text(expoLines.slice(0, 1), 14, 35);

      pdf.setTextColor(150, 130, 105);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text("PASS HOLDER", 14, 44);

      pdf.setTextColor(47, 42, 36);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(attendeeName, 14, 51);

      // Date & Location
      pdf.setTextColor(150, 130, 105);
      pdf.setFontSize(7);
      pdf.text("DATE & TIME", 14, 61);
      pdf.text("LOCATION", 75, 61);

      pdf.setTextColor(47, 42, 36);
      pdf.setFontSize(9);
      pdf.text(date, 14, 68);

      const locationLines = pdf.splitTextToSize(location, 60);
      pdf.text(locationLines.slice(0, 1), 75, 68);

      // Pass ID Footer Text
      pdf.setTextColor(196, 148, 36);
      pdf.setFont("courier", "bold");
      pdf.setFontSize(8);
      pdf.text(`PASS ID: ${booking.entryPassId || "N/A"}`, 14, 81);

      // 2. Vertical Perforated / Dashed Tear Line (Ticket Stub Divider)
      pdf.setDrawColor(180, 160, 130);
      pdf.setLineWidth(0.6);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(148, 6, 148, 89);
      pdf.setLineDashPattern([], 0); // Reset dash

      // Side Ticket Cutout Circles (Top & Bottom Notches)
      pdf.setFillColor(248, 245, 239);
      pdf.circle(148, 6, 4, "F");
      pdf.circle(148, 89, 4, "F");

      pdf.setDrawColor(196, 148, 36);
      pdf.setLineWidth(0.8);
      pdf.circle(148, 6, 4, "S");
      pdf.circle(148, 89, 4, "S");

      // 3. Right Stub Section (QR Code & Scan Details)
      pdf.setFillColor(245, 238, 226);
      pdf.roundedRect(153, 10, 46, 75, 4, 4, "F");

      // QR Code Box inside Stub
      const qrImage = qrCanvas.toDataURL("image/png");
      pdf.addImage(qrImage, "PNG", 157, 14, 38, 38);

      pdf.setTextColor(47, 42, 36);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text("SCAN FOR ENTRY", 176, 58, { align: "center" });

      pdf.setTextColor(150, 130, 105);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      pdf.text("VALID FOR 1 PERSON", 176, 65, { align: "center" });

      pdf.setTextColor(196, 148, 36);
      pdf.setFont("courier", "bold");
      pdf.setFontSize(7);
      pdf.text(booking.entryPassId || "ESP-PASS", 176, 76, { align: "center" });

      pdf.save(`EventSphere-Pass-${booking.entryPassId || "VIP"}.pdf`);
      toast.success("Entry pass downloaded");
    } catch (error) {
      console.error("Entry pass download error:", error);
      toast.error("Could not download entry pass");
    }
  };

  return (
    <>
      <div className="mt-6">
        <button
          onClick={handleDownloadPass}
          className="flex items-center gap-2 rounded-xl bg-[#2f2a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a8790d]"
        >
          <Download size={17} />
          Download Entry Pass
        </button>

        <p className="mt-2 text-xs text-[#8a8379]">
          Download your official entry pass as a PDF.
        </p>
      </div>

      <div
        id={`entry-pass-${booking._id}`}
        className="absolute -left-[9999px] top-0"
      >
        <QRCodeCanvas
          value={booking.entryPassId}
          size={180}
          bgColor="#ffffff"
          fgColor="#2f2a24"
          includeMargin
        />
      </div>
    </>
  );
};

export default EntryPass;