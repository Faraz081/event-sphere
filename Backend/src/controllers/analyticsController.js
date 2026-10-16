import Expo from "../models/Expo.js";
import Booth from "../models/Booth.js";
import User from "../models/User.js";
import ExhibitorApplication from "../models/ExhibitorApplication.js";
import Attendee from "../models/Attendee.js";
import Schedule from "../models/Schedule.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const [
      totalExpos,
      publishedExpos,
      totalBooths,
      availableBooths,
      reservedBooths,
      occupiedBooths,
      totalExhibitors,
      pendingExhibitors,
      approvedExhibitors,
      rejectedExhibitors,
      totalAttendees,
      totalUsers,
      totalSessions,
    ] = await Promise.all([
      Expo.countDocuments(),
      Expo.countDocuments({ status: "published" }),
      Booth.countDocuments(),
      Booth.countDocuments({ status: "available" }),
      Booth.countDocuments({ status: "reserved" }),
      Booth.countDocuments({ status: "occupied" }),
      User.countDocuments({ role: "exhibitor" }),
      ExhibitorApplication.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "exhibitor", exhibitorStatus: "approved" }),
      User.countDocuments({ role: "exhibitor", exhibitorStatus: "rejected" }),
      Attendee.countDocuments(),
      User.countDocuments(),
      Schedule.countDocuments(),
    ]);

    const assignedBooths = reservedBooths + occupiedBooths;
    const occupancyRate =
      totalBooths > 0 ? Math.round((assignedBooths / totalBooths) * 100) : 0;

    const recentExpos = await Expo.find()
      .select("title date location status")
      .sort({ createdAt: -1 })
      .limit(5);

    const boothStatusBreakdown = [
      { name: "Available", value: availableBooths, status: "available" },
      { name: "Reserved", value: reservedBooths, status: "reserved" },
      { name: "Occupied", value: occupiedBooths, status: "occupied" },
    ];

    const exhibitorStatusBreakdown = [
      { name: "Pending", value: pendingExhibitors },
      { name: "Approved", value: approvedExhibitors },
      { name: "Rejected", value: rejectedExhibitors },
    ];

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalExpos,
          publishedExpos,
          totalBooths,
          totalExhibitors,
          totalAttendees,
          totalUsers,
          totalSessions,
          occupancyRate,
        },
        booths: {
          available: availableBooths,
          reserved: reservedBooths,
          occupied: occupiedBooths,
          assigned: assignedBooths,
          occupancyRate,
        },
        exhibitors: {
          total: totalExhibitors,
          pending: pendingExhibitors,
          approved: approvedExhibitors,
          rejected: rejectedExhibitors,
        },
        boothStatusBreakdown,
        exhibitorStatusBreakdown,
        recentExpos,
      },
    });
  } catch (error) {
    console.error("getDashboardAnalytics error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch analytics" });
  }
};

export const getExpoReport = async (req, res) => {
  try {
    const { expoId } = req.params;

    if (!expoId) {
      return res.status(400).json({ error: "Expo ID is required" });
    }

    const expo = await Expo.findById(expoId).select(
      "title description theme date location status maxBooths banner createdAt"
    );

    if (!expo) {
      return res.status(404).json({ error: "Expo not found" });
    }

    const attendeeScope = { expo: expoId };

    const [
      attendeeTotal,
      regRegistered,
      regConfirmed,
      regAttended,
      regCancelled,
      bookConfirmed,
      bookPending,
      bookCancelled,
      boothTotal,
      boothAvailable,
      boothReserved,
      boothOccupied,
      sessions,
    ] = await Promise.all([
      Attendee.countDocuments(attendeeScope),
      Attendee.countDocuments({ ...attendeeScope, registrationStatus: "registered" }),
      Attendee.countDocuments({ ...attendeeScope, registrationStatus: "confirmed" }),
      Attendee.countDocuments({ ...attendeeScope, registrationStatus: "attended" }),
      Attendee.countDocuments({ ...attendeeScope, registrationStatus: "cancelled" }),
      Attendee.countDocuments({ ...attendeeScope, bookingStatus: "confirmed" }),
      Attendee.countDocuments({ ...attendeeScope, bookingStatus: "pending" }),
      Attendee.countDocuments({ ...attendeeScope, bookingStatus: "cancelled" }),
      Booth.countDocuments({ expo: expoId }),
      Booth.countDocuments({ expo: expoId, status: "available" }),
      Booth.countDocuments({ expo: expoId, status: "reserved" }),
      Booth.countDocuments({ expo: expoId, status: "occupied" }),
      Schedule.find({ expo: expoId })
        .select("title speaker topic location startTime endTime")
        .sort({ startTime: 1 }),
    ]);

    const assignedBooths = boothReserved + boothOccupied;
    const occupancyRate =
      boothTotal > 0 ? Math.round((assignedBooths / boothTotal) * 100) : 0;

    const engagementRate =
      attendeeTotal > 0
        ? Math.round(((regConfirmed + regAttended) / attendeeTotal) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      report: {
        expo: {
          _id: expo._id,
          title: expo.title,
          description: expo.description,
          theme: expo.theme,
          date: expo.date,
          location: expo.location,
          status: expo.status,
          maxBooths: expo.maxBooths,
        },
        attendees: {
          total: attendeeTotal,
          registered: regRegistered,
          confirmed: regConfirmed,
          attended: regAttended,
          cancelled: regCancelled,
          bookingConfirmed: bookConfirmed,
          bookingPending: bookPending,
          bookingCancelled: bookCancelled,
          engagementRate,
        },
        booths: {
          total: boothTotal,
          available: boothAvailable,
          reserved: boothReserved,
          occupied: boothOccupied,
          assigned: assignedBooths,
          occupancyRate,
        },
        sessions: sessions.map((s) => ({
          title: s.title,
          speaker: s.speaker || "",
          topic: s.topic || "",
          location: s.location || "",
          startTime: s.startTime,
          endTime: s.endTime,
        })),
        summary: {
          attendeeTotal,
          engagementRate,
          boothTotal,
          occupancyRate,
          sessionCount: sessions.length,
        },
      },
    });
  } catch (error) {
    console.error("getExpoReport error:", error);
    res.status(500).json({ error: error.message || "Failed to build expo report" });
  }
};
