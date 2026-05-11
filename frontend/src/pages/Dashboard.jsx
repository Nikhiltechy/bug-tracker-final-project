import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  // 🔍 Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/projects", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load projects");
        setProjects(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // ➕ Create Project
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to create project");
      const data = await res.json();
      setProjects([data.project, ...projects]);
      setShowForm(false);
      setForm({ name: "", description: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth?mode=login");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>📂 My Projects</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#64748b", fontSize: 14 }}>{user?.email}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.actions}>
          <button onClick={() => setShowForm(true)} style={styles.createBtn}>+ New Project</button>
        </div>

        {loading && <p style={styles.center}>Loading projects...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {/* 📝 Create Form Modal */}
        {showForm && (
          <form onSubmit={handleCreate} style={styles.formCard}>
            <h3>Create Project</h3>
            <input style={styles.input} placeholder="Project Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <textarea style={styles.input} placeholder="Description (optional)" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button type="submit" style={styles.submitBtn} disabled={creating}>{creating ? "Creating..." : "Create"}</button>
              <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {/* 📊 Project Grid */}
        <div style={styles.grid}>
          {projects.map(p => (
            <div key={p._id} style={styles.card} onClick={() => navigate(`/projects/${p._id}`)}>
              <h3>{p.name}</h3>
              <p style={styles.desc}>{p.description || "No description"}</p>
              <span style={styles.badge}>Role: Admin</span>
            </div>
          ))}
          {!loading && projects.length === 0 && <p style={styles.center}>No projects yet. Create your first one!</p>}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8fafc" },
  header: { padding: "20px 40px", background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logoutBtn: { padding: "6px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: 4, cursor: "pointer" },
  main: { padding: 30, maxWidth: 1100, margin: "0 auto" },
  actions: { marginBottom: 20 },
  createBtn: { padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500 },
  error: { color: "#ef4444", textAlign: "center", padding: 10 },
  center: { textAlign: "center", color: "#64748b", padding: 20 },
  formCard: { background: "white", padding: 20, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: 20 },
  input: { width: "100%", padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #cbd5e1", boxSizing: "border-box" },
  submitBtn: { padding: "10px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 4, cursor: "pointer" },
  cancelBtn: { padding: "10px 16px", background: "#e2e8f0", border: "none", borderRadius: 4, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 },
  card: { background: "white", padding: 20, borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.08)", cursor: "pointer", transition: "transform 0.2s" },
  desc: { color: "#64748b", fontSize: 14, marginTop: 5 },
  badge: { display: "inline-block", marginTop: 10, padding: "3px 8px", background: "#dbeafe", color: "#1e40af", borderRadius: 4, fontSize: 12, fontWeight: 500 }
};