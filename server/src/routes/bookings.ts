import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../db.js";
import {
  AuthRequest,
  verifyToken,
  verifyRenter,
  verifyOwner,
  verifyAdmin,
} from "../middleware/auth.js";

const router = Router();

const enrichedBookings = () => [
  {
    $addFields: {
      equipmentObjectId: {
        $convert: {
          input: "$equipmentId",
          to: "objectId",
          onError: null,
          onNull: null,
        },
      },
    },
  },
  {
    $lookup: {
      from: "user",
      localField: "customerId",
      foreignField: "_id",
      as: "customer",
    },
  },
  {
    $lookup: {
      from: "user",
      localField: "ownerId",
      foreignField: "_id",
      as: "owner",
    },
  },
  {
    $lookup: {
      from: "equipment",
      localField: "equipmentObjectId",
      foreignField: "_id",
      as: "equipment",
    },
  },
  { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
  { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
  { $unwind: { path: "$equipment", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      "customer.name": 1,
      "customer.email": 1,
      "customer.image": 1,
      "owner.name": 1,
      "owner.email": 1,
      "equipment.title": 1,
      "equipment.image": 1,
      "equipment.location": 1,
      equipmentId: 1,
      customerId: 1,
      ownerId: 1,
      equipmentTitle: 1,
      equipmentImage: 1,
      startDate: 1,
      endDate: 1,
      quantity: 1,
      totalAmount: 1,
      paymentStatus: 1,
      bookingStatus: 1,
      createdAt: 1,
      contactNumber: 1,
      deliveryAddress: 1,
      notes: 1,
      stripeSessionId: 1,
    },
  },
];

// Customer bookings
router.get(
  "/mine",
  verifyToken,
  verifyRenter,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const customerId = req.user.id;

    const bookings = await db()
      .collection("bookings")
      .aggregate([
        { $match: { customerId } },
        { $sort: { createdAt: -1 } },
        ...enrichedBookings(),
      ])
      .toArray();

    res.json({ bookings });
  },
);

// Owner bookings
router.get(
  "/owner",
  verifyToken,
  verifyOwner,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ownerId = req.user.id;

    const bookings = await db()
      .collection("bookings")
      .aggregate([
        { $match: { ownerId } },
        { $sort: { createdAt: -1 } },
        ...enrichedBookings(),
      ])
      .toArray();

    res.json({ bookings });
  },
);

// Admin bookings
router.get("/admin", verifyToken, verifyAdmin, async (_req, res) => {
  const bookings = await db()
    .collection("bookings")
    .aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 1000 },
      ...enrichedBookings(),
    ])
    .toArray();

  res.json({ bookings });
});

// Update booking status
router.patch("/:id/status", verifyToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const allowed = ["confirmed", "completed", "cancelled"];

  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid booking status" });
  }

  const bookingId = String(req.params.id);

  if (!ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  const query: any = { _id: new ObjectId(bookingId) };

  if (req.user.role === "owner") {
    query.ownerId = req.user.id;
  } else if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }

  await db()
    .collection("bookings")
    .updateOne(query, {
      $set: {
        bookingStatus: req.body.status,
        updatedAt: new Date(),
      },
    });

  res.json({ message: "Booking status updated" });
});

export default router;
