import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load project');
      const data = await res.json();
      setProject(data);
      const me = data.members.find(m => m.user._id === user.id);
      setMyRole(me?.role || 'user');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setProject(data.project);
      setInviteEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}/members/${memberId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProject(data.project);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={styles.center}>Loading project...</div>;
  if (error) return <div style={styles.center}>Error: {error} <button onClick={fetchProject}>Retry</button></div>;
  if (!project) return <div style={styles.center}>Project not found</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/dashboard" style={styles.backBtn}>← Back to Projects</Link>
        <h1>{project.name}</h1>
        <p style={styles.desc}>{project.description || 'No description'}</p>
      </header>

      <main style={styles.main}>
        {myRole === 'admin' && (
          <section style={styles.section}>
            <h3>👥 Add Team Member</h3>
            <form onSubmit={handleInvite} style={styles.inviteForm}>
              <input style={styles.input} placeholder="User Email (must be registered)" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
              <select style={styles.input} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="tester">Tester</option>
                <option value="user">Viewer</option>
              </select>
              <button type="submit" style={styles.btn} disabled={processing}>{processing ? 'Adding...' : 'Add Member'}</button>
            </form>
            <p style={styles.note}>⚠️ User must have signed up to your app first.</p>
          </section>
        )}

        <section style={styles.section}>
          <h3>Members ({project.members.length})</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
              </tr>
            </thead>
            <tbody>
              {project.members.map(m => (
                <tr key={m.user._id}>
                  <td style={styles.td}>{m.user.name}</td>
                  <td style={styles.td}>{m.user.email}</td>
                  <td style={styles.td}>
                    {myRole === 'admin' ? (
                      <select style={styles.roleSelect} value={m.role} onChange={e => handleRoleChange(m.user._id, e.target.value)}>
                        <option value="admin">Admin</option>
                        <option value="tester">Tester</option>
                        <option value="user">Viewer</option>
                      </select>
                    ) : (
                      <span style={styles.badge}>{m.role}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

       <section style={styles.section}>
  <h3>🐛 Bugs</h3>
  <Link to={`/projects/${id}/bugs`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
    Open Bug Tracker →
  </Link>
</section>
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f8fafc' },
  header: { padding: '20px 40px', background: 'white', borderBottom: '1px solid #e2e8f0' },
  backBtn: { textDecoration: 'none', color: '#3b82f6', fontWeight: 500, display: 'block', marginBottom: 10 },
  desc: { color: '#64748b', marginTop: 5, marginBottom: 0 },
  main: { padding: 30, maxWidth: 900, margin: '0 auto' },
  section: { background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 20 },
  inviteForm: { display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
  input: { padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', flex: 1, minWidth: 180 },
  btn: { padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' },
  note: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 10 },
  th: { padding: 10, textAlign: 'left', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' },
  td: { padding: 10, borderBottom: '1px solid #e2e8f0' },
  roleSelect: { padding: 4, borderRadius: 4, border: '1px solid #cbd5e1' },
  badge: { padding: '3px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: 4, fontSize: 12, fontWeight: 500 },
  center: { textAlign: 'center', padding: 40, color: '#64748b' }
};