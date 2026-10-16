import React from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

const EntryPass = ({ booking, user }) => {
  const passCode = booking.passCode || booking.entryPassId;
 const SITE_URL = "https://event-sphere-z3ci-gold.vercel.app";
const checkInUrl = passCode
  ? `${SITE_URL}/check-in/${encodeURIComponent(passCode)}`
  : "";
  const isCheckedIn = booking.passStatus === "scanned";
  const isRevoked = booking.passStatus === "revoked" || booking.bookingStatus === "cancelled";

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
      const expoName = booking.event?.title || booking.expo?.title || booking.eventName || "EventSphere Expo";
      const eventDate = booking.eventDate || booking.expo?.date || booking.event?.date;
      const date = eventDate
        ? new Date(eventDate).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A";
      const location = booking.event?.location || booking.expo?.location || "Main Arena";

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

      pdf.setTextColor(150, 130, 105);
      pdf.setFontSize(7);
      pdf.text("DATE & TIME", 14, 61);
      pdf.text("LOCATION", 75, 61);

      pdf.setTextColor(47, 42, 36);
      pdf.setFontSize(9);
      pdf.text(date, 14, 68);

      const locationLines = pdf.splitTextToSize(location, 60);
      pdf.text(locationLines.slice(0, 1), 75, 68);

      pdf.setTextColor(196, 148, 36);
      pdf.setFont("courier", "bold");
      pdf.setFontSize(8);
      pdf.text(`PASS ID: ${passCode || "N/A"}`, 14, 81);

      pdf.setDrawColor(180, 160, 130);
      pdf.setLineWidth(0.6);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(148, 6, 148, 89);
      pdf.setLineDashPattern([], 0); 

      pdf.setFillColor(248, 245, 239);
      pdf.circle(148, 6, 4, "F");
      pdf.circle(148, 89, 4, "F");

      pdf.setDrawColor(196, 148, 36);
      pdf.setLineWidth(0.8);
      pdf.circle(148, 6, 4, "S");
      pdf.circle(148, 89, 4, "S");

      pdf.setFillColor(245, 238, 226);
      pdf.roundedRect(153, 10, 46, 75, 4, 4, "F");

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
      pdf.text(passCode || "ESP-PASS", 176, 76, { align: "center" });

      pdf.save(`EventSphere-Pass-${passCode || "VIP"}.pdf`);
      toast.success("Entry pass downloaded");
    } catch (error) {
      console.error("Entry pass download error:", error);
      toast.error("Could not download entry pass");
    }
  };

  return (
    <>
      <div className="mt-5 flex flex-col gap-4 rounded-xl border border-[#eadfc9] bg-[#fdf8ee] p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a8379]">Pass code</p>
          <p className="mt-1 font-mono text-lg font-bold tracking-wider text-[#2f2a24]">{passCode || "Not issued"}</p>
          {isCheckedIn ? (
            <p className="mt-2 text-sm font-semibold text-emerald-800">
              Approved — checked in{booking.checkedInAt ? ` on ${new Date(booking.checkedInAt).toLocaleString()}` : ""}
            </p>
          ) : isRevoked ? (
            <p className="mt-2 text-sm font-semibold text-rose-700">Pass expired or revoked</p>
          ) : (
            <p className="mt-2 text-sm font-semibold text-emerald-800">Valid for one check-in</p>
          )}
          {!isCheckedIn && !isRevoked && passCode && (
            <button
              onClick={handleDownloadPass}
              className="mt-3 flex items-center gap-2 rounded-xl bg-[#2f2a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a8790d]"
            >
              <Download size={17} />
              Download Entry Pass
            </button>
          )}
        </div>
        {passCode && !isCheckedIn && (
          <div id={`entry-pass-${booking._id}`} className="self-center rounded-lg bg-white p-2">
            <QRCodeCanvas
              value={checkInUrl}
              size={128}
              bgColor="#ffffff"
              fgColor="#2f2a24"
              includeMargin
            />
          </div>
        )}
      </div>
    </>
  );
};

export default EntryPass;