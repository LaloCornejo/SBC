import { useState, useEffect } from 'react'
import { User, Trophy, Flame, Star, Clock, Calendar, TrendingUp, Award } from 'lucide-react'
import axios from 'axios'
import './styles.css'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8003"

interface ProfileData {
  username: string
  role: string
  join_date: number
  total_diagnostics: number
  accuracy: number
  lessons_completed: number
  total_lessons: number
  xp: number
  level: number
  xp_to_next: number
  diagnostics: Array<{
    result: string
    python_score: number
    cpp_score: number
    java_score: number
    created: number
  }>
  user_content: {
    language: string
    level: string
    score: number
    max_score: number
    chapters: Array<{ titulo_capitulo: string }>
  } | null
}

export function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const username = localStorage.getItem('u')
      if (!username) {
        setError('No hay sesión activa')
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`${API_URL}/api/v1/user/profile`, {
          params: { username }
        })
        setProfile(response.data.data)
      } catch (err) {
        setError('Error al cargar el perfil')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="page profile-page">
        <div className="container">
          <div className="profile-loading">
            <div className="spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="page profile-page">
        <div className="container">
          <div className="profile-error">
            <p>{error || 'No se pudo cargar el perfil'}</p>
          </div>
        </div>
      </div>
    )
  }

  const achievements = [
    { icon: Trophy, name: 'Primeros Pasos', description: 'Completa tu primera lección', unlocked: profile.total_diagnostics >= 1 },
    { icon: Flame, name: 'Racha Activa', description: 'Realiza el examen diagnóstico', unlocked: profile.total_diagnostics >= 1 },
    { icon: Star, name: 'Precisión Alta', description: 'Alcanza 80% o más en el diagnóstico', unlocked: profile.accuracy >= 80 },
    { icon: Clock, name: 'Dedicado', description: 'Completa 3 o más diagnósticos', unlocked: profile.total_diagnostics >= 3 },
  ]

  const recentActivity = profile.diagnostics.slice(0, 4).map((d) => ({
    action: 'Completó diagnóstico',
    subject: `${d.result === 'python' ? 'Python' : d.result === 'cpp' ? 'C++' : 'Java'} — ${d.result === 'python' ? d.python_score : d.result === 'cpp' ? d.cpp_score : d.java_score} pts`,
    time: formatTimeAgo(d.created),
    type: 'completed' as const,
  }))

  const xpPercent = Math.min((profile.xp / profile.xp_to_next) * 100, 100)
  const coursePercent = profile.total_lessons > 0
    ? Math.round((profile.lessons_completed / profile.total_lessons) * 100)
    : 0

  return (
    <div className="page profile-page">
      <div className="page-header">
        <div className="container">
          <h1>Perfil</h1>
          <p>Tu progreso y logros en Aprender++</p>
        </div>
      </div>

      <div className="container">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                <User size={48} />
              </div>
              <h2 className="profile-name">{profile.username}</h2>
              <div className="profile-level">
                <span className="level-badge">Nivel {profile.level}</span>
                {profile.role === 'expert' && <span className="role-badge expert">Experto</span>}
                {profile.role === 'admin' && <span className="role-badge admin">Admin</span>}
              </div>

              <div className="xp-section">
                <div className="xp-header">
                  <span className="xp-label">Experiencia</span>
                  <span className="xp-value">{profile.xp} / {profile.xp_to_next} XP</span>
                </div>
                <div className="xp-bar">
                  <div className="xp-fill" style={{ width: `${xpPercent}%` }}></div>
                </div>
              </div>

              <div className="streak-badge">
                <Flame size={24} className="streak-icon" />
                <div className="streak-info">
                  <span className="streak-count">{profile.total_diagnostics}</span>
                  <span className="streak-label">diagnósticos realizados</span>
                </div>
              </div>

              <div className="profile-meta">
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>Se unió en {formatDate(profile.join_date)}</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="profile-content">
            <section className="stats-section">
              <h3 className="section-title-small">Estadísticas</h3>
              <div className="stats-grid-profile">
                <div className="stat-card-profile">
                  <div className="stat-icon-wrapper blue">
                    <BookOpenIcon size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value-profile">{profile.lessons_completed}</span>
                    <span className="stat-label-profile">Lecciones Completadas</span>
                  </div>
                </div>
                <div className="stat-card-profile">
                  <div className="stat-icon-wrapper green">
                    <Clock size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value-profile">{profile.total_diagnostics}</span>
                    <span className="stat-label-profile">Diagnósticos Realizados</span>
                  </div>
                </div>
                <div className="stat-card-profile">
                  <div className="stat-icon-wrapper purple">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value-profile">{profile.accuracy}%</span>
                    <span className="stat-label-profile">Precisión</span>
                  </div>
                </div>
                <div className="stat-card-profile">
                  <div className="stat-icon-wrapper orange">
                    <Award size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value-profile">{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
                    <span className="stat-label-profile">Logros Desbloqueados</span>
                  </div>
                </div>
              </div>
            </section>

            {profile.user_content && (
              <section className="progress-section">
                <h3 className="section-title-small">Progreso del Curso</h3>
                <div className="progress-card">
                  <div className="progress-header">
                    <span className="progress-title">
                      {profile.user_content.language === 'python' ? 'Python' : profile.user_content.language === 'cpp' ? 'C++' : 'Java'} — {profile.user_content.level}
                    </span>
                    <span className="progress-percentage">{coursePercent}%</span>
                  </div>
                  <div className="progress-bar-large">
                    <div className="progress-fill-large" style={{ width: `${coursePercent}%` }}></div>
                  </div>
                  <p className="progress-detail">
                    {profile.user_content.chapters.length} capítulos disponibles
                  </p>
                </div>
              </section>
            )}

            <section className="achievements-section">
              <h3 className="section-title-small">Logros</h3>
              <div className="achievements-grid">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon
                  return (
                    <div
                      key={index}
                      className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                    >
                      <div className="achievement-icon">
                        <Icon size={28} />
                      </div>
                      <h4 className="achievement-name">{achievement.name}</h4>
                      <p className="achievement-description">{achievement.description}</p>
                      {achievement.unlocked && (
                        <span className="achievement-badge">Desbloqueado</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {recentActivity.length > 0 && (
              <section className="activity-section">
                <h3 className="section-title-small">Actividad Reciente</h3>
                <div className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className={`activity-item ${activity.type}`}>
                      <div className={`activity-dot ${activity.type}`}></div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <span className="activity-action">{activity.action}</span>
                          <span className="activity-subject">{activity.subject}</span>
                        </p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`
  if (diff < 172800) return 'Ayer'
  return `Hace ${Math.floor(diff / 86400)} días`
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

function BookOpenIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
