import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatWithAI } from '../services/api'; 

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAI(currentInput, messages); 
      const aiMessage = { role: 'model', text: response.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { role: 'model', text: `⚠️ Error: ${error.message}` };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div style={styles.chatContainer}>
      {/* Background glows (Matching Landing page) */}
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
           <button 
             onClick={() => navigate('/dashboard')} 
             style={styles.backButton}
             onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
             onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
           >
             ← Back
           </button>
           <h2 style={styles.title}>
             🤖 AI <span style={styles.titleHighlight}>Assistant</span>
           </h2>
        </div>
        <button 
          onClick={clearChat} 
          style={styles.newChatButton}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          New Chat
        </button>
      </div>

      {/* Messages Area */}
      <div style={styles.messagesArea}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            {/* Using the badge style from Landing page */}
            <div style={styles.emptyBadge}>🚀 AI Project Assistant</div>
            <h3 style={styles.emptyTitle}>
              Hello! I can help you manage your projects.
            </h3>
            <p style={styles.emptySubtitle}>
              Try asking me to: <br />
              <span style={styles.emptyHighlight}>"Create a new project called E-commerce App"</span> or <br />
              <span style={styles.emptyHighlight}>"Show my projects"</span>
            </p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={msg.role === 'user' ? styles.messageRowUser : styles.messageRowAI}
          >
            <div style={msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={styles.messageRowAI}>
            <div style={styles.bubbleLoading}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={styles.inputArea}>
        <div style={styles.inputContainer}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me to create, update, or view projects..."
            rows={1}
            style={styles.textarea}
            onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              ...styles.sendButton,
              ...(loading || !input.trim() ? styles.sendButtonDisabled : {})
            }}
            onMouseOver={(e) => { if (!loading && input.trim()) e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Send
          </button>
        </div>
        <p style={styles.disclaimer}>
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

// 🎨 Styles matching the Landing page design system
const styles = {
  chatContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(to bottom right, #0f172a, #111827, #020617)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#ffffff',
  },
  glow1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: '#2563eb',
    borderRadius: '50%',
    filter: 'blur(140px)',
    opacity: 0.15,
    top: '-120px',
    left: '-120px',
    zIndex: 0,
  },
  glow2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    background: '#7c3aed',
    borderRadius: '50%',
    filter: 'blur(140px)',
    opacity: 0.1,
    bottom: '-100px',
    right: '-100px',
    zIndex: 0,
  },
  header: {
    padding: '16px 24px',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backButton: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  titleHighlight: {
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  newChatButton: {
    padding: '8px 18px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#fca5a5',
    borderRadius: '10px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative',
    zIndex: 2,
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  emptyState: {
    textAlign: 'center',
    color: '#94a3b8',
    maxWidth: '600px',
    margin: '15vh auto 0',
  },
  emptyBadge: {
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
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-1px',
  },
  emptySubtitle: {
    margin: 0,
    lineHeight: '1.8',
    fontSize: '16px',
  },
  emptyHighlight: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  messageRowUser: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  messageRowAI: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  bubbleUser: {
    maxWidth: '75%',
    padding: '12px 18px',
    borderRadius: '18px 18px 4px 18px',
    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    color: '#ffffff',
    boxShadow: '0 10px 30px rgba(59,130,246,0.25)',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
    fontSize: '15px',
  },
  bubbleAI: {
    maxWidth: '75%',
    padding: '12px 18px',
    borderRadius: '18px 18px 18px 4px',
    background: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
    fontSize: '15px',
  },
  bubbleLoading: {
    maxWidth: '75%',
    padding: '12px 18px',
    borderRadius: '18px 18px 18px 4px',
    background: 'rgba(255,255,255,0.02)',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.05)',
    fontStyle: 'italic',
    fontSize: '15px',
  },
  inputArea: {
    padding: '16px 24px 24px',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    position: 'relative',
    zIndex: 2,
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
    maxWidth: '800px',
    margin: '0 auto',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    padding: '14px 18px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#ffffff',
    resize: 'none',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    maxHeight: '150px',
    overflowY: 'auto',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  sendButton: {
    padding: '0 24px',
    height: '48px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(59,130,246,0.35)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#64748b',
    marginTop: '12px',
    marginBottom: 0,
  },
};