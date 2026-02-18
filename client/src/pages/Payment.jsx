import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Payment() {
  const { id } = useParams(); // orderId from URL
  const [cardNumber, setCardNumber] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handlePayment = async () => {
    const res = await fetch("http://localhost:5000/api/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        orderId: id,
        cardNumber
      })
    });

    const data = await res.json();

    if (data.message === "Payment Successful") {
      alert("Payment Completed!");
      navigate("/dashboard");
    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      <h2>Payment for Order #{id}</h2>

      <input
        placeholder="Enter Card Number"
        onChange={(e) => setCardNumber(e.target.value)}
      />
      <br />

      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
}

export default Payment;
