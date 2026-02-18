import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // 🛒 Load cart from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch products
  useEffect(() => {
    fetch("http://localhost:5000/api/products", {
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      });
  }, []);

  // 🛒 Add to Cart with Quantity
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      setCart(
        cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // 🔍 Filter Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesPrice =
      maxPrice === "" || product.price <= Number(maxPrice);

    return matchesSearch && matchesPrice;
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>🛒 User Dashboard</h2>

        <div>
          <button
            className="secondary-btn"
            onClick={() => navigate("/cart")}
          >
            Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="filter-section">
        <input
          type="text"
          placeholder="Search product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p className="price">₹{product.price}</p>
            <p>Stock: {product.stock}</p>

            <button
              className="buy-btn"
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
