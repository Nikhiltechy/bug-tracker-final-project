import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function ProjectBugs() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const [bugs, setBugs] = useState([]);
  const [myRole, setMyRole] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
  });

  const [processing, setProcessing] =
    useState(false);

  const token =
    localStorage.getItem("token");

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData =
    async () => {
      try {
        const projRes = await fetch(
          `http://localhost:5000/api/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const projData =
          await projRes.json();

        if (!projRes.ok) {
          throw new Error(
            projData.message
          );
        }

        const me =
          projData.members.find(
            (m) =>
              m.user._id === user.id
          );

        setMyRole(
          me?.role || "user"
        );

        const bugRes = await fetch(
          `http://localhost:5000/api/projects/${id}/bugs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const bugData =
          await bugRes.json();

        if (!bugRes.ok) {
          throw new Error(
            bugData.message
          );
        }

        setBugs(bugData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  const handleCreate = async (e) => {
    e.preventDefault();

    setProcessing(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/projects/${id}/bugs`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message
        );
      }

      setBugs((prev) => [
        data,
        ...prev,
      ]);

      setShowForm(false);

      setForm({
        title: "",
        description: "",
        priority: "Medium",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete =
    async (bugId) => {
      if (
        !window.confirm(
          "Delete this bug?"
        )
      )
        return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/projects/${id}/bugs/${bugId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message
          );
        }

        setBugs((prev) =>
          prev.filter(
            (b) =>
              b._id !== bugId
          )
        );
      } catch (err) {
        setError(err.message);
      }
    };

  const handleStatusChange =
    async (
      bugId,
      newStatus
    ) => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/projects/${id}/bugs/${bugId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status:
                newStatus,
            }),
          }
        );

        if (!res.ok) {
          throw new Error(
            (
              await res.json()
            ).message
          );
        }

        setBugs((prev) =>
          prev.map((b) =>
            b._id === bugId
              ? {
                  ...b,
                  status:
                    newStatus,
                }
              : b
          )
        );
      } catch (err) {
        setError(err.message);
      }
    };

  const canEdit =
    myRole === "admin" ||
    myRole === "tester";

  if (loading) {
    return (
      <div style={styles.center}>
        Loading bugs...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      <header style={styles.header}>
        <div>
          <Link
            to={`/projects/${id}`}
            style={styles.backBtn}
          >
            ← Back to Project
          </Link>

          <h1 style={styles.heading}>
            🐛 Bug Tracker
          </h1>

          <p style={styles.subText}>
            Track and manage
            project bugs
          </p>
        </div>

        <div style={styles.roleBadge}>
          {myRole}
        </div>
      </header>

      <main style={styles.main}>
        {error && (
          <div style={styles.errorCard}>
            {error}
          </div>
        )}

        {canEdit && (
          <div style={styles.actionBar}>
            <button
              onClick={() =>
                setShowForm(
                  !showForm
                )
              }
              style={
                styles.createBtn
              }
            >
              {showForm
                ? "Cancel"
                : "+ New Bug"}
            </button>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={
              handleCreate
            }
            style={
              styles.formCard
            }
          >
            <input
              style={
                styles.input
              }
              placeholder="Bug title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title:
                    e.target
                      .value,
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
              placeholder="Description"
              value={
                form.description
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target
                      .value,
                })
              }
            />

            <select
              style={
                styles.input
              }
              value={
                form.priority
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  priority:
                    e.target
                      .value,
                })
              }
            >
              <option value="Low">
                Low Priority
              </option>
              <option value="Medium">
                Medium Priority
              </option>
              <option value="High">
                High Priority
              </option>
            </select>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity:
                  processing
                    ? 0.7
                    : 1,
              }}
              disabled={
                processing
              }
            >
              {processing
                ? "Creating..."
                : "Create Bug"}
            </button>
          </form>
        )}

        <div style={styles.grid}>
          {bugs.map((bug) => (
            <div
              key={bug._id}
              style={styles.card}
            >
              <div
                style={
                  styles.cardTop
                }
              >
                <h3
                  style={
                    styles.title
                  }
                >
                  {bug.title}
                </h3>

                {canEdit && (
                  <button
                    onClick={() =>
                      handleDelete(
                        bug._id
                      )
                    }
                    style={
                      styles.deleteBtn
                    }
                  >
                    🗑️
                  </button>
                )}
              </div>

              <p
                style={
                  styles.description
                }
              >
                {bug.description ||
                  "No description"}
              </p>

              <div
                style={
                  styles.badges
                }
              >
                <span
                  style={{
                    ...styles.priority,
                    background:
                      bug.priority ===
                      "High"
                        ? "rgba(239,68,68,0.15)"
                        : bug.priority ===
                          "Medium"
                        ? "rgba(245,158,11,0.15)"
                        : "rgba(34,197,94,0.15)",
                  }}
                >
                  {bug.priority}
                </span>

                {canEdit ? (
                  <select
                    style={
                      styles.statusSelect
                    }
                    value={
                      bug.status
                    }
                    onChange={(
                      e
                    ) =>
                      handleStatusChange(
                        bug._id,
                        e.target
                          .value
                      )
                    }
                  >
                    <option value="Open">
                      Open
                    </option>
                    <option value="In Progress">
                      In Progress
                    </option>
                    <option value="Resolved">
                      Resolved
                    </option>
                  </select>
                ) : (
                  <span
                    style={
                      styles.statusBadge
                    }
                  >
                    {bug.status}
                  </span>
                )}
              </div>

              <div
                style={
                  styles.footer
                }
              >
                Created by{" "}
                <strong>
                  {bug
                    .createdBy
                    ?.name ||
                    "Unknown"}
                </strong>
              </div>
            </div>
          ))}

          {!loading &&
            bugs.length ===
              0 && (
              <div
                style={
                  styles.emptyCard
                }
              >
                <h3>
                  No Bugs Yet
                </h3>

                <p>
                  Create your
                  first bug to
                  start tracking
                  issues.
                </p>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(to bottom right,#0f172a,#111827,#020617)",
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
    padding: "28px 48px",
    borderBottom:
      "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },

  heading: {
    margin: 0,
    fontSize: "32px",
  },

  subText: {
    color: "#94a3b8",
    marginTop: 6,
  },

  backBtn: {
    color: "#60a5fa",
    textDecoration: "none",
    display: "inline-block",
    marginBottom: 12,
  },

  roleBadge: {
    background:
      "rgba(59,130,246,0.15)",
    color: "#93c5fd",
    padding: "12px 20px",
    borderRadius: "999px",
    textTransform:
      "capitalize",
  },

  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 30px",
    position: "relative",
    zIndex: 2,
  },

  actionBar: {
    marginBottom: 24,
  },

  createBtn: {
    background:
      "linear-gradient(135deg,#2563eb,#3b82f6)",
    border: "none",
    color: "white",
    padding: "14px 22px",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: 600,
  },

  formCard: {
    background:
      "rgba(15,23,42,0.75)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "28px",
    backdropFilter:
      "blur(14px)",
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

  submitBtn: {
    width: "100%",
    background:
      "linear-gradient(135deg,#2563eb,#3b82f6)",
    border: "none",
    color: "white",
    padding: "14px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: 600,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(320px,1fr))",
    gap: "24px",
  },

  card: {
    background:
      "rgba(15,23,42,0.75)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "24px",
    backdropFilter:
      "blur(14px)",
  },

  cardTop: {
    display: "flex",
    justifyContent:
      "space-between",
  },

  title: {
    margin: 0,
    fontSize: "20px",
  },

  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
  },

  description: {
    color: "#94a3b8",
    lineHeight: 1.6,
    marginTop: 14,
  },

  badges: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  priority: {
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
  },

  statusSelect: {
    background: "#1e293b",
    color: "white",
    border:
      "1px solid rgba(255,255,255,0.08)",
    padding: "10px 14px",
    borderRadius: "12px",
  },

  statusBadge: {
    background:
      "rgba(59,130,246,0.15)",
    color: "#93c5fd",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
  },

  footer: {
    marginTop: 20,
    color: "#94a3b8",
    fontSize: "14px",
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

  center: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(to bottom right,#0f172a,#111827,#020617)",
    color: "#94a3b8",
  },
};