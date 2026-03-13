import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {

  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userForm, setUserForm] = useState({
    id: null,
    username: "",
    password: "",
    role: "cashier",
  });

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [productForm, setProductForm] = useState({
    id: null,
    name: "",
    price: "",
    stock: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [salesSummary, setSalesSummary] = useState({
    today: 0,
    week: 0,
  });
  const [dateFilter, setDateFilter] = useState({
    start: "",
    end: "",
  });

  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    const res = await API.get("/auth/users");
    setUsers(res.data);
  };

  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const getStockStyle = (stock) => {
    if (stock === 0) return { color: "red", fontWeight: "bold" };
    if (stock <= 5) return { color: "orange", fontWeight: "bold" };
    return { color: "green" };
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return "OUT";
    if (stock <= 5) return "LOW";
    return "OK";
  };

  const [globalSummary, setGlobalSummary] = useState({
    today: 0,
    week: 0,
    month: 0,
    topProduct: null,
    topCashier: null,
    trend: [],
    topProducts: []
  });

  const fetchGlobalSummary = async () => {
    try {
      const res = await API.get("/sales/summary");
      setGlobalSummary(res.data);
    } catch (err) {
      console.error("Summary fetch error");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProducts();
    fetchGlobalSummary();   
  }, []);

  const handleUserChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    try {
      if (userForm.id) {
        await API.put(`/auth/users/${userForm.id}`, userForm);
        setMessage("User updated successfully");
      } else {
        await API.post("/auth/register", userForm);
        setMessage("User created successfully");
      }

      setUserForm({
        id: null,
        username: "",
        password: "",
        role: "cashier",
      });

      fetchUsers();
    } catch {
      setMessage("User operation failed");
    }
  };

  const handleUserEdit = (user) => {
    setUserForm({
      id: user.id,
      username: user.username,
      password: "",
      role: user.role,
    });
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await API.delete(`/auth/users/${id}`);
    fetchUsers();
  };

  const handleViewSales = async (user) => {
    if (user.role !== "cashier") return;

    setSelectedUser(user);
    setShowModal(true);

    const res = await API.get(`/sales/user/${user.id}`);
    setSalesData(res.data.sales);
    setSalesSummary({
      today: res.data.today,
      week: res.data.week,
    });
  };

  const handleFilterSales = async () => {
    if (!selectedUser) return;

    const res = await API.get(
      `/sales/user/${selectedUser.id}?start=${dateFilter.start}&end=${dateFilter.end}`
    );

    setSalesData(res.data.sales);
    setSalesSummary({
      today: res.data.today,
      week: res.data.week,
    });
  };

  const handleProductChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      if (productForm.id) {
        await API.put(`/products/${productForm.id}`, productForm);
        setMessage("Product updated successfully");
      } else {
        await API.post("/products", productForm);
        setMessage("Product created successfully");
      }

      setProductForm({
        id: null,
        name: "",
        price: "",
        stock: "",
      });

      fetchProducts();
    } catch {
      setMessage("Product operation failed");
    }
  };

  const handleProductEdit = (product) => {
    setProductForm(product);
  };

  const handleProductDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  const handleRestock = async (id) => {
    const qty = prompt("Enter restock quantity:");
    if (!qty || qty <= 0) return;

    await API.post(`/products/${id}/restock`, {
      quantity: Number(qty),
    });

    fetchProducts();
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStock = products.filter((p) => p.stock === 0);

  return (
    <>
      <Navbar />

      <div className="dashboard">
        <h1>Admin Dashboard</h1>

        {message && <div className="message success">{message}</div>}

        <div className="dashboard-cards">

        <div className="dashboard-card">
          <h3>Total Products</h3>
          <h1>{products.length}</h1>
        </div>

        <div className="dashboard-card">
          <h3>Low Stock</h3>
          <h1>{lowStock.length}</h1>
        </div>

        <div className="dashboard-card">
          <h3>Out of Stock</h3>
          <h1>{outOfStock.length}</h1>
        </div>

        <div className="dashboard-card report-card">
          <h3>Sales Today</h3>
          <h1>₱{globalSummary.today}</h1>
        </div>

        <div className="dashboard-card report-card">
          <h3>Sales This Week</h3>
          <h1>₱{globalSummary.week}</h1>
        </div>

        <div className="dashboard-card report-card">
          <h3>Sales This Month</h3>
          <h1>₱{globalSummary.month}</h1>
        </div>

        <div className="dashboard-card report-card">
          <h3>Top Selling Product</h3>
          <h1>
            {globalSummary.topProduct
              ? globalSummary.topProduct.name
              : "No Data"}
          </h1>
        </div>

        <div className="dashboard-card report-card">
          <h3>Top Cashier</h3>
          <h1>
            {globalSummary.topCashier
              ? globalSummary.topCashier.username
              : "No Data"}
          </h1>
        </div>
      </div>

      <div className="charts-row">
          <div className="chart-box">
            <h2>Sales Overview</h2>
            <div className="chart-container">
              <Bar
                data={{
                  labels: ["Today", "This Week", "This Month"],
                  datasets: [
                    {
                      label: "Sales (₱)",
                      data: [
                        globalSummary.today,
                        globalSummary.week,
                        globalSummary.month,
                      ],
                      backgroundColor: "#4facfe",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>

          <div className="chart-box">
            <h2>Last 7 Days Trend</h2>
            <div className="chart-container">
              <Line
                data={{
                  labels: globalSummary.trend.map((t) =>
                    new Date(t.date).toLocaleDateString()
                  ),
                  datasets: [
                    {
                      label: "Daily Sales",
                      data: globalSummary.trend.map((t) => t.total),
                      borderColor: "#2a5298",
                      backgroundColor: "rgba(42,82,152,0.2)",
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>

          <div className="chart-box">
            <h2>Top 5 Products</h2>
            <div className="chart-container">
              <Bar
                data={{
                  labels: globalSummary.topProducts.map(p => p.name),
                  datasets: [
                    {
                      label: "Revenue (₱)",
                      data: globalSummary.topProducts.map(p => p.total_revenue),
                      backgroundColor: "#9b23ea",
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: "y",
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            </div>
          </div>
        </div>


        <h3>{userForm.id ? "Update User" : "Create User"}</h3>

        <form onSubmit={handleUserSubmit}>
          <input type="text" name="username" placeholder="Username"
            value={userForm.username} onChange={handleUserChange} required />
          <input type="password" name="password" placeholder="Password"
            value={userForm.password} onChange={handleUserChange} />
          <select name="role" value={userForm.role}
            onChange={handleUserChange}>
            <option value="cashier">Cashier</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">
            {userForm.id ? "Update User" : "Create User"}
          </button>
        </form>

        <input type="text" placeholder="Search user..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)} />

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>{new Date(user.created_at).toLocaleString()}</td>
              <td className="actions-cell">
              <button
                className="btn btn-edit"
                onClick={() => handleUserEdit(user)}
              >
                Edit
              </button>

              <button
                className="btn btn-delete"
                onClick={() => handleUserDelete(user.id)}
              >
                Delete
              </button>

              {user.role === "cashier" && (
                <button
                  className="btn btn-view"
                  onClick={() => handleViewSales(user)}
                >
                  View Sales
                </button>
              )}
            </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        <h3>{productForm.id ? "Update Product" : "Create Product"}</h3>

        <form onSubmit={handleProductSubmit}>
          <input type="text" name="name" placeholder="Product Name"
            value={productForm.name} onChange={handleProductChange} required />
          <input type="number" name="price" placeholder="Price"
            value={productForm.price} onChange={handleProductChange} required />
          <input type="number" name="stock" placeholder="Stock"
            value={productForm.stock} onChange={handleProductChange} required />
          <button type="submit">
            {productForm.id ? "Update Product" : "Create Product"}
          </button>
        </form>

        <input type="text" placeholder="Search product..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)} />

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>₱{p.price}</td>

                <td style={getStockStyle(p.stock)}>
                  {p.stock}
                </td>

                <td style={getStockStyle(p.stock)}>
                  {getStockStatus(p.stock)}
                </td>

                <td className="actions-cell">
                <button
                  className="btn btn-edit"
                  onClick={() => handleProductEdit(p)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-delete"
                  onClick={() => handleProductDelete(p.id)}
                >
                  Delete
                </button>

                <button
                  className="btn btn-restock"
                  onClick={() => handleRestock(p.id)}
                >
                  Restock
                </button>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Sales Report - {selectedUser?.username}</h2>

            <div className="dashboard-cards">
              <div className="dashboard-card">
                <h3>Today</h3>
                <h1>₱{salesSummary.today}</h1>
              </div>
              <div className="dashboard-card">
                <h3>This Week</h3>
                <h1>₱{salesSummary.week}</h1>
              </div>
            </div>

            <div className="filter-row">
              <input type="date"
                value={dateFilter.start}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, start: e.target.value })
                }
              />
              <input type="date"
                value={dateFilter.end}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, end: e.target.value })
                }
              />
              <button onClick={handleFilterSales}>Filter</button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Subtotal</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale, index) => (
                  <tr key={index}>
                    <td>{sale.sale_id}</td>
                    <td>{sale.product_name}</td>
                    <td>{sale.quantity}</td>
                    <td>{sale.unit}</td>
                    <td>₱{sale.subtotal}</td>
                    <td>{new Date(sale.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              style={{ marginTop: "20px", background: "#ff4d4f", color: "white" }}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;