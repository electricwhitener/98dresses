import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Needed because you're using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse JSON bodies
app.use(express.json());

// ✅ Serve static files (HTML, JS, CSS)
app.use(express.static(__dirname));

// ---------------- MOCK DATA (TEMP) ----------------
let items = [
  { id: 1, title: "Bebe Dress", size: "S", priceCredits: 25 },
  { id: 2, title: "Calvin Klein Dress", size: "M", priceCredits: 30 }
];

let user = {
  starterCredits: 100,
  earnedCredits: 25
};

// ---------------- API ROUTES ----------------

// Credits ("Buttons")
app.get("/api/me", (req, res) => {
  res.json(user);
});

// Shop (Marketplace)
app.get("/api/marketplace", (req, res) => {
  res.json({ items });
});

// My Closet (same for now)
app.get("/api/my-items", (req, res) => {
  res.json({ items });
});

// Add Item
app.post("/api/items", (req, res) => {
  const { title, size, priceCredits } = req.body;

  items.push({
    id: items.length + 1,
    title,
    size,
    priceCredits
  });

  res.json({ success: true });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`98dresses running at http://localhost:${PORT}`);
});
