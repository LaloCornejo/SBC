import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Play, ChevronRight, Terminal, Loader, Flame, Target, Zap, CheckCircle, Circle } from 'lucide-react'
import { contentApi, exercisesApi, stiApi } from '../../services/api'
import type { Tema, Seccion } from '../../types'
import './styles.css'

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  cpp: 'C++',
  java: 'Java',
}

const LEVEL_LABELS: Record<string, string> = {
  Básico: 'Básico',
  Intermedio: 'Intermedio',
  Avanzado: 'Avanzado',
}

const EDITOR_EXTENSIONS: Record<string, string> = {
  python: '.py',
  cpp: '.cpp',
  java: '.java',
}

export function Learning() {
  const navigate = useNavigate()
  const [chapters, setChapters] = useState<Tema[]>([])
  const [selectedSection, setSelectedSection] = useState<Seccion | null>(null)
  const [_selectedChapter, setSelectedChapter] = useState<Tema | null>(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [outputError, setOutputError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState('')
  const [level, setLevel] = useState('')
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [username, setUsername] = useState('')
  
  const [recommendations, setRecommendations] = useState<{
    suggested_level: string;
    mastery_percentage: number;
    elo_rating: number;
    current_streak: number;
  } | null>(null)
  const [stats, setStats] = useState<{
    total_sections: number;
    completed_sections: number;
    overall_mastery: number;
  } | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [completedSections, setCompletedSections] = useState<Map<number, boolean>>(new Map())
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      const user = localStorage.getItem('u')
      if (!user) {
        navigate('/login')
        return
      }
      setUsername(user)
      
      try {
        const res = await contentApi.getUserContent(user) as unknown as { data?: { language: string; level: string; score: number; max_score: number; chapters: Tema[] } }
        const content = res.data
        if (content && content.chapters) {
          setChapters(content.chapters)
          setLanguage(content.language)
          setLevel(content.level)
          setScore(content.score)
          setMaxScore(content.max_score)
          if (content.chapters.length > 0 && content.chapters[0].secciones.length > 0) {
            const firstSection = content.chapters[0].secciones[0]
            setSelectedChapter(content.chapters[0])
            setSelectedSection(firstSection)
            setCode(firstSection.codigo || '')
          }
          
          const recRes = await stiApi.getRecommendations(user)
          if (recRes.success && recRes.data) {
            setRecommendations(recRes.data)
          }
          
          const statsRes = await stiApi.getProgress(user)
          if (statsRes.success && statsRes.data) {
            setStats(statsRes.data)
          }
          
          const completedRes = await stiApi.getCompletedSections(user)
          if (completedRes.success && completedRes.data) {
            const completedMap = new Map<number, boolean>()
            for (const s of completedRes.data) {
              completedMap.set(s.section_id, s.completed)
            }
            setCompletedSections(completedMap)
          }
          
          setSessionStartTime(Date.now())
        } else {
          navigate('/diagnostico')
          return
        }
      } catch {
        navigate('/diagnostico')
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [navigate])

  const handleSectionClick = async (chapter: Tema, section: Seccion) => {
    // Only auto-save if leaving an incomplete exercise section
    if (selectedSection && username && sessionStartTime && selectedSection.codigo) {
      const isAlreadyCompleted = completedSections.get(selectedSection.id) ?? false;
      if (!isAlreadyCompleted) {
        const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000)
        await stiApi.saveProgress(username, selectedSection.id, false, timeSpent, 0)
      }
      setSessionStartTime(Date.now())
    }
    
    setSelectedChapter(chapter)
    setSelectedSection(section)
    setCode(section.codigo || '')
    setOutput('')
    setOutputError(null)
  }

  const handleMarkComplete = async () => {
    if (!selectedSection || !username || completing) return
    setCompleting(true)
    try {
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000)
      await stiApi.saveProgress(username, selectedSection.id, true, timeSpent, 0)
      setCompletedSections(prev => {
        const newMap = new Map(prev)
        newMap.set(selectedSection.id, true)
        return newMap
      })
      setSessionStartTime(Date.now())
      
      const statsRes = await stiApi.getProgress(username)
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data)
      }
      
      const completedRes = await stiApi.getCompletedSections(username)
      if (completedRes.success && completedRes.data) {
        const newMap = new Map<number, boolean>()
        for (const s of completedRes.data) {
          newMap.set(s.section_id, s.completed)
        }
        setCompletedSections(newMap)
      }
    } finally {
      setCompleting(false)
    }
  }

  const handleRunCode = async () => {
    if (!code.trim()) return
    setRunning(true)
    setOutput('')
    setOutputError(null)
    try {
      const res = await exercisesApi.execute(code, language)
      if (res.success && res.data) {
        setOutput(res.data.output)
        setOutputError(res.data.error || null)
        
        if (username && selectedSection) {
          const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000)
          const completed = !res.data.error && res.data.output.trim() !== ''
          await stiApi.saveProgress(username, selectedSection.id, completed, timeSpent, 0)
          if (completed) {
            setCompletedSections(prev => {
              const newMap = new Map(prev)
              newMap.set(selectedSection.id, true)
              return newMap
            })
          }
          setSessionStartTime(Date.now())
          
          const recRes = await stiApi.getRecommendations(username)
          if (recRes.success && recRes.data) {
            setRecommendations(recRes.data)
          }
          
          const statsRes = await stiApi.getProgress(username)
          if (statsRes.success && statsRes.data) {
            setStats(statsRes.data)
          }
          
          const completedRes = await stiApi.getCompletedSections(username)
          if (completedRes.success && completedRes.data) {
            const newMap = new Map<number, boolean>()
            for (const s of completedRes.data) {
              newMap.set(s.section_id, s.completed)
            }
            setCompletedSections(newMap)
          }
        }
      }
    } catch (err: any) {
      setOutputError(err?.message || 'Error al ejecutar el código')
    } finally {
      setRunning(false)
    }
  }

  const getDifficultyColor = (nivel: string) => {
    switch (nivel) {
      case 'Básico':
        return 'difficulty-beginner'
      case 'Intermedio':
        return 'difficulty-intermediate'
      case 'Avanzado':
        return 'difficulty-advanced'
      default:
        return 'difficulty-beginner'
    }
  }

  const getMasteryColor = (percentage: number) => {
    if (percentage >= 80) return '#22c55e'
    if (percentage >= 50) return '#eab308'
    return '#ef4444'
  }

  if (loading) {
    return (
      <div className="page learning-page">
        <div className="loading-state">
          <Loader size={32} className="spinning" />
          <span style={{ marginLeft: '1rem' }}>Cargando contenido...</span>
        </div>
      </div>
    )
  }

  const langLabel = LANGUAGE_LABELS[language] || language
  const levelLabel = LEVEL_LABELS[level] || level
  const editorExt = EDITOR_EXTENSIONS[language] || '.txt'

  return (
    <div className="page learning-page">
      <div className="page-header">
        <div className="container">
          <h1>Aprender {langLabel}</h1>
          <p>
            Nivel {levelLabel} · {chapters.reduce((acc, c) => acc + c.secciones.length, 0)} secciones
            {maxScore > 0 && ` · Puntaje diagnóstico: ${score}/${maxScore}`}
          </p>
        </div>
      </div>

      <div className="container">
        {recommendations && (
          <div className="sti-recommendations">
            <div className="rec-card">
              <Target size={20} />
              <div className="rec-content">
                <span className="rec-label">Nivel Sugerido</span>
                <span className="rec-value">{recommendations.suggested_level}</span>
              </div>
            </div>
            <div className="rec-card">
              <Zap size={20} />
              <div className="rec-content">
                <span className="rec-label">ELO Rating</span>
                <span className="rec-value">{recommendations.elo_rating}</span>
              </div>
            </div>
            <div className="rec-card">
              <div 
                className="rec-progress"
                style={{ 
                  '--progress-color': getMasteryColor(recommendations.mastery_percentage) 
                } as React.CSSProperties}
              >
                <div className="rec-progress-ring">
                  <svg viewBox="0 0 36 36">
                    <path
                      className="rec-progress-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="rec-progress-fill"
                      strokeDasharray={`${recommendations.mastery_percentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="rec-progress-text">{Math.round(recommendations.mastery_percentage)}%</span>
                </div>
                <div className="rec-content">
                  <span className="rec-label">Dominio</span>
                </div>
              </div>
            </div>
            <div className="rec-card">
              <Flame size={20} className={recommendations.current_streak > 0 ? 'streak-active' : ''} />
              <div className="rec-content">
                <span className="rec-label">Racha</span>
                <span className="rec-value">{recommendations.current_streak} días</span>
              </div>
            </div>
          </div>
        )}

        <div className="learning-layout">
          <aside className="lessons-sidebar">
            <div className="sidebar-header">
              <BookOpen size={24} />
              <h2>Contenido</h2>
            </div>

            {stats && (
              <div className="progress-summary">
                <div className="progress-bar-small">
                  <div 
                    className="progress-fill-small" 
                    style={{ 
                      width: `${stats.total_sections > 0 ? (stats.completed_sections / stats.total_sections) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span>{stats.completed_sections}/{stats.total_sections} secciones</span>
              </div>
            )}

            <div className="lessons-list">
              {chapters.map((chapter) => (
                <div key={chapter.id}>
                  <div className="chapter-header">
                    Cap. {chapter.id_capitulo} · {chapter.titulo_capitulo}
                  </div>
                  {chapter.secciones.map((section) => {
                    const isCompleted = completedSections.get(section.id) ?? false
                    return (
                      <div
                        key={section.id}
                        className={`lesson-item ${selectedSection?.id === section.id ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                        onClick={() => handleSectionClick(chapter, section)}
                      >
                        <div className="lesson-status">
                          {isCompleted ? <CheckCircle size={18} className="status-check" /> : <div className="status-number">{section.id_seccion}</div>}
                        </div>
                        <div className="lesson-content">
                          <h4 className="lesson-title">{section.titulo}</h4>
                          <div className="lesson-meta">
                            <span className={`difficulty-badge ${getDifficultyColor(chapter.nivel)}`}>
                              {chapter.nivel}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="lesson-arrow" />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </aside>

          <main className="learning-content">
            {selectedSection ? (
              <div className="lesson-view">
                <div className="lesson-header">
                  <h2>{selectedSection.titulo}</h2>
                  <div className="lesson-actions">
                    {!selectedSection.codigo && !completedSections.get(selectedSection.id) && (
                      <button
                        className="btn btn-secondary"
                        onClick={handleMarkComplete}
                        disabled={completing}
                      >
                        <CheckCircle size={18} />
                        {completing ? 'Marcando...' : 'Marcar Completo'}
                      </button>
                    )}
                    {selectedSection.codigo && (
                      <button
                        className="btn btn-primary"
                        onClick={handleRunCode}
                        disabled={running || !code.trim()}
                      >
                        <Play size={18} />
                        {running ? 'Ejecutando...' : 'Ejecutar'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="lesson-body">
                  <div className="lesson-instructions">
                    <h3>{selectedSection.titulo}</h3>
                    <p>{selectedSection.cuerpo}</p>
                  </div>

                  <div className="code-editor-container">
                    <div className="editor-header">
                      <Terminal size={18} />
                      <span>editor{editorExt}</span>
                    </div>
                    <textarea
                      className="code-editor"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck={false}
                    />
                  </div>

                  <div className="output-container">
                    <div className="output-header">
                      <Terminal size={18} />
                      <span>Salida</span>
                    </div>
                    <div className="output-content">
                      {output || outputError ? (
                        <>
                          {output && <pre style={{ color: '#d4d4d4', margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>}
                          {outputError && <pre style={{ color: '#f87171', margin: 0, whiteSpace: 'pre-wrap' }}>{outputError}</pre>}
                        </>
                      ) : (
                        <p className="output-placeholder">
                          La salida aparecerá aquí después de ejecutar el código...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="welcome-learning">
                <div className="welcome-icon">
                  <BookOpen size={64} />
                </div>
                <h2>¡Bienvenido a tu viaje de aprendizaje!</h2>
                <p>
                  Selecciona una sección del menú lateral para comenzar.
                  Cada sección incluye explicaciones y ejemplos de código.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
