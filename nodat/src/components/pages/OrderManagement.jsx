"use client";
import React, { useContext } from "react";
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OrderDashboard } from "../orders/OrderDashboard";
import { Modal } from "../ui-components"; // Assuming Modal is a shadcn/ui component or similar
import { addNotification } from "../../utils/notificationService"; // Import notification service
import { useInventory } from "../../context/InventoryContext"; // Import useInventory context
import Header from "../layout/Header"; // Assuming Header component path
import "../styles/OrderManagement.css"; // Import the new CSS
import { UserContext } from "../../context/UserContext";

const OrderManagement = ({
  inventory: initialInventory = [],
  customers: initialCustomers = [],
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { inventory, updateProductQuantityInContext, fetchInventoryData } =
    useInventory(); // Get inventory from context

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState(initialCustomers);
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const stored = localStorage.getItem("selectedProductFromInventory"); // Use this key for products coming from inventory
    return stored ? JSON.parse(stored) : [];
  });

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { username } = useContext(UserContext);

  // Handle products passed from InventoryManagement via localStorage
  useEffect(() => {
    const productsFromInventory = JSON.parse(
      localStorage.getItem("selectedProductFromInventory")
    );
    if (productsFromInventory && productsFromInventory.length > 0) {
      setSelectedProducts((prev) => {
        const newProducts = productsFromInventory.filter(
          (pfi) => !prev.some((sp) => sp.id === pfi.id)
        );
        return [...prev, ...newProducts];
      });
      // localStorage.removeItem("selectedProductFromInventory") // This line was removed in previous fix
    }
  }, [location.search]); // Trigger when URL changes (e.g., from inventory page)

  const handleCreateOrderFromProduct = (product) => {
    const newOrder = {
      id: `ORD${String(orders.length + 1).padStart(3, "0")}`,
      orderNumber: `#ORD-${String(orders.length + 1).padStart(3, "0")}`,
      orderDate: new Date().toISOString().split("T")[0],
      orderDetails: product.name,
      customer: username || "New Customer",  // Use username from context if available, else fallback to "New Customer"
      customerName: username || "New Customer",  // Set customer name to username if available
      customerEmail: product.customerEmail || "N/A",
      items: [product.sku || "N/A"],
      total: product.totalPrice || product.price,
      status: "Pending",
      paymentStatus: "Pending",
      date: new Date().toLocaleDateString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    addNotification({
      type: "order",
      title: "New Order Created",
      description: `Order ${newOrder.orderNumber} for ${newOrder.customer} has been created.`,
      priority: "normal",
      icon: "shopping-cart",
      link: `/orders/${newOrder.id}`,
    });
  };
  

  const handleClearSelected = useCallback(async () => {
    // Restore quantities to inventory using the context function
    selectedProducts.forEach((productToRestore) => {
      const currentInventoryItem = inventory.find(
        (item) => item.id === productToRestore.id
      );
      if (currentInventoryItem) {
        const newQuantity =
          currentInventoryItem.quantity + productToRestore.quantity;
        updateProductQuantityInContext(productToRestore.id, newQuantity);
      }
    });

    for (const productToRestore of selectedProducts) {
      const currentInventoryItem = inventory.find(
        (item) => item.id === productToRestore.id
      );
      if (currentInventoryItem) {
        const newQuantity =
          currentInventoryItem.quantity + productToRestore.quantity;
        updateProductQuantityInContext(productToRestore.id, newQuantity); // Update local context first

        try {
          await fetch(
            `http://localhost:5000/api/products/${productToRestore.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ quantity: newQuantity }), // Send the new quantity to backend
            }
          );
          console.log(
            `Backend updated for ${productToRestore.name}: new quantity ${newQuantity}`
          );
        } catch (error) {
          console.error(
            `Failed to update product ${productToRestore.id} in backend:`,
            error
          );
          addNotification({
            type: "alert",
            title: "Inventory Update Failed",
            description: `Failed to restore stock for "${productToRestore.name}": ${error.message}`,
            priority: "high",
            icon: "alert",
            link: "/inventory",
          });
        }
      }
    }
    setSelectedProducts([]);
    localStorage.removeItem("selectedProductFromInventory"); // Clear the specific localStorage key
    addNotification({
      type: "order",
      title: "Order Draft Cleared",
      description:
        "All selected products have been removed from the order draft and stock restored.",
      priority: "normal",
      icon: "shopping-cart",
      link: "/orders",
    });
    fetchInventoryData(1, 20, false); // Re-fetch inventory to ensure UI is updated
  }, [
    selectedProducts,
    inventory,
    updateProductQuantityInContext,
    fetchInventoryData,
  ]);

  const handleRemoveProductFromDraft = useCallback(
    async (productToRemove) => {
      const remaining = selectedProducts.filter(
        (p) => (p.id || p.sku) !== (productToRemove.id || productToRemove.sku)
      );
      setSelectedProducts(remaining);
      localStorage.setItem(
        "selectedProductFromInventory",
        JSON.stringify(remaining)
      ); // Update localStorage immediately

      const currentInventoryItem = inventory.find(
        (item) => item.id === productToRemove.id
      );
      if (currentInventoryItem) {
        const newQuantity =
          currentInventoryItem.quantity + productToRemove.quantity;
        updateProductQuantityInContext(productToRemove.id, newQuantity); // Update local context

        try {
          await fetch(
            `http://localhost:5000/api/products/${productToRemove.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ quantity: newQuantity }), // Send the new quantity to backend
            }
          );
          console.log(
            `Backend updated for ${productToRemove.name}: new quantity ${newQuantity}`
          );
        } catch (error) {
          console.error(
            `Failed to update product ${productToRemove.id} in backend:`,
            error
          );
          addNotification({
            type: "alert",
            title: "Inventory Update Failed",
            description: `Failed to restore stock for "${productToRemove.name}": ${error.message}`,
            priority: "high",
            icon: "alert",
            link: "/inventory",
          });
        }
      }

      addNotification({
        type: "order",
        title: "Product Removed from Order Draft",
        description: `"${productToRemove.name}" removed from order draft. Stock restored.`,
        priority: "normal",
        icon: "x-circle",
        link: "/orders",
      });
      fetchInventoryData(1, 20, false); // Re-fetch inventory to ensure UI is updated
    },
    [
      selectedProducts,
      inventory,
      updateProductQuantityInContext,
      fetchInventoryData,
    ]
  );

  const handleBuyNow = (product) => {
    addNotification({
      type: "order",
      title: "Product Sent to Blockchain",
      description: `Product "${product.name}" sent for blockchain transaction.`,
      priority: "normal",
      icon: "truck",
      link: "/blockchain",
    });
    navigate("/blockchain-transaction", { state: { product } });
  };

  const handleUpdateOrderStatus = useCallback((id, status) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const updatedOrder = {
            ...o,
            status,
            ...(status === "Delivered" && {
              deliveredDate: new Date().toISOString().split("T")[0],
            }),
            ...(status === "Cancelled" && {
              cancelledDate: new Date().toISOString().split("T")[0],
            }),
          };
          addNotification({
            type: "order",
            title: `Order ${status}`,
            description: `Order ${o.orderNumber} status changed to ${status}.`,
            priority: status === "Cancelled" ? "high" : "normal",
            icon: status === "Delivered" ? "check" : "truck",
            link: `/orders/${o.id}`,
          });
          return updatedOrder;
        }
        return o;
      })
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Order Management"
        breadcrumbs={[
          { text: "Dashboard", active: false },
          { text: "Order Management", active: true },
        ]}
      />
      <main className="p-6">
        <OrderDashboard
          orders={orders}
          customers={customers}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          onCreateOrder={handleCreateOrderFromProduct}
          onEditOrder={(o) => setEditingOrder(o)}
          onDeleteOrder={(id) => {
            setOrders((prev) => prev.filter((o) => o.id !== id));
            addNotification({
              type: "order",
              title: "Order Deleted",
              description: `Order with ID: ${id} has been deleted.`,
              priority: "medium",
              icon: "trash",
              link: "/orders",
            });
          }}
          onViewOrder={(o) => {
            setSelectedOrder(o);
            setShowOrderDetails(true);
          }}
          onBuyNow={handleBuyNow}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onClearSelected={handleClearSelected} // Pass the new handler
          onRemoveProductFromDraft={handleRemoveProductFromDraft} // Pass the new handler for individual removal
          onUpdateInventoryQuantity={updateProductQuantityInContext} // Pass the context function
        />
      </main>

      {showOrderDetails && selectedOrder && (
        <Modal
          isOpen={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          title="Order Details"
          size="xlarge"
        >
          {/* Optional: Render order details */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">
              {selectedOrder.orderNumber}
            </h3>
            <p>Customer: {selectedOrder.customer || "Guest"} </p>
            <p>Total: Rs. {selectedOrder.total}</p>
            <p>Status: {selectedOrder.status}</p>
            <p>Date: {selectedOrder.orderDate}</p>
            {/* Add more details as needed */}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderManagement;
