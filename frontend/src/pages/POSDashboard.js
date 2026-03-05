import React, { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function POSDashboard() {

  const receiptRef = useRef();

const printReceipt = () => {
  const receiptContent = receiptRef.current.innerHTML;

  const printWindow = window.open("", "", "width=900,height=700");

  printWindow.document.write(`
    <html>
      <head>
        <title>Official Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
          }

          .receipt-container {
            width: 100%;
          }

          h2 {
            text-align: center;
            margin-bottom: 5px;
          }

          .receipt-header {
            text-align: center;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th {
            border-bottom: 2px solid black;
            text-align: left;
            padding: 10px;
            font-size: 14px;
          }

          td {
            padding: 10px;
            font-size: 14px;
          }

          .totals {
            margin-top: 20px;
            width: 100%;
          }

          .totals td {
            padding: 8px;
          }

          .right {
            text-align: right;
          }

          hr {
            margin: 20px 0;
          }

          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${receiptContent}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();

  setCart([]);
  setPayment("");
  fetchProducts();
  fetchSummary();
  fetchReport();
};

const printReport = () => {
  const reportRows = report
    .map(
      (r) => `
        <tr>
          <td>${r.trans_no}</td>
          <td>${r.product_name}</td>
          <td>${r.quantity}</td>
          <td>₱${Number(r.price).toFixed(2)}</td>
          <td>₱${Number(r.total).toFixed(2)}</td>
          <td>${new Date(r.datetime).toLocaleString()}</td>
        </tr>
      `
    )
    .join("");

  const totalSales = report.reduce(
    (sum, r) => sum + Number(r.total),
    0
  );

  const printWindow = window.open("", "", "width=1000,height=800");

  printWindow.document.write(`
    <html>
      <head>
        <title>Sales Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
          }

          h1 {
            text-align: center;
            margin-bottom: 5px;
          }

          .header-info {
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid #000;
            padding: 8px;
            font-size: 13px;
            text-align: left;
          }

          th {
            background-color: #f2f2f2;
          }

          .right {
            text-align: right;
          }

          .footer {
            margin-top: 20px;
            font-weight: bold;
          }

          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>

        <h1>SALES REPORT</h1>

        <div class="header-info">
          <p><strong>Store:</strong> MY STORE NAME</p>
          <p><strong>Printed By:</strong> ${cashierName}</p>
          <p><strong>Date Printed:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Filter Range:</strong> 
            ${startDate || "Beginning"} 
            to 
            ${endDate || "Present"}
          </p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Trans #</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            ${reportRows}
          </tbody>
        </table>

        <div class="footer">
          Total Sales: ₱${totalSales.toFixed(2)}
        </div>

      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

  const token = localStorage.getItem("token");

  const [cashierName, setCashierName] = useState("");
  const [report, setReport] = useState([]);
  const [summary, setSummary] = useState({
    today: 0,
    week: 0,
    month: 0,
  });

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

   const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
  
 const fetchReport = useCallback(async () => {
  try {
    let url = "/sales/report";

    if (startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`;
    }

    const res = await API.get(url);
    setReport(res.data);
  } catch (err) {
    console.log(err);
  }
}, [startDate, endDate]);

  useEffect(() => {
  if (!token) return;

  const base64Payload = token.split(".")[1];
  const payload = JSON.parse(atob(base64Payload));
  setCashierName(payload.username);

  fetchSummary();
  fetchProducts();
  fetchReport();

  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, [fetchReport, token]);




  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  const fetchSummary = async () => {
    const res = await API.get("/sales/summary");
    setSummary({
      today: res.data.today || 0,
      week: res.data.week || 0,
      month: res.data.month || 0,
    });
  };



 const addToCart = (product) => {
  const existing = cart.find((item) => item.id === product.id);

  const price = Number(product.price);
  const stock = Number(product.stock);

  if (stock <= 0) {
    return alert("Product is out of stock");
  }

  if (existing) {
    if (existing.quantity >= stock) {
      return alert("Cannot add more than available stock");
    }

    setCart(
      cart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * Number(item.price), 
            }
          : item
      )
    );
  } else {
    setCart([
      ...cart,
      {
        id: product.id,
        name: product.name,
        price: price, 
        quantity: 1,
        subtotal: price, 
      },
    ]);
  }
};
  const subtotal = cart.reduce(
  (acc, item) => acc + Number(item.subtotal),
  0
);

  const handleCheckout = async () => {
      if (cart.length === 0) return alert("Cart is empty");
      if (payment < subtotal) return alert("Insufficient payment");

      try {
        await API.post("/sales", {
          items: cart,
          total: subtotal,
        });

        alert("Sale Completed Successfully!");

        setTimeout(() => {
          printReceipt();
        }, 300);

      } catch (err) {
        alert(err.response?.data?.message || "Checkout error");
      }
    };


  const groupedSales = report.reduce((acc, item) => {
  const date = new Date(item.datetime).toLocaleDateString();

  if (!acc[date]) {
    acc[date] = 0;
  }

  acc[date] += Number(item.total);
  return acc;
}, {});

const sortedDates = Object.keys(groupedSales).sort(
  (a, b) => new Date(a) - new Date(b)
);

const chartData = {
  labels: sortedDates,
  datasets: [
    {
      label: "Sales Trend",
      data: sortedDates.map((date) => groupedSales[date]),
      borderColor: "#4e73df",
      backgroundColor: "rgba(78, 115, 223, 0.2)",
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: "#4e73df",
    },
  ],
};

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#fff",
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#fff",
      },
      grid: {
        display: false,
      },
    },
    y: {
      ticks: {
        color: "#fff",
      },
      grid: {
        color: "rgba(255,255,255,0.1)",
      },
    },
  },
};

  return (
    <>
      <Navbar />

      <div className="pos-container">
        {/* TOP */}
        <div className="pos-top">
          <h2>Welcome, {cashierName}</h2>
          <h3>{currentTime.toLocaleTimeString()}</h3>
          <h3>Sales Today: ₱{summary.today}</h3>
        </div>

        {/* MAIN POS */}
        <div className="pos-main">
          {/* LEFT PRODUCTS */}
          <div className="pos-left">
            <h3>Product List</h3>

            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="product-list">
             {products
                .filter((p) =>
                  p.name.toLowerCase().includes(search.toLowerCase())
                )
               .map((product) => {
                  const stock = Number(product.stock);
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock <= 5;

                  return (
                    <div
                      key={product.id}
                      className={`product-card ${
                        isOutOfStock
                          ? "out-of-stock"
                          : isLowStock
                          ? "low-stock"
                          : ""
                      }`}
                      onClick={() => {
                        if (!isOutOfStock) {
                          addToCart(product);
                        }
                      }}
                    >
                      <h4>{product.name}</h4>
                      <p>₱{Number(product.price).toFixed(2)}</p>
                      <small>
                        Stock: {stock}{" "}
                        {isOutOfStock && <strong>(OUT OF STOCK)</strong>}
                        {isLowStock && <strong>(LOW STOCK)</strong>}
                      </small>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* RIGHT CART */}
         <div className="pos-right">
            <h3>Cart</h3>

            <table className="cart-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Total</th>
                   <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₱{Number(item.subtotal).toFixed(2)}</td>
                     <td>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="cart-summary">
              <h4>Subtotal: ₱{Number(subtotal).toFixed(2)}</h4>

              <input
                type="number"
                placeholder="Payment"
                value={payment}
                onChange={(e) => setPayment(Number(e.target.value))}
              />

              <h4>
                Change: ₱
                {payment && payment >= subtotal
                  ? (payment - subtotal).toFixed(2)
                  : "0.00"}
              </h4>

              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                CHECKOUT
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card summary-combined">
            <h3>SALES SUMMARY</h3>

            <div className="summary-row">
              <div>
                <p>This Week</p>
                <h2>₱{summary.week}</h2>
              </div>

              <div>
                <p>This Month</p>
                <h2>₱{summary.month}</h2>
              </div>
            </div>
          </div>

          <div className="dashboard-card chart-card">
            <h3>SALES CHART</h3>
            <div className="chart-wrapper">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="report-section">
        <h3>ITEMS SOLD</h3>

          <div className="report-filter">
            <div className="filter-left">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="filter-right">
              <button onClick={fetchReport}>FILTER</button>

              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  fetchReport();
                }}
              >
                RESET
              </button>

             <button className="print-btn" onClick={printReport}>
              PRINT REPORT
            </button>
            </div>
          </div>
          <div id="print-area">
          <table className="pos-table">
           <thead>
            <tr>
              <th>TRANS #</th>
              <th>CODE</th>
              <th>PRODUCT NAME</th>
              <th>DESCRIPTION</th>
              <th>UNIT</th>
              <th>QUANTITY</th>
              <th>PRICE</th>
              <th>TOTAL</th>
              <th>DATE & TIME</th>
            </tr>
          </thead>
           <tbody>
            {report.map((r, i) => (
              <tr key={i}>
                <td>{r.trans_no}</td>
                <td>{r.code}</td>
                <td>{r.product_name}</td>
                <td>{r.description}</td>
                <td>{r.unit}</td>
                <td>{r.quantity}</td>
                <td>₱{r.price}</td>
                <td>₱{r.total}</td>
                <td>
                  {new Date(r.datetime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
          </div>
        </div>
      </div>

      <div style={{ visibility: "hidden", height: 0 }}>
        <div ref={receiptRef}>
          <div style={{ textAlign: "center" }}>
            <h2>MY STORE NAME</h2>
            <p>Official Receipt</p>
            <p>Date: {new Date().toLocaleString()}</p>
            <p>Cashier: {cashierName}</p>
            <hr />
          </div>

          <table style={{ width: "100%", fontSize: "12px" }}>
            <thead>
              <tr>
                <th align="left">Item</th>
                <th align="center">Qty</th>
                <th align="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td align="center">{item.quantity}</td>
                  <td align="right">
                    ₱{Number(item.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr />

          <p>Subtotal: ₱{subtotal.toFixed(2)}</p>
          <p>Payment: ₱{Number(payment).toFixed(2)}</p>
          <p>Change: ₱{(payment - subtotal).toFixed(2)}</p>

          <hr />
          <p style={{ textAlign: "center" }}>
            Thank you for your purchase!
          </p>
        </div>
      </div>
    </>

    
  );
}

export default POSDashboard;