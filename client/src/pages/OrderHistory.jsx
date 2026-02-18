import { useEffect, useState } from "react";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/my-orders", {
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      });
  }, []);

  return (
    <div>
      <h2>My Orders</h2>

      {orders.length === 0 && <p>No orders found</p>}

      {orders.map(order => (
        <div key={order.id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <p>Order ID: {order.id}</p>
          <p>Product ID: {order.productId}</p>
          <p>Status: {order.status}</p>
          <p>Payment: {order.paymentStatus}</p>
        </div>
      ))}
    </div>
  );
}

export default OrderHistory;
