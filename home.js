import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCHeYdFLldJujCUxnGZ8HWqtLtSwQwF5aw",
  authDomain: "dresses-95f9a.firebaseapp.com",
  projectId: "dresses-95f9a.firebaseapp.com",
  storageBucket: "dresses-95f9a.firebasestorage.app",
  messagingSenderId: "525890814996",
  appId: "1:525890814996:web:5dcca98f67a0d6fc6fd301"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔐 PROTECT PAGE
onAuthStateChanged(auth, async (user) => {
  if (!user || !user.emailVerified) {
    window.location.href = "index.html";
    return;
  }

  await loadCredits();
  await loadShop(); // default view
});

// 🔓 LOGOUT
document.getElementById("logout").onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

// ---------------- DASHBOARD VIEWS ----------------

async function loadCredits() {
  const res = await fetch("/api/me");
  const data = await res.json();

  document.getElementById("credits").innerText =
    `Credits: ${data.starterCredits + data.earnedCredits}`;
}

async function loadShop() {
  const res = await fetch("/api/marketplace");
  const data = await res.json();

  renderItems(data.items);
}

// (used later for "My Closet")
async function loadMyCloset() {
  const res = await fetch("/api/my-items");
  const data = await res.json();

  renderItems(data.items);
}

// ---------------- RENDER ----------------

function renderItems(items) {
  const grid = document.getElementById("itemsGrid");
  grid.innerHTML = "";

  if (!items.length) {
    grid.innerHTML = "<p>No items found.</p>";
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>${item.title}</h4>
      <p>Size: ${item.size}</p>
      <p>${item.priceCredits} buttons</p>
      <button>View</button>
    `;
    grid.appendChild(div);
  });
}

// ---------------- NAVIGATION ----------------

document.querySelectorAll("nav button[data-view]").forEach(btn => {
  btn.onclick = () => {
    if (btn.dataset.view === "shop") loadShop();
    if (btn.dataset.view === "closet") loadMyCloset();
    if (btn.dataset.view === "credits") loadCreditsView();
    if (btn.dataset.view === "add") loadAddItem();
  };
});

// ---------------- PLACEHOLDERS ----------------

function loadCreditsView() {
  document.getElementById("itemsGrid").innerHTML =
    "<p>Credits shown in header.</p>";
}

function loadAddItem() {
  document.getElementById("itemsGrid").innerHTML = `
    <h3>Add Item</h3>
    <input id="title" placeholder="Title" />
    <input id="size" placeholder="Size" />
    <input id="price" type="number" placeholder="Credits" />
    <button id="submit">Submit</button>
  `;

  document.getElementById("submit").onclick = submitItem;
}

async function submitItem() {
  await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title.value,
      size: size.value,
      priceCredits: Number(price.value)
    })
  });

  loadMyCloset();
}
