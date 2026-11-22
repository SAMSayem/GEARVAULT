import { Router } from "express";
import { db } from "../db.js";
import { AuthRequest, verifyToken, verifyAdmin, verifyOwner } from "../middleware/auth.js";

const router = Router();

// Admin analytics: platform-wide totals plus monthly booking performance.
router.get("/admin", verifyToken, verifyAdmin, async (_req, res) => {
  const [
    totalUsers, totalEquipment, approvedEquipment, pendingApprovals,
    totalBookings, completedRentals, paymentTotals, monthlyBookings,
  ] = await Promise.all([
    db().collection("user").countDocuments(),
    db().collection("equipment").countDocuments(),
    db().collection("equipment").countDocuments({ status: "approved" }),
    db().collection("equipment").countDocuments({ status: "pending" }),
    db().collection("bookings").countDocuments(),
    db().collection("bookings").countDocuments({ bookingStatus: "completed" }),
    db().collection("payments").aggregate([
      { $match: { status: "succeeded" } },
      { $group: { _id: null, total: { $sum: { $divide: ["$amountTotal", 100] } } } },
    ]).toArray(),
    db().collection("bookings").aggregate([
      { $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        bookings: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0] } },
      } },
      { $sort: { _id: 1 } },
    ]).toArray(),
  ]);

  res.json({
    stats: {
      total_users: totalUsers,
      total_equipment: totalEquipment,
      approved_equipment: approvedEquipment,
      pending_approvals: pendingApprovals,
      total_bookings: totalBookings,
      completed_rentals: completedRentals,
      total_revenue: paymentTotals[0]?.total || 0,
    },
    monthly_bookings: monthlyBookings.map((m) => ({
      month: m._id, bookings: m.bookings, revenue: m.revenue,
    })),
  });
});

// Owner analytics are scoped to the authenticated owner's records.
router.get("/owner", verifyToken, verifyOwner, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  const ownerId = req.user.id;

  const [listedEquipment, totalBookings, completedRentals, paymentTotals, monthlyEarnings] = await Promise.all([
    db().collection("equipment").countDocuments({ ownerId }),
    db().collection("bookings").countDocuments({ ownerId }),
    db().collection("bookings").countDocuments({ ownerId, bookingStatus: "completed" }),
    db().collection("payments").aggregate([
      { $match: { ownerId, status: "succeeded" } },
      { $group: { _id: null, total: { $sum: { $divide: ["$amountTotal", 100] } } } },
    ]).toArray(),
    db().collection("payments").aggregate([
      { $match: { ownerId, status: "succeeded" } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        earnings: { $sum: { $divide: ["$amountTotal", 100] } },
      } },
      { $sort: { _id: 1 } },
    ]).toArray(),
  ]);

  res.json({
    stats: {
      total_listed_equipment: listedEquipment,
      total_bookings: totalBookings,
      completed_rentals: completedRentals,
      total_earnings: paymentTotals[0]?.total || 0,
    },
    monthly_earnings: monthlyEarnings.map((m) => ({ month: m._id, earnings: m.earnings })),
  });
});

export default router;
