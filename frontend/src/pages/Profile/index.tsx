import { User, Trophy, Flame, Star, Clock, Calendar, TrendingUp, Award } from 'lucide-react'
import './styles.css'

export function Profile() {
  const userStats = {
    name: 'Estudiante',
    level: 3,
    xp: 2450,
    xpToNextLevel: 3000,
    streak: 5,
    lessonsCompleted: 12,
    totalLessons: 50,
    studyTime: 360, // minutes
    joinDate: 'Enero 2024',
    accuracy: 87,
  }

  const achievements = [
    { icon: Trophy, name: 'Primeros Pasos', description: 'Completa tu primera lección', unlocked: true },
    { icon: Flame, name: 'Racha de 5 Días', description: 'Estudia 5 días consecutivos', unlocked: true },
    { icon: Star, name: 'Experto', description: 'Alcanza 90% de precisión', unlocked: false },
    { icon: Clock, name: 'Dedicado', description: 'Estudia por 10 horas', unlocked: false },
  ]

  const recentActivity = [
    { action: 'Completó', subject: 'Variables y Tipos de Datos', time: 'Hace 2 horas', type: 'completed' },
    { action: 'Inició', subject: 'Estructuras de Control', time: 'Hace 5 horas', type: 'started' },
    { action: 'Completó', subject: 'Introducción a Python', time: 'Ayer', type: 'completed' },
    { action: 'Ganó', subject: 'Logro: Primeros Pasos', time: 'Ayer', type: 'achievement' },
  ]

  return (
    <div className="page profile-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Perfil</h1>
          <p>Tu progreso y logros en Aprender++</p>
        </div>
      </div>

      <div className="container">
        <div className="profile-layout">
          {/* Profile Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                <User size={48} />
              </div>
              <h2 className="profile-name">{userStats.name}</h2>
              <div className="profile-level">
                <span className="level-badge">Nivel {userStats.level}</span>
              </div>
              
              <div className="xp-section">
                <div className="xp-header">
                  <span className="xp-label">Experiencia</span>
                  <span className="xp-value">{userStats.xp} / {userStats.xpToNextLevel} XP</span>
                </div>
                <div className="xp-bar">
                  <div 
                    className="xp-fill" 
                    style={{ width: `${(userStats.xp / userStats.xpToNextLevel) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="streak-badge">
                <Flame size={24} className="streak-icon" />
                <div className="streak-info">
                  <span className="streak-count">{userStats.streak}</span>
                  <span className="streak-label">días de racha</span>
                </div>
              </div>

              <div className="profile-meta">
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>Se unió en {userStats.joinDate}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="profile-content">
            {/* Stats Grid */}
            <section className="stats-section">
              <h3 className="section-title-small">Estadísticas</h3>
              <div className="stats-grid-profile">
                <div className="stat-card-profile">
                  <div className="stat-icon-wrapper blue">
                    <BookOpenIcon size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value-profile">{userStats.lessonsCompleted}</span>
                    <span className="stat-label-profile">Lecciones Completadas</span>
                  </div>
                </div>
                <div className="stat-card-profile">
                  <div className="stat-icon-wrapper green">
                    <Clock size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value-profile">{Math.floor(userStats.studyTime / 60)}h {userStats.studyTime % 60}m</span>
                    <span className="stat-label-profile">Tiempo de Estudio</span>
                  </div>
                </div>
                <div className="stat-card-profile">
                  <div className="stat-icon-wrapper purple">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value-profile">{userStats.accuracy}%</span>
                    <span className="stat-label-profile">Precisión</span>
                  </div>
                </div>
                <div className="stat-card-profile">
                  <div className="stat-icon-wrapper orange">
                    <Award size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value-profile">2/4</span>
                    <span className="stat-label-profile">Logros Desbloqueados</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Progress Section */}
            <section className="progress-section">
              <h3 className="section-title-small">Progreso del Curso</h3>
              <div className="progress-card">
                <div className="progress-header">
                  <span className="progress-title">Python Fundamentals</span>
                  <span className="progress-percentage">
                    {Math.round((userStats.lessonsCompleted / userStats.totalLessons) * 100)}%
                  </span>
                </div>
                <div className="progress-bar-large">
                  <div 
                    className="progress-fill-large" 
                    style={{ width: `${(userStats.lessonsCompleted / userStats.totalLessons) * 100}%` }}
                  ></div>
                </div>
                <p className="progress-detail">
                  {userStats.lessonsCompleted} de {userStats.totalLessons} lecciones completadas
                </p>
              </div>
            </section>

            {/* Achievements Section */}
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

            {/* Recent Activity */}
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
          </main>
        </div>
      </div>
    </div>
  )
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
