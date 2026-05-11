import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={styles.hero}>
      <h1 style={styles.title}>🐞 Bug Tracker</h1>
      <p style={styles.subtitle}>Track, assign, and resolve bugs with your team. Project-scoped roles, real-time updates.</p>
      <div style={styles.buttons}>
        <Link to="/auth?mode=login" style={styles.btn}>Login</Link>
        <Link to="/auth?mode=signup" style={styles.btnSecondary}>Get Started Free</Link>
      </div>
    </div>
  );
}

const styles = {
  hero: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: '#f8fafc', padding: 20 },
  title: { fontSize: 48, margin: '0 0 10px' },
  subtitle: { fontSize: 18, color: '#64748b', maxWidth: 500, marginBottom: 30 },
  buttons: { display: 'flex', gap: 15 },
  btn: { padding: '12px 24px', background: '#3b82f6', color: 'white', borderRadius: 6, textDecoration: 'none', fontWeight: 500 },
  btnSecondary: { padding: '12px 24px', background: 'white', color: '#3b82f6', borderRadius: 6, textDecoration: 'none', fontWeight: 500, border: '1px solid #cbd5e1' }
};