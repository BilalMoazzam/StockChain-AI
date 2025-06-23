import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("cartItems");
    setCartItems(stored ? JSON.parse(stored) : []);
  }, []);

  const updateQuantity = (id, newQty) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: parseInt(newQty) || 1 } : item
    );
    setCartItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
  };

  const placeOrder = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const orderData = {
      items: cartItems,
      total: cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      placedAt: new Date().toISOString(),
    };

    // Save to localStorage or send to backend
    localStorage.setItem("lastOrder", JSON.stringify(orderData));

    // Optionally clear cart
    localStorage.removeItem("cartItems");
    setCartItems([]);

    // Redirect to orders or blockchain page
    navigate("/blockchain-transaction");
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">🛒 Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold">{item.ProductName || item.name}</h2>
                <p className="text-gray-500">Rs. {item.price}</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="text-right mt-6">
            <p className="text-xl font-semibold text-gray-700">
              Total: Rs. {totalAmount.toLocaleString()}
            </p>
            <button
              onClick={placeOrder}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Confirm Order & Proceed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
