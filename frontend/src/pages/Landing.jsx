import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={styles.hero}>
      {/* Background glow */}
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      <div style={styles.content}>
        <div style={styles.badge}>
          🚀 Modern Team Bug Tracking
        </div>

        <h1 style={styles.title}>
          Track Bugs.
          <span style={styles.highlight}> Resolve Faster.</span>
        </h1>

        <p style={styles.subtitle}>
          Collaborate with your team, assign bugs, monitor progress,
          and ship reliable software with project-scoped roles.
        </p>

        <div style={styles.buttons}>
          <Link
            to="/auth?mode=login"
            style={styles.btnSecondary}
          >
            Login
          </Link>

          <Link
            to="/auth?mode=signup"
            style={styles.btn}
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    background:
      'linear-gradient(to bottom right, #0f172a, #111827, #020617)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },

  content: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '700px',
  },

  badge: {
    display: 'inline-block',
    padding: '8px 18px',
    borderRadius: '999px',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.2)',
    color: '#93c5fd',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px',
    backdropFilter: 'blur(12px)',
  },

  title: {
    fontSize: 'clamp(48px, 8vw, 76px)',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0',
    lineHeight: '1.1',
    letterSpacing: '-2px',
  },

  highlight: {
    color: '#3b82f6',
  },

  subtitle: {
    fontSize: '18px',
    color: '#94a3b8',
    maxWidth: '620px',
    margin: '24px auto 40px',
    lineHeight: '1.8',
  },

  buttons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },

  btn: {
    padding: '14px 28px',
    background:
      'linear-gradient(135deg, #2563eb, #3b82f6)',
    color: '#fff',
    borderRadius: '14px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    boxShadow:
      '0 10px 30px rgba(59,130,246,0.35)',
    transition: 'all 0.3s ease',
  },

  btnSecondary: {
    padding: '14px 28px',
    background: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0',
    borderRadius: '14px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  },

  glow1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: '#2563eb',
    borderRadius: '50%',
    filter: 'blur(140px)',
    opacity: 0.18,
    top: '-120px',
    left: '-120px',
  },

  glow2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    background: '#7c3aed',
    borderRadius: '50%',
    filter: 'blur(140px)',
    opacity: 0.12,
    bottom: '-100px',
    right: '-100px',
  },
};