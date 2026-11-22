import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../db.js";
import { AuthRequest, verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = Router();

// Get logged-in user's profile
router.get("/me", verifyToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const userId = req.user.id;

  const user = await db()
    .collection<any>("user")
    .findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          name: 1,
          email: 1,
          image: 1,
          role: 1,
          phone: 1,
          address: 1,
          photoURL: 1,
          createdAt: 1,
        },
      },
    );

  res.json({ user });
});

// Update logged-in user's role
router.patch("/me/role", verifyToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const userId = req.user.id;
  const requestedRole = req.body?.role;

  if (!["customer", "owner"].includes(requestedRole)) {
    return res
      .status(400)
      .json({ message: "Registration role must be customer or owner" });
  }

  if (req.user.role === "admin") {
    return res
      .status(403)
      .json({ message: "Administrator roles cannot be changed here" });
  }

  await db()
    .collection<any>("user")
    .updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: requestedRole } },
    );

  res.json({ message: "Account role updated", role: requestedRole });
});

// Update logged-in user's profile
router.patch("/me", verifyToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const userId = req.user.id;
  const allowed: any = {};

  for (const k of ["name", "phone", "address", "photoURL"]) {
    if (typeof req.body[k] === "string") {
      allowed[k] = req.body[k].slice(0, 500);
    }
  }
  // Keep Better Auth's standard image field synchronized with the editable profile URL.
  if (typeof req.body.photoURL === "string") {
    allowed.image = req.body.photoURL.slice(0, 500);
  }

  await db()
    .collection<any>("user")
    .updateOne({ _id: new ObjectId(userId) }, { $set: allowed });

  res.json({ message: "Profile updated" });
});

// Get all users (admin only)
router.get("/admin", verifyToken, verifyAdmin, async (_req, res) => {
  const users = await db()
    .collection("user")
    .find(
      {},
      {
        projection: {
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          image: 1,
        },
      },
    )
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();

  res.json({ users });
});

// Change a user's role (admin only)
router.patch(
  "/admin/:id/role",
  verifyToken,
  verifyAdmin,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;
    const targetId = String(req.params.id);

    if (
      !ObjectId.isValid(targetId) ||
      !["customer", "owner", "admin"].includes(req.body.role)
    ) {
      return res.status(400).json({ message: "Invalid user or role" });
    }

    if (targetId === userId) {
      return res
        .status(400)
        .json({ message: "You cannot change your own role" });
    }

    await db()
      .collection<any>("user")
      .updateOne(
        { _id: new ObjectId(targetId) },
        { $set: { role: req.body.role } },
      );

    res.json({ message: "User role updated" });
  },
);

export default router;
