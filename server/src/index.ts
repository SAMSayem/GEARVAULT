import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import Stripe from "stripe";
import { connectDB, db } from "./db.js";
import equipment from "./routes/equipment.js";
import users from "./routes/users.js";
import favorites from "./routes/favorites.js";
import bookings from "./routes/bookings.js";
import payments from "./routes/payments.js";
import analytics from "./routes/analytics.js";
import { notFound, errorHandler } from "./utils/errors.js";
import { startJobs } from "./jobs/cron.js";
const app = express();
const origins = (process.env.CLIENT_URLS || "http://localhost:3000")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || origins.includes(origin)) return cb(null, true);
      return cb(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature"],
  }),
);
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
      const event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"] as string,
        process.env.STRIPE_WEBHOOK_SECRET || "",
      );
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const draft = await db()
          .collection("checkoutSessions")
          .findOne({ stripeSessionId: session.id });
        if (draft && session.payment_status === "paid") {
          const exists = await db()
            .collection("payments")
            .findOne({ stripeSessionId: session.id });
          if (!exists) {
            const b = {
              ...draft.bookingDraft,
              paymentStatus: "paid",
              bookingStatus: "confirmed",
              stripeSessionId: session.id,
              createdAt: new Date(),
              paidAt: new Date(),
            };
            const result = await db().collection("bookings").insertOne(b);
            await db()
              .collection("payments")
              .insertOne({
                stripeSessionId: session.id,
                bookingId: String(result.insertedId),
                customerId: b.customerId,
                ownerId: b.ownerId,
                amountTotal: session.amount_total,
                currency: session.currency,
                paymentIntent: session.payment_intent,
                status: "succeeded",
                createdAt: new Date(),
              });
          }
          await db()
            .collection("checkoutSessions")
            .deleteOne({ stripeSessionId: session.id });
        }
      }
      res.json({ received: true });
    } catch (e: any) {
      console.error("Stripe webhook error", e.message);
      res.status(400).send(`Webhook Error: ${e.message}`);
    }
  },
);
app.use(express.json({ limit: "1mb" }));
app.get("/health", (_req, res) =>
  res.json({
    status: "ok",
    service: "gearvault-api",
    timestamp: new Date().toISOString(),
  }),
);
app.use("/api/equipment", equipment);
app.use("/api/users", users);
app.use("/api/favorites", favorites);
app.use("/api/bookings", bookings);
app.use("/api/payments", payments);
app.use("/api/analytics", analytics);
app.use(notFound);
app.use(errorHandler);
const port = Number(process.env.PORT) || 4000;
connectDB()
  .then(() => {
    if (process.env.CRON_ENABLED !== "false") startJobs();
    app.listen(port, "0.0.0.0", () =>
      console.log(`GearVault API listening on ${port}`),
    );
  })
  .catch((e) => {
    console.error("API startup failed", e);
    process.exit(1);
  });
