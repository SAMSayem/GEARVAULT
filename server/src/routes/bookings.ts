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
        $convert: { input: "$equipmentId", to: "objectId", onError: null, onNull: null },
      },
      customerObjectId: {
        $convert: { input: "$customerId", to: "objectId", onError: null, onNull: null },
      },
      ownerObjectId: {
        $convert: { input: "$ownerId", to: "objectId", onError: null, onNull: null },
      },
    },
  },
  {
    $lookup: {
      from: "user",
      localField: "customerObjectId",
      foreignField: "_id",
      as: "customer",
    },
  },
  {
    $lookup: {
      from: "user",
      localField: "ownerObjectId",
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
      "customer.phone": 1,
      "customer.address": 1,
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

// Update booking status. Owners can confirm their own paid bookings;
// admins can manage any booking. Customers may cancel only their own unpaid booking.
router.patch("/:id/status", verifyToken, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });

  const bookingId = String(req.params.id);
  const nextStatus = String(req.body?.status || "");
  const allowed = ["confirmed", "cancelled", "completed"];

  if (!ObjectId.isValid(bookingId) || !allowed.includes(nextStatus)) {
    return res.status(400).json({ message: "Invalid booking ID or status" });
  }

  const booking = await db().collection("bookings").findOne({ _id: new ObjectId(bookingId) });
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const isAdmin = req.user.role === "admin";
  const isOwner = req.user.role === "owner" && booking.ownerId === req.user.id;
  const isCustomer = req.user.role === "customer" && booking.customerId === req.user.id;

  if (!isAdmin && !isOwner && !(isCustomer && nextStatus === "cancelled" && booking.paymentStatus !== "paid")) {
    return res.status(403).json({ message: "You cannot manage this booking" });
  }
  if (nextStatus === "confirmed" && !isOwner && !isAdmin) {
    return res.status(403).json({ message: "Only the equipment owner or admin can confirm a booking" });
  }
  if (nextStatus === "completed" && !isAdmin) {
    return res.status(403).json({ message: "Only an administrator can manually complete a booking" });
  }
  if (nextStatus === "confirmed" && booking.paymentStatus !== "paid") {
    return res.status(409).json({ message: "A booking must be paid before it can be confirmed" });
  }

  await db().collection("bookings").updateOne(
    { _id: new ObjectId(bookingId) },
    { $set: { bookingStatus: nextStatus, updatedAt: new Date() } },
  );
  res.json({ message: "Booking status updated", bookingStatus: nextStatus });
});

export default router;
