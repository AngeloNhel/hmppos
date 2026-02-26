import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

function POSDashboard() {
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [report, setReport] = useState([]);
  const [summary, setSummary] = useState({ today: 0, week: 0 });
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  const receiptRef = useRef();

  useEffect(() => {
    fetchProducts();
    fetchReport();
    fetchSummary();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts(res.data);
    setFilteredProducts(res.data);
  };

  const fetchSummary = async () => {
    const res = await axios.get("http://localhost:5000/api/sales/summary", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSummary(res.data);
  };

  const fetchReport = async () => {
    let url = "http://localhost:5000/api/sales/report";

    if (dateFilter.start && dateFilter.end) {
      url += `?start=${dateFilter.start}&end=${dateFilter.end}`;
    }

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setReport(res.data);
  };

  // SEARCH
  useEffect(() => {
    const result = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProducts(result);
  }, [search]);

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1, subtotal: product.price }]);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const change = payment ? payment - total : 0;

  const completeSale = async () => {
    await axios.post(
      "http://localhost:5000/api/sales",
      { items: cart, total },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Sale Completed!");
    setCart([]);
    setPayment("");
    fetchProducts();
    fetchReport();
    fetchSummary();
  };

  const printReceipt = () => {
    const printContent = receiptRef.current.innerHTML;
    const win = window.open("", "", "width=600,height=600");
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  // CHART DATA
  const chartData = {
    labels: report.map((r) => r.name),
    datasets: [
      {
        label: "Sales",
        data: report.map((r) => r.subtotal),
        backgroundColor: "#2a5298",
      },
    ],
  };

  return (
  <>
    <Navbar />
    <div className="pos-container">

      {/* TOP DASHBOARD CARDS */}
      <div className="dashboard-cards">

        {/* ITEMS SOLD */}
        <div className="dashboard-card">
          <h3>ITEMS SOLD</h3>
          <h1>{summary.items}</h1>
        </div>

        {/* SALES */}
        <div className="dashboard-card">
          <h3>SALES TODAY</h3>
          <h1>₱{summary.today}</h1>
        </div>

        {/* GENERATE REPORT */}
        <div className="dashboard-card report-card">
          <h3>GENERATE REPORT</h3>

          <div className="report-controls">
            <input
              type="date"
              onChange={(e) =>
                setDateFilter({ ...dateFilter, start: e.target.value })
              }
            />
            <input
              type="date"
              onChange={(e) =>
                setDateFilter({ ...dateFilter, end: e.target.value })
              }
            />
            <button onClick={fetchReport}>Generate</button>
          </div>
        </div>

      </div>

      {/* REPORT TABLE */}
        <div className="report-section">
          <h3>ITEMS SOLD</h3>

          <table className="pos-table">
            <thead>
              <tr>
                <th>TRANS #</th>
                <th>CODE</th>
                <th>DESCRIPTION</th>
                <th>UNIT</th>
                <th>QUANTITY</th>
                <th>PRICE</th>
                <th>TOTAL</th>
                <th>TIME</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r, i) => (
                <tr key={i}>
                  <td>{r.trans_no}</td>
                  <td>{r.code}</td>
                  <td>{r.description}</td>
                  <td>{r.unit}</td>
                  <td>{r.quantity}</td>
                  <td>₱{r.price}</td>
                  <td>₱{r.total}</td>
                  <td>{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

    </div>
  </>
);
}

export default POSDashboard;