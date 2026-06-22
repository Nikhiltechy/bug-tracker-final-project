import { useState, useEffect } from "react";
import {
  useParams,
  Link,
} from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const [project, setProject] =
    useState(null);

  const [myRole, setMyRole] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [inviteEmail, setInviteEmail] =
    useState("");

  const [inviteRole, setInviteRole] =
    useState("user");

  const [processing, setProcessing] =
    useState(false);

  const token =
    localStorage.getItem("token");

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/projects/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load project"
        );
      }

      const data = await res.json();

      setProject(data);

      const me =
        data.members.find(
          (m) =>
            m.user._id === user.id
        );

      setMyRole(
        me?.role || "user"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();

    setProcessing(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:5000/api/projects/${id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: inviteEmail,
            role: inviteRole,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message
        );
      }

      setProject(data.project);
      setInviteEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRoleChange =
    async (
      memberId,
      newRole
    ) => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/projects/${id}/members/${memberId}/role`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              role: newRole,
            }),
          }
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message
          );
        }

        setProject(data.project);
      } catch (err) {
        setError(err.message);
      }
    };

  if (loading) {
    return (
      <div style={styles.center}>
        Loading project...
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        Error: {error}

        <button
          onClick={fetchProject}
          style={styles.retryBtn}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={styles.center}>
        Project not found
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
            to="/dashboard"
            style={styles.backBtn}
          >
            ← Back to Projects
          </Link>

          <h1 style={styles.heading}>
            {project.name}
          </h1>

          <p style={styles.desc}>
            {project.description ||
              "No description"}
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

        {myRole === "admin" && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>
              👥 Add Team Member
            </h3>

            <form
              onSubmit={
                handleInvite
              }
              style={
                styles.inviteForm
              }
            >
              <input
                style={
                  styles.input
                }
                placeholder="User Email"
                value={
                  inviteEmail
                }
                onChange={(e) =>
                  setInviteEmail(
                    e.target.value
                  )
                }
                required
              />

              <select
                style={
                  styles.input
                }
                value={
                  inviteRole
                }
                onChange={(e) =>
                  setInviteRole(
                    e.target.value
                  )
                }
              >
                <option value="admin">
                  Admin
                </option>

                <option value="tester">
                  Tester
                </option>

                <option value="user">
                  Viewer
                </option>
              </select>

              <button
                type="submit"
                style={{
                  ...styles.btn,
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
                  ? "Adding..."
                  : "Add Member"}
              </button>
            </form>

            <p style={styles.note}>
              ⚠️ User must
              register first
            </p>
          </section>
        )}

        <section style={styles.section}>
          <div
            style={
              styles.sectionHeader
            }
          >
            <h3
              style={
                styles.sectionTitle
              }
            >
              Members (
              {
                project.members
                  .length
              }
              )
            </h3>
          </div>

          <div
            style={
              styles.membersList
            }
          >
            {project.members.map(
              (m) => (
                <div
                  key={
                    m.user._id
                  }
                  style={
                    styles.memberCard
                  }
                >
                  <div>
                    <h4
                      style={
                        styles.memberName
                      }
                    >
                      {
                        m.user
                          .name
                      }
                    </h4>

                    <p
                      style={
                        styles.memberEmail
                      }
                    >
                      {
                        m.user
                          .email
                      }
                    </p>
                  </div>

                  {myRole ===
                  "admin" ? (
                    <select
                      style={
                        styles.roleSelect
                      }
                      value={
                        m.role
                      }
                      onChange={(
                        e
                      ) =>
                        handleRoleChange(
                          m.user
                            ._id,
                          e.target
                            .value
                        )
                      }
                    >
                      <option value="admin">
                        Admin
                      </option>

                      <option value="tester">
                        Tester
                      </option>

                      <option value="user">
                        Viewer
                      </option>
                    </select>
                  ) : (
                    <span
                      style={
                        styles.badge
                      }
                    >
                      {m.role}
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>
            🐛 Bug Tracker
          </h3>

          <Link
            to={`/projects/${id}/bugs`}
            style={styles.bugBtn}
          >
            Open Bug Tracker →
          </Link>
        </section>
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
    padding: "30px 48px",
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

  desc: {
    color: "#94a3b8",
    marginTop: 8,
  },

  backBtn: {
    color: "#60a5fa",
    textDecoration: "none",
    marginBottom: 12,
    display: "inline-block",
    fontWeight: 500,
  },

  roleBadge: {
    background:
      "rgba(59,130,246,0.15)",
    color: "#93c5fd",
    padding: "12px 20px",
    borderRadius: "999px",
    fontWeight: 600,
    textTransform:
      "capitalize",
  },

  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 30px",
    position: "relative",
    zIndex: 2,
  },

  section: {
    background:
      "rgba(15,23,42,0.7)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "28px",
    marginBottom: "24px",
    backdropFilter:
      "blur(14px)",
  },

  sectionTitle: {
    marginTop: 0,
    fontSize: "22px",
  },

  inviteForm: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  input: {
    flex: 1,
    minWidth: "220px",
    padding: "16px",
    borderRadius: "14px",
    border:
      "1px solid rgba(255,255,255,0.08)",
    background:
      "rgba(255,255,255,0.04)",
    color: "white",
  },

  btn: {
    background:
      "linear-gradient(135deg,#2563eb,#3b82f6)",
    border: "none",
    color: "white",
    padding: "16px 22px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: 600,
  },

  note: {
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "14px",
  },

  membersList: {
    display: "grid",
    gap: "16px",
  },

  memberCard: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    padding: "20px",
    borderRadius: "18px",
    background:
      "rgba(255,255,255,0.03)",
    border:
      "1px solid rgba(255,255,255,0.06)",
  },

  memberName: {
    margin: 0,
  },

  memberEmail: {
    color: "#94a3b8",
    marginTop: 5,
    marginBottom: 0,
  },

  roleSelect: {
    padding: "10px 14px",
    borderRadius: "12px",
    background: "#1e293b",
    color: "white",
    border:
      "1px solid rgba(255,255,255,0.08)",
  },

  badge: {
    background:
      "rgba(59,130,246,0.15)",
    color: "#93c5fd",
    padding: "8px 14px",
    borderRadius: "999px",
    textTransform:
      "capitalize",
  },

  bugBtn: {
    display: "inline-block",
    marginTop: "12px",
    background:
      "linear-gradient(135deg,#2563eb,#3b82f6)",
    padding: "14px 22px",
    borderRadius: "16px",
    color: "white",
    textDecoration: "none",
    fontWeight: 600,
  },

  errorCard: {
    background:
      "rgba(239,68,68,0.12)",
    color: "#fca5a5",
    padding: "14px",
    borderRadius: "14px",
    marginBottom: "20px",
  },

  retryBtn: {
    marginLeft: 10,
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#94a3b8",
    background:
      "linear-gradient(to bottom right,#0f172a,#111827,#020617)",
  },
};