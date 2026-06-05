import { useState, useEffect } from 'react'
import './App.css'

// ── Change this value to demo the CI/CD pipeline ──────────────────────────
const APP_VERSION = '1.0.0'
const THEME_COLOR = '#4f46e5'   // Change for the live demo!
// ──────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function App() {
  const [status, setStatus] = useState(null)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch API status on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/status`)
      .then(r => r.json())
      .then(data => setStatus(data))
      .catch(() => setError('Cannot reach backend API'))
      .finally(() => setLoading(false))
  }, [])

  // Fetch tasks
  const loadTasks = () => {
    fetch(`${API_BASE}/api/tasks`)
      .then(r => r.json())
      .then(setTasks)
      .catch(() => setError('Failed to load tasks'))
  }

  useEffect(() => { loadTasks() }, [])

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask }),
    })
    setNewTask('')
    loadTasks()
  }

  const handleDelete = async (id) => {
    await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' })
    loadTasks()
  }

  return (
    <div className="app" style={{ '--accent': THEME_COLOR }}>
      {/* Header */}
      <header className="header" style={{ background: THEME_COLOR }}>
        <h1>🚀 Polyglot Cloud Migration</h1>
        <span className="version">v{APP_VERSION}</span>
      </header>

      <main className="main">
        {/* Status card */}
        <section className="card">
          <h2>Backend Status</h2>
          {loading && <p className="muted">Connecting…</p>}
          {error && <p className="error">{error}</p>}
          {status && (
            <div className="status-grid">
              <div><span className="label">Status</span><span className="badge ok">{status.status}</span></div>
              <div><span className="label">Service</span><span>{status.service}</span></div>
              <div><span className="label">Version</span><span>{status.version}</span></div>
              <div><span className="label">Message</span><span>{status.message}</span></div>
            </div>
          )}
        </section>

        {/* Task manager */}
        <section className="card">
          <h2>Task Queue</h2>
          <div className="add-task">
            <input
              type="text"
              placeholder="New task title…"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            />
            <button onClick={handleAddTask} style={{ background: THEME_COLOR }}>
              Add Task
            </button>
          </div>

          {tasks.length === 0
            ? <p className="muted">No tasks yet. Add one above!</p>
            : (
              <ul className="task-list">
                {tasks.map(t => (
                  <li key={t.id} className="task-item">
                    <span className="task-title">{t.title}</span>
                    <span className={`badge ${t.status}`}>{t.status}</span>
                    <button className="delete-btn" onClick={() => handleDelete(t.id)}>✕</button>
                  </li>
                ))}
              </ul>
            )
          }
        </section>

        {/* Tech stack info */}
        <section className="card tech-stack">
          <h2>Tech Stack</h2>
          <div className="tech-grid">
            <div className="tech-item"><span>⚛️</span><span>React Frontend</span></div>
            <div className="tech-item"><span>🔷</span><span>.NET 8 API</span></div>
            <div className="tech-item"><span>🐍</span><span>Python Worker</span></div>
            <div className="tech-item"><span>🔴</span><span>Redis Queue</span></div>
            <div className="tech-item"><span>🐳</span><span>Docker / Swarm</span></div>
            <div className="tech-item"><span>🌍</span><span>Terraform IaC</span></div>
          </div>
        </section>
      </main>

      <footer className="footer">
        ADCS-IV · Air University, Islamabad · Deployed via GitHub Actions + Jenkins
      </footer>
    </div>
  )
}
