import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    id: null,
    username: "",
    password: "",
    role: "cashier",
  });

  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await API.get("/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      id: null,
      username: "",
      password: "",
      role: "cashier",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (form.id) {
        // UPDATE USER
        const payload = {
          username: form.username,
          role: form.role,
        };

        if (form.password) {
          payload.password = form.password;
        }

        await API.put(`/auth/users/${form.id}`, payload);
        setMessage("User updated successfully");
      } else {
        // CREATE USER
        await API.post("/auth/register", form);
        setMessage("User created successfully");
      }

      resetForm();
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (user) => {
    setForm({
      id: user.id,
      username: user.username,
      password: "",
      role: user.role,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await API.delete(`/auth/users/${id}`);
      setMessage("User deleted successfully");
      fetchUsers();
    } catch (err) {
      setMessage("Delete failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <h1>Admin User Management</h1>

        {message && <p>{message}</p>}

        <h3>{form.id ? "Update User" : "Create User"}</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password (optional for update)"
            value={form.password}
            onChange={handleChange}
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="cashier">Cashier</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit">
            {form.id ? "Update User" : "Create User"}
          </button>
        </form>

        <hr />

        <h3>All Users</h3>

        <table border="1" cellPadding="10">
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
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  {new Date(user.created_at).toLocaleString()}
                </td>
                <td>
                  <button onClick={() => handleEdit(user)}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminDashboard;