import { Router } from "express";
import { db } from "../db.js";
import {
  AuthRequest,
  verifyToken,
  verifyAdmin,
  verifyOwner,
} from "../middleware/auth.js";

const router = Router();

// Admin analytics
router.get("/admin", verifyToken, verifyAdmin, async (_req, res) => {
  const [users, equipment, approved, pending, bookings, paid, payments] =
    await Promise.all([
      db().collection("user").countDocuments(),
      db().collection("equipment").countDocuments(),
      db().collection("equipment").countDocuments({ status: "approved" }),
      db().collection("equipment").countDocuments({ status: "pending" }),
      db().collection("bookings").countDocuments(),
      db().collection("bookings").countDocuments({ paymentStatus: "paid" }),
      db()
        .collection("payments")
        .aggregate([
          { $match: { status: "succeeded" } },
          {
            $group: {
              _id: null,
              total: {
                $sum: { $divide: ["$amountTotal", 100] },
              },
            },
          },
        ])
        .toArray(),
    ]);

  res.json({
    stats: {
      total_users: users,
      total_equipment: equipment,
      approved_equipment: approved,
      pending_approvals: pending,
      total_bookings: bookings,
      paid_bookings: paid,
      revenue: payments[0]?.total || 0,
    },
  });
});

// Owner analytics
router.get(
  "/owner",
  verifyToken,
  verifyOwner,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const ownerId = req.user.id;

    const [equipment, bookings, paid, revenue] = await Promise.all([
      db().collection("equipment").countDocuments({ ownerId }),
      db().collection("bookings").countDocuments({ ownerId }),
      db().collection("bookings").countDocuments({
        ownerId,
        paymentStatus: "paid",
      }),
      db()
        .collection("payments")
        .aggregate([
          {
            $match: {
              ownerId,
              status: "succeeded",
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: { $divide: ["$amountTotal", 100] },
              },
            },
          },
        ])
        .toArray(),
    ]);

    res.json({
      stats: {
        my_equipment: equipment,
        total_rentals: bookings,
        paid_rentals: paid,
        revenue: revenue[0]?.total || 0,
      },
    });
  },
);

export default router;
