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
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);

  // Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5000/api/projects",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load projects");
        }

        setProjects(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Create Project
  const handleCreate = async (e) => {
    e.preventDefault();

    setCreating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create project");
      }

      const data = await res.json();

      setProjects([data.project, ...projects]);

      setShowForm(false);

      setForm({
        name: "",
        description: "",
      });
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
      {/* Background Glow */}
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>
            📂 My Projects
          </h1>

          <p style={styles.subHeading}>
            Manage your projects and track bugs efficiently
          </p>
        </div>

        <div style={styles.userSection}>
          <div style={styles.userBadge}>
            {user?.email}
          </div>

          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Action Bar */}
        <div style={styles.actionBar}>
          <div>
            <h2 style={styles.sectionTitle}>
              Projects
            </h2>

            <p style={styles.sectionSubtitle}>
              Your active workspaces
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            style={styles.createBtn}
          >
            + New Project
          </button>
        </div>

        {loading && (
          <p style={styles.center}>
            Loading projects...
          </p>
        )}

        {error && (
          <div style={styles.errorCard}>
            {error}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div style={styles.overlay}>
            <form
              onSubmit={handleCreate}
              style={styles.modal}
            >
              <h3 style={styles.modalTitle}>
                Create New Project
              </h3>

              <p style={styles.modalSubtitle}>
                Create a workspace for your team
              </p>

              <input
                style={styles.input}
                placeholder="Project Name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                required
              />

              <textarea
                rows="4"
                style={{
                  ...styles.input,
                  resize: "none",
                }}
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />

              <div style={styles.modalActions}>
                <button
                  type="submit"
                  style={styles.submitBtn}
                  disabled={creating}
                >
                  {creating
                    ? "Creating..."
                    : "Create Project"}
                </button>

                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Project Grid */}
        <div style={styles.grid}>
          {projects.map((p) => (
            <div
              key={p._id}
              style={styles.card}
              onClick={() =>
                navigate(`/projects/${p._id}`)
              }
            >
              <div style={styles.cardTop}>
                <h3 style={styles.projectTitle}>
                  {p.name}
                </h3>

                <span style={styles.badge}>
                  Admin
                </span>
              </div>

              <p style={styles.desc}>
                {p.description ||
                  "No description provided"}
              </p>

              <div style={styles.cardFooter}>
                Open Project →
              </div>
            </div>
          ))}

          {!loading &&
            projects.length === 0 && (
              <div style={styles.emptyCard}>
                <h3>No Projects Yet</h3>

                <p>
                  Create your first project
                  to start tracking bugs.
                </p>
              </div>
            )}
        </div>
      </main>

      <button onClick={() => navigate('/chat')} style={styles.createBtn}>
  🤖 Open AI Assistant
</button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(to bottom right, #0f172a, #111827, #020617)",
    color: "white",
    position: "relative",
    overflow: "hidden",
  },

  glow1: {
    position: "absolute",
    width: "350px",
    height: "350px",
    background: "#2563eb",
    filter: "blur(140px)",
    opacity: 0.15,
    borderRadius: "50%",
    top: "-100px",
    left: "-100px",
  },

  glow2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "#7c3aed",
    filter: "blur(140px)",
    opacity: 0.1,
    borderRadius: "50%",
    right: "-100px",
    bottom: "-100px",
  },

  header: {
    position: "relative",
    zIndex: 2,
    padding: "28px 48px",
    borderBottom:
      "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backdropFilter: "blur(12px)",
  },

  heading: {
    fontSize: "32px",
    margin: 0,
  },

  subHeading: {
    color: "#94a3b8",
    marginTop: 6,
    fontSize: "15px",
  },

  userSection: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },

  userBadge: {
    background:
      "rgba(255,255,255,0.05)",
    padding: "12px 18px",
    borderRadius: "14px",
    color: "#cbd5e1",
    border:
      "1px solid rgba(255,255,255,0.08)",
  },

  logoutBtn: {
    background:
      "rgba(239,68,68,0.18)",
    border:
      "1px solid rgba(239,68,68,0.2)",
    color: "#fca5a5",
    padding: "12px 18px",
    borderRadius: "14px",
    cursor: "pointer",
  },

  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 30px",
    position: "relative",
    zIndex: 2,
  },

  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px",
  },

  sectionTitle: {
    fontSize: "28px",
    margin: 0,
  },

  sectionSubtitle: {
    color: "#94a3b8",
    marginTop: 6,
  },

  createBtn: {
    background:
      "linear-gradient(135deg,#2563eb,#3b82f6)",
    border: "none",
    color: "white",
    padding: "14px 24px",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: 600,
    boxShadow:
      "0 10px 30px rgba(59,130,246,0.3)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },

  card: {
    background:
      "rgba(15,23,42,0.75)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "24px",
    cursor: "pointer",
    transition: "0.25s",
    backdropFilter: "blur(14px)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  projectTitle: {
    margin: 0,
    fontSize: "20px",
  },

  badge: {
    background:
      "rgba(59,130,246,0.15)",
    color: "#93c5fd",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
  },

  desc: {
    color: "#94a3b8",
    marginTop: "14px",
    lineHeight: 1.6,
  },

  cardFooter: {
    marginTop: "20px",
    color: "#60a5fa",
    fontWeight: 600,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  modal: {
    width: "100%",
    maxWidth: "450px",
    background:
      "rgba(15,23,42,0.95)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "32px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "26px",
  },

  modalSubtitle: {
    color: "#94a3b8",
    marginBottom: "22px",
  },

  input: {
    width: "100%",
    padding: "16px",
    marginBottom: "14px",
    borderRadius: "14px",
    border:
      "1px solid rgba(255,255,255,0.08)",
    background:
      "rgba(255,255,255,0.04)",
    color: "white",
    boxSizing: "border-box",
  },

  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "12px",
  },

  submitBtn: {
    flex: 1,
    background:
      "linear-gradient(135deg,#2563eb,#3b82f6)",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "14px",
    cursor: "pointer",
  },

  cancelBtn: {
    flex: 1,
    background:
      "rgba(255,255,255,0.08)",
    color: "#cbd5e1",
    border: "none",
    padding: "14px",
    borderRadius: "14px",
    cursor: "pointer",
  },

  center: {
    textAlign: "center",
    color: "#94a3b8",
  },

  errorCard: {
    background:
      "rgba(239,68,68,0.12)",
    color: "#fca5a5",
    padding: "14px",
    borderRadius: "14px",
    marginBottom: "20px",
  },

  emptyCard: {
    padding: "40px",
    borderRadius: "24px",
    textAlign: "center",
    background:
      "rgba(255,255,255,0.03)",
    border:
      "1px dashed rgba(255,255,255,0.1)",
  },
};