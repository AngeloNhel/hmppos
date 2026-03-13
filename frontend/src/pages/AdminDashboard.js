import Navbar from "../components/Navbar";
import React, { useState, useEffect } from "react";

function AdminDashboard() {

  const [view, setView] = useState("items");
  const [orNumber, setOrNumber] = useState("");
  const [description, setDescription] = useState("");
  const [customer, setCustomer] = useState("");

  useEffect(() => {
    const randomOR = "OR-" + Math.floor(100000 + Math.random() * 900000);
    setOrNumber(randomOR);
  }, []);

  const items = [
    { id: 1, name: "Coke", price: 20 },
    { id: 2, name: "Pepsi", price: 18 },
    { id: 3, name: "Sprite", price: 19 }
  ];

  const cart = [
    { id: 1, name: "Coke", price: 20, qty: 1 },
    { id: 2, name: "Sprite", price: 19, qty: 2 }
  ];

  const customers = ["Walk-in", "Juan Dela Cruz", "Maria Santos", "Pedro Reyes"];

  const title = view === "items" ? "Displayed Items" : "Customers Cart";

  return (
    <>
      <Navbar />

      <div className="pos-container">

        <div className="table-card">

          <div className="table-header">

            <h3>{title}</h3>

            <div className="pos-info">

              <div className="pos-field">
                <label>OR #: </label>
                <span>{orNumber}</span>
              </div>

              <div className="pos-field">
                <label>Item Description</label>
                <input
                  type="text"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="pos-field">
                <label>Customer</label>
                <select
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                >
                  <option value="">Select Customer</option>
                  {customers.map((c, index) => (
                    <option key={index} value={c}>{c}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="pos-buttons">
              <button onClick={() => setView("items")}>Items</button>
              <button onClick={() => setView("cart")}>Cart</button>
            </div>

          </div>

          {view === "items" && (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Code</th>
                  <th>Price</th>
                  <th>Qty</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>₱{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {view === "cart" && (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>₱{item.price}</td>
                    <td>{item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

        {/* ROW CONTAINER */}
        <div className="bottom-row">

        <div className="checkout-card">
            <h3>Checkout</h3>
              <div className="pos-field">
                <label>Barcode: </label>
                <input type="text" placeholder="Scan or enter barcode" />
              </div>
              <div className="pos-field">
                <label>Subtotal: </label>
                <input type="text" placeholder="₱0.00" />  
              </div>  
              <div className="pos-field">
                <label>Discount: </label>
                <input type="text" placeholder="₱0.00" />
              </div>
              <div className="pos-field">
                <label>Total Amount: </label>
                <input type="text" placeholder="₱0.00" />
              </div>
              <div className="pos-field">
                <label>Tendered Amount: </label>
                <input type="text" placeholder="₱0.00" />
              </div>
              <div className="pos-field">
                <label>Change: </label>
                <input type="text" placeholder="₱0.00" />
              </div>
              <div className="pos-buttons"> 
                <button>Print</button>
              </div>
          </div>

          <div className="functions-card">
            <h3>Functions</h3>
          </div>

          <div className="logo-card">
            <img 
              src="https://scontent.fceb3-1.fna.fbcdn.net/v/t39.30808-6/437875199_122098649174283364_1014770551408359189_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeEF3j-UJ-ZMUWce3217UrzW7V_aw40f-eHtX9rDjR_54ZNQ3OE4Ho1Dx8KUy0j_fL5Ugdl2pENQrqt_cdgrYHWv&_nc_ohc=7sDi_JE8KZ0Q7kNvwEwFPgo&_nc_oc=AdmyAdi8oSH3eOo5_jc9aNuBVgAeilJcNCwwOW8yJ3bUfXU28AnjVeEMhSaEWGccPfM&_nc_zt=23&_nc_ht=scontent.fceb3-1.fna&_nc_gid=Xn7bmUfJVJ4ICjL9kSxt7w&_nc_ss=8&oh=00_AfwCPFk43ZZgXCk7V7-wma5sXxFW2INKFYN9Gqtzh8eU5g&oe=69B7E9B5"
              alt="Company Logo"
              className="logo-image"
            />
          </div>

        </div>

      </div>
    </>
  );
}

export default AdminDashboard;