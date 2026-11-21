import { Router } from "express";
import Stripe from "stripe";
import { ObjectId } from "mongodb";
import { db } from "../db.js";
import { AuthRequest, verifyToken, verifyRenter } from "../middleware/auth.js";

const router = Router();

const stripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

router.post(
  "/checkout",
  verifyToken,
  verifyRenter,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const customerId = req.user.id;

    const {
      equipmentId,
      startDate,
      endDate,
      quantity,
      contactNumber,
      deliveryAddress,
      notes,
    } = req.body;

    if (
      !ObjectId.isValid(equipmentId) ||
      !startDate ||
      !endDate ||
      !contactNumber ||
      !deliveryAddress
    ) {
      return res
        .status(400)
        .json({ message: "Complete all required booking fields" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const qty = Number(quantity);

    if (
      !Number.isFinite(+start) ||
      !Number.isFinite(+end) ||
      end <= start ||
      start < new Date(new Date().setHours(0, 0, 0, 0)) ||
      !Number.isInteger(qty) ||
      qty < 1
    ) {
      return res
        .status(400)
        .json({ message: "Choose valid rental dates and quantity" });
    }

    const equipment = await db()
      .collection("equipment")
      .findOne({ _id: new ObjectId(equipmentId), status: "approved" });

    if (!equipment) {
      return res.status(404).json({ message: "Equipment is not available" });
    }

    if (qty > equipment.availableQuantity) {
      return res
        .status(409)
        .json({ message: "Requested quantity exceeds listed quantity" });
    }

    const overlapping = await db()
      .collection("bookings")
      .aggregate([
        {
          $match: {
            equipmentId,
            startDate: { $lt: end },
            endDate: { $gt: start },
            paymentStatus: "paid",
            bookingStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            booked: { $sum: "$quantity" },
          },
        },
      ])
      .toArray();

    const bookedQuantity = overlapping[0]?.booked || 0;

    const activeHolds = await db()
      .collection("checkoutSessions")
      .find({
        expiresAt: { $gt: new Date() },
        "bookingDraft.equipmentId": equipmentId,
        "bookingDraft.startDate": { $lt: end },
        "bookingDraft.endDate": { $gt: start },
      })
      .toArray();

    const heldQuantity = activeHolds.reduce(
      (sum: number, hold: any) =>
        sum + Number(hold.bookingDraft?.quantity || 0),
      0,
    );

    if (bookedQuantity + heldQuantity + qty > equipment.availableQuantity) {
      return res
        .status(409)
        .json({ message: "Not enough equipment is available for those dates" });
    }

    const units = Math.max(1, Math.ceil((+end - +start) / 86400000));

    const multiplier =
      equipment.rentalType === "weekly"
        ? Math.ceil(units / 7)
        : equipment.rentalType === "monthly"
          ? Math.ceil(units / 30)
          : units;

    const total = Number(equipment.price) * multiplier * qty;

    if (!Number.isFinite(total) || total <= 0) {
      return res.status(400).json({ message: "Invalid rental total" });
    }

    const bookingDraft = {
      equipmentId,
      customerId,
      ownerId: equipment.ownerId,
      equipmentTitle: equipment.title,
      equipmentImage: equipment.image,
      startDate: start,
      endDate: end,
      quantity: qty,
      contactNumber,
      deliveryAddress,
      notes: notes || "",
      rentalUnits: multiplier,
      unitPrice: equipment.price,
      totalAmount: total,
      currency: "bdt",
      paymentStatus: "unpaid",
      bookingStatus: "awaiting_payment",
      createdAt: new Date(),
    };

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "bdt",
            unit_amount: Math.round(total * 100),
            product_data: {
              name: `${equipment.title} rental`,
              description: `${units} day(s), ${qty} unit(s)`,
            },
          },
        },
      ],
      metadata: {
        customerId,
        equipmentId,
        ownerId: equipment.ownerId,
      },
      success_url:
        process.env.STRIPE_SUCCESS_URL ||
        "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url:
        process.env.STRIPE_CANCEL_URL || "http://localhost:3000/payment/cancel",
    });

    await db()
      .collection("checkoutSessions")
      .insertOne({
        stripeSessionId: session.id,
        bookingDraft,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });

    res.json({ url: session.url });
  },
);

router.get("/session/:id", verifyToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const customerId = req.user.id;

  const payment = await db()
    .collection("payments")
    .findOne({ stripeSessionId: req.params.id, customerId });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  res.json({ payment });
});

export default router;
