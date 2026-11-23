import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../db.js";
import {
  AuthRequest,
  verifyToken,
  verifyOwner,
  verifyAdmin,
} from "../middleware/auth.js";

const router = Router();

// Get all approved equipment
router.get("/", async (req, res) => {
  const {
    q = "",
    category = "",
    rentalType = "",
    availability = "available",
    sort = "recent",
    limit = "30",
    page = "1",
  } = req.query as any;

  const filter: any = { status: "approved" };

  if (category) filter.category = category;
  if (rentalType) filter.rentalType = rentalType;

  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);

  if (
    (Number.isFinite(minPrice) && minPrice > 0) ||
    (Number.isFinite(maxPrice) && maxPrice > 0)
  ) {
    filter.price = {
      ...(Number.isFinite(minPrice) && minPrice > 0 ? { $gte: minPrice } : {}),
      ...(Number.isFinite(maxPrice) && maxPrice > 0 ? { $lte: maxPrice } : {}),
    };
  }

  if (availability === "available") {
    filter.availableQuantity = { $gt: 0 };
  } else if (availability === "unavailable") {
    filter.availableQuantity = { $lte: 0 };
  }

  // Escape user-provided search text so it is treated as text, not a regex program.
  const searchText = String(q).trim().slice(0, 80);
  if (searchText) {
    const escaped = searchText.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { location: { $regex: escaped, $options: "i" } },
      { category: { $regex: escaped, $options: "i" } },
    ];
  }

  const order =
    sort === "price_asc"
      ? { price: 1 }
      : sort === "price_desc"
        ? { price: -1 }
        : { createdAt: -1 };

  const size = Math.min(60, Math.max(1, Number(limit) || 30));
  const p = Math.max(1, Number(page) || 1);

  const [items, total] = await Promise.all([
    db()
      .collection("equipment")
      .find(filter)
      .sort(order as any)
      .skip((p - 1) * size)
      .limit(size)
      .toArray(),

    db().collection("equipment").countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page: p,
    pages: Math.ceil(total / size),
  });
});

// Get one approved equipment item
router.get("/:id", verifyToken, async (req, res, next) => {
  if (req.params.id === "owner" || req.params.id === "admin") {
    return next();
  }

  const equipmentId = String(req.params.id);

  if (!ObjectId.isValid(equipmentId)) {
    return res.status(404).json({ message: "Equipment not found" });
  }

  const item = await db()
    .collection("equipment")
    .findOne({
      _id: new ObjectId(equipmentId),
      status: "approved",
    });

  if (!item) {
    return res.status(404).json({ message: "Equipment not found" });
  }

  const owner = await db()
    .collection("user")
    .findOne(
      { _id: item.ownerId },
      { projection: { name: 1, image: 1, email: 1 } },
    );

  res.json({ item: { ...item, owner } });
});

// Owner: submit new equipment
router.post(
  "/owner",
  verifyToken,
  verifyOwner,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const body = req.body;

    const required = ["title", "description", "category", "location", "image"];

    if (
      required.some((k) => !body[k]) ||
      !Number.isFinite(Number(body.price)) ||
      Number(body.price) <= 0 ||
      Number(body.availableQuantity) < 1
    ) {
      return res
        .status(400)
        .json({ message: "Please provide valid equipment details" });
    }

    const ownerId = req.user.id;

    const doc = {
      title: String(body.title).trim(),
      description: String(body.description),
      category: body.category,
      location: String(body.location),
      price: Number(body.price),
      rentalType: body.rentalType,
      availableQuantity: Number(body.availableQuantity),
      condition: body.condition,
      brand: body.brand,
      model: body.model,
      image: body.image,
      terms: body.terms || "",
      ownerId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db().collection("equipment").insertOne(doc);

    res.status(201).json({
      message: "Equipment submitted for review",
      item: { ...doc, _id: result.insertedId },
    });
  },
);

// Owner: get own equipment
router.get(
  "/owner",
  verifyToken,
  verifyOwner,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ownerId = req.user.id;

    const items = await db()
      .collection("equipment")
      .find({ ownerId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ items });
  },
);

// Owner: update own equipment
router.patch(
  "/owner/:id",
  verifyToken,
  verifyOwner,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const equipmentId = String(req.params.id);

    if (!ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ message: "Invalid equipment ID" });
    }

    const ownerId = req.user.id;
    const allowed: any = {};

    for (const k of [
      "title",
      "description",
      "category",
      "location",
      "price",
      "rentalType",
      "availableQuantity",
      "condition",
      "brand",
      "model",
      "image",
      "terms",
    ]) {
      if (req.body[k] !== undefined) {
        allowed[k] = req.body[k];
      }
    }

    if (
      allowed.price !== undefined &&
      (!Number.isFinite(Number(allowed.price)) || Number(allowed.price) <= 0)
    ) {
      return res.status(400).json({ message: "Invalid rental price" });
    }

    if (
      allowed.availableQuantity !== undefined &&
      (!Number.isInteger(Number(allowed.availableQuantity)) ||
        Number(allowed.availableQuantity) < 1)
    ) {
      return res.status(400).json({ message: "Invalid available quantity" });
    }

    const result = await db()
      .collection("equipment")
      .updateOne(
        {
          _id: new ObjectId(equipmentId),
          ownerId,
        },
        {
          $set: {
            ...allowed,
            status: "pending",
            updatedAt: new Date(),
          },
        },
      );

    if (!result.matchedCount) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json({
      message: "Equipment updated and sent for re-approval",
    });
  },
);

// Owner: delete own equipment
router.delete(
  "/owner/:id",
  verifyToken,
  verifyOwner,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const equipmentId = String(req.params.id);

    if (!ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ message: "Invalid equipment ID" });
    }

    const ownerId = req.user.id;

    const result = await db()
      .collection("equipment")
      .deleteOne({
        _id: new ObjectId(equipmentId),
        ownerId,
      });

    res.json({ deleted: result.deletedCount === 1 });
  },
);

// Admin: get all equipment
router.get("/admin", verifyToken, verifyAdmin, async (_req, res) => {
  const items = await db()
    .collection("equipment")
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ items });
});

// Admin: approve, reject, or return equipment to pending
router.patch(
  "/admin/:id/status",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const equipmentId = String(req.params.id);

    if (!ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ message: "Invalid equipment ID" });
    }

    if (!["approved", "rejected", "pending"].includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await db()
      .collection("equipment")
      .updateOne(
        { _id: new ObjectId(equipmentId) },
        {
          $set: {
            status: req.body.status,
            updatedAt: new Date(),
          },
        },
      );

    res.json({ updated: result.modifiedCount === 1 });
  },
);

// Admin: update equipment details
router.patch("/admin/:id", verifyToken, verifyAdmin, async (req, res) => {
  const equipmentId = String(req.params.id);

  if (!ObjectId.isValid(equipmentId)) {
    return res.status(400).json({ message: "Invalid equipment ID" });
  }

  const allowed: any = {};

  for (const k of [
    "title",
    "description",
    "category",
    "location",
    "price",
    "rentalType",
    "availableQuantity",
    "condition",
    "brand",
    "model",
    "image",
    "terms",
    "status",
  ]) {
    if (req.body[k] !== undefined) {
      allowed[k] = req.body[k];
    }
  }

  if (
    allowed.price !== undefined &&
    (!Number.isFinite(Number(allowed.price)) || Number(allowed.price) <= 0)
  ) {
    return res.status(400).json({ message: "Invalid rental price" });
  }
  if (
    allowed.availableQuantity !== undefined &&
    (!Number.isInteger(Number(allowed.availableQuantity)) ||
      Number(allowed.availableQuantity) < 1)
  ) {
    return res.status(400).json({ message: "Invalid available quantity" });
  }
  if (
    allowed.status !== undefined &&
    !["pending", "approved", "rejected"].includes(allowed.status)
  ) {
    return res.status(400).json({ message: "Invalid equipment status" });
  }

  allowed.updatedAt = new Date();

  const result = await db()
    .collection("equipment")
    .updateOne({ _id: new ObjectId(equipmentId) }, { $set: allowed });

  if (!result.matchedCount) {
    return res.status(404).json({ message: "Equipment not found" });
  }

  res.json({ message: "Equipment updated" });
});

// Admin: delete equipment
router.delete("/admin/:id", verifyToken, verifyAdmin, async (req, res) => {
  const equipmentId = String(req.params.id);

  if (!ObjectId.isValid(equipmentId)) {
    return res.status(400).json({ message: "Invalid equipment ID" });
  }

  await db()
    .collection("equipment")
    .deleteOne({ _id: new ObjectId(equipmentId) });

  res.json({ deleted: true });
});

export default router;
