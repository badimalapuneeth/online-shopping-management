import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, total } = location.state || {};

  const [cardNumber, setCardNumber] = useState("");

  const handlePayment = () => {
    if (!cardNumber || cardNumber.length < 8) {
      alert("Invalid Card Number");
      return;
    }

    alert("Payment Successful!");

    navigate("/dashboard");
  };

  if (!cart) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>No Cart Found</h2>
        <button onClick={() => navigate("/dashboard")}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>💳 Checkout</h2>

      <h3>Total Amount: ₹{total}</h3>

      <input
        placeholder="Enter Card Number"
        onChange={(e) => setCardNumber(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handlePayment}>
        Pay Now
      </button>
    </div>
  );
}

export default Checkout;
