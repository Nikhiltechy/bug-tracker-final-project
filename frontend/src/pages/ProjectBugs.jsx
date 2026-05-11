import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProjectBugs() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [bugs, setBugs] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium' });
  const [processing, setProcessing] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      // Fetch project to get role
      const projRes = await fetch(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projData = await projRes.json();
      if (!projRes.ok) throw new Error(projData.message);

      const me = projData.members.find(m => m.user._id === user.id);
      setMyRole(me?.role || 'user');

      // Fetch bugs
      const bugRes = await fetch(`http://localhost:5000/api/projects/${id}/bugs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bugData = await bugRes.json();
      if (!bugRes.ok) throw new Error(bugData.message);
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
      const res = await fetch(`http://localhost:5000/api/projects/${id}/bugs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBugs([data, ...bugs]);
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'Medium' });
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (bugId) => {
    if (!confirm('Delete this bug?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}/bugs/${bugId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBugs(bugs.filter(b => b._id !== bugId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}/bugs/${bugId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setBugs(bugs.map(b => b._id === bugId ? { ...b, status: newStatus } : b));
    } catch (err) {
      setError(err.message);
    }
  };

  const canEdit = myRole === 'admin' || myRole === 'tester';

  if (loading) return <div style={styles.center}>Loading bugs...</div>;
  if (error) return <div style={styles.center}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to={`/projects/${id}`} style={styles.backBtn}>← Back to Project</Link>
        <h1>🐛 Bug Tracker</h1>
        <p style={styles.roleBadge}>Your Role: <strong>{myRole}</strong></p>
      </header>

      <main style={styles.main}>
        {canEdit && (
          <div style={styles.actions}>
            <button onClick={() => setShowForm(!showForm)} style={styles.createBtn}>
              {showForm ? 'Cancel' : '+ New Bug'}
            </button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} style={styles.formCard}>
            <input style={styles.input} placeholder="Bug Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <textarea style={styles.input} placeholder="Description" rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <select style={styles.input} value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            <button type="submit" style={styles.btn} disabled={processing}>{processing ? 'Creating...' : 'Create Bug'}</button>
          </form>
        )}

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Created By</th>
              {canEdit && <th style={styles.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {bugs.map(bug => (
              <tr key={bug._id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{bug.title}</strong>
                  {bug.description && <div style={{fontSize:12, color:'#64748b', marginTop:4}}>{bug.description}</div>}
                </td>
                <td style={styles.td}>
                  {canEdit ? (
                    <select style={styles.select} value={bug.status} onChange={e => handleStatusChange(bug._id, e.target.value)}>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  ) : (
                    <span style={styles.badge}>{bug.status}</span>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.priorityBadge, background: bug.priority === 'High' ? '#fee2e2' : bug.priority === 'Medium' ? '#fef3c7' : '#dcfce7' }}>
                    {bug.priority}
                  </span>
                </td>
                <td style={styles.td}>{bug.createdBy?.name || 'Unknown'}</td>
                {canEdit && (
                  <td style={styles.td}>
                    <button onClick={() => handleDelete(bug._id)} style={styles.deleteBtn}>🗑️</button>
                  </td>
                )}
              </tr>
            ))}
            {bugs.length === 0 && <tr><td colSpan="5" style={styles.center}>No bugs yet.</td></tr>}
          </tbody>
        </table>
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f8fafc' },
  header: { padding: '20px 40px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { textDecoration: 'none', color: '#3b82f6', fontWeight: 500 },
  roleBadge: { background: '#e0e7ff', padding: '4px 10px', borderRadius: 12, fontSize: 13, color: '#3730a3' },
  main: { padding: 30, maxWidth: 1000, margin: '0 auto' },
  actions: { marginBottom: 15 },
  createBtn: { padding: '10px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 },
  formCard: { background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 20 },
  input: { width: '100%', padding: 8, marginBottom: 10, borderRadius: 4, border: '1px solid #cbd5e1', boxSizing: 'border-box' },
  btn: { padding: '10px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  th: { padding: 12, textAlign: 'left', background: '#f1f5f9', fontWeight: 600, fontSize: 13 },
  td: { padding: 12, borderBottom: '1px solid #e2e8f0', fontSize: 14 },
  select: { padding: 4, borderRadius: 4, border: '1px solid #cbd5e1' },
  badge: { padding: '3px 8px', borderRadius: 12, fontSize: 12, background: '#dbeafe', color: '#1e40af' },
  priorityBadge: { padding: '3px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500 },
  deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 },
  center: { textAlign: 'center', padding: 40, color: '#64748b' }
};