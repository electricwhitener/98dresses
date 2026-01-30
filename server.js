import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import fs from "fs";

const app = express();
const PORT = 3000;

// Needed because you're using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔐 Firebase Admin Init
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "firebase-admin.json"))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Parse JSON bodies
app.use(express.json());

// ✅ Serve static files (HTML, JS, CSS)
app.use(express.static(__dirname));

/* -------------------------------------------------
   🔐 AUTH MIDDLEWARE (ADD THIS)
------------------------------------------------- */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // uid, email, etc.
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* -------------------------------------------------
   MOCK DATA (TEMP — WILL MOVE TO FIRESTORE LATER)
------------------------------------------------- */
let items = [];

/* -------------------------------------------------
   API ROUTES (NOW PROTECTED)
------------------------------------------------- */

// 🔘 Credits ("Buttons")
app.get("/api/me", requireAuth, (req, res) => {
  // TEMP credits — later from DB
  res.json({
    starterCredits: 100,
    earnedCredits: 25
  });
});

// 🛍️ Shop (Marketplace)
app.get("/api/marketplace", requireAuth, (req, res) => {
  res.json({ items });
});

// 👗 My Closet (ONLY USER ITEMS)
app.get("/api/my-items", requireAuth, (req, res) => {
  const myItems = items.filter(
    item => item.ownerId === req.user.uid
  );
  res.json({ items: myItems });
});

// ➕ Add Item
app.post("/api/items", requireAuth, (req, res) => {
  const { title, size, priceCredits, imageUrl } = req.body;

  const newItem = {
    id: items.length + 1,
    title,
    size,
    priceCredits,
    imageUrl,
    ownerId: req.user.uid
  };

  items.push(newItem);
  res.json({ success: true, item: newItem });
});

// ❌ Delete Item (OWNER ONLY)
app.delete("/api/items/:id", requireAuth, (req, res) => {
  const itemId = Number(req.params.id);
  const item = items.find(i => i.id === itemId);

  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  if (item.ownerId !== req.user.uid) {
    return res.status(403).json({ error: "Not allowed" });
  }

  items = items.filter(i => i.id !== itemId);
  res.json({ success: true });
});

// 📄 Single Item (FOR PREVIEW / DETAIL PAGE)
app.get("/api/items/:id", requireAuth, (req, res) => {
  const item = items.find(i => i.id === Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  res.json(item);
});

/* -------------------------------------------------
   START SERVER
------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`98dresses running at http://localhost:${PORT}`);
});
