const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "mysecretkey";

// ================= IN-MEMORY DATABASE =================

let users = [];
let products = [
  { id: 1, name: "Laptop", price: 50000, stock: 10 },
  { id: 2, name: "Mobile", price: 20000, stock: 15 },
  { id: 3, name: "Headphones", price: 2000, stock: 25 }
];
let orders = [];

// ================= AUTH ROUTES =================

// SIGNUP
app.post("/api/signup", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username & Password required" });
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword,
    role: role || "user"
  };

  users.push(newUser);

  res.json({ message: "User registered successfully" });
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: "User not found" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({ token, role: user.role });
});

// ================= MIDDLEWARE =================

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "Access denied" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// ================= USER ROUTES =================

// Get Products
app.get("/api/products", authenticateToken, (req, res) => {
  res.json(products);
});

// Place Order
app.post("/api/order", authenticateToken, (req, res) => {
  const { productId } = req.body;

  const product = products.find(p => p.id == productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.stock <= 0)
    return res.status(400).json({ message: "Out of stock" });

  product.stock--;

  const newOrder = {
    id: orders.length + 1,
    userId: req.user.id,
    productId,
    status: "Processing",
    paymentStatus: "Pending",
    date: new Date()
  };

  orders.push(newOrder);

  res.json({ message: "Order placed", order: newOrder });
});

// View My Orders
app.get("/api/my-orders", authenticateToken, (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.user.id);
  res.json(userOrders);
});

// Cancel Order (User)
app.put("/api/cancel-order/:id", authenticateToken, (req, res) => {
  const order = orders.find(o => o.id == req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.userId !== req.user.id)
    return res.status(403).json({ message: "Not allowed" });

  order.status = "Cancelled";

  res.json({ message: "Order cancelled", order });
});

// ================= PAYMENT SYSTEM =================

// Fake Payment
app.post("/api/payment", authenticateToken, (req, res) => {
  const { orderId, cardNumber } = req.body;

  const order = orders.find(o => o.id == orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (!cardNumber || cardNumber.length < 8)
    return res.status(400).json({ message: "Invalid card number" });

  order.paymentStatus = "Paid";
  order.status = "Confirmed";

  res.json({
    message: "Payment Successful",
    order
  });
});

// ================= ADMIN ROUTES =================

// Add Product
app.post("/api/admin/add-product", authenticateToken, isAdmin, (req, res) => {
  const { name, price, stock } = req.body;

  if (!name || !price || !stock)
    return res.status(400).json({ message: "All fields required" });

  const newProduct = {
    id: products.length + 1,
    name,
    price: Number(price),
    stock: Number(stock)
  };

  products.push(newProduct);

  res.json({ message: "Product added successfully", product: newProduct });
});

// Update Stock
app.put("/api/admin/update-stock/:id", authenticateToken, isAdmin, (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.stock = Number(req.body.stock);

  res.json({ message: "Stock updated", product });
});

// Delete Product
app.delete("/api/admin/delete-product/:id", authenticateToken, isAdmin, (req, res) => {
  const index = products.findIndex(p => p.id == req.params.id);
  if (index === -1)
    return res.status(404).json({ message: "Product not found" });

  products.splice(index, 1);

  res.json({ message: "Product deleted successfully" });
});

// View All Orders
app.get("/api/admin/orders", authenticateToken, isAdmin, (req, res) => {
  res.json(orders);
});

// Admin Update Order Status
app.put("/api/admin/update-order/:id", authenticateToken, isAdmin, (req, res) => {
  const order = orders.find(o => o.id == req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = req.body.status;

  res.json({ message: "Order status updated", order });
});

// ================= SERVER =================

app.listen(5000, () => {
  console.log("🚀 Final Year Level Server running on port 5000");
});
