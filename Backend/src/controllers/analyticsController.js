import Expo from "../models/Expo.js";
import Booth from "../models/Booth.js";
import User from "../models/User.js";
import Attendee from "../models/Attendee.js";
import Schedule from "../models/Schedule.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    // Parallel counts for speed
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
      User.countDocuments({ role: "exhibitor", exhibitorStatus: "pending" }),
      User.countDocuments({ role: "exhibitor", exhibitorStatus: "approved" }),
      User.countDocuments({ role: "exhibitor", exhibitorStatus: "rejected" }),
      Attendee.countDocuments(),
      User.countDocuments(),
      Schedule.countDocuments(),
    ]);

    // Occupancy %
    const assignedBooths = reservedBooths + occupiedBooths;
    const occupancyRate =
      totalBooths > 0 ? Math.round((assignedBooths / totalBooths) * 100) : 0;

    // Recent expos (last 5)
    const recentExpos = await Expo.find()
      .select("title date location status")
      .sort({ createdAt: -1 })
      .limit(5);

    // Booth status breakdown (for chart)
    const boothStatusBreakdown = [
      { name: "Available", value: availableBooths, status: "available" },
      { name: "Reserved", value: reservedBooths, status: "reserved" },
      { name: "Occupied", value: occupiedBooths, status: "occupied" },
    ];

    // Exhibitor status breakdown
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