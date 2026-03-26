import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Play, ChevronRight, Terminal, Loader } from 'lucide-react'
import { contentApi, exercisesApi } from '../../services/api'
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
  const [selectedChapter, setSelectedChapter] = useState<Tema | null>(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [outputError, setOutputError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState('')
  const [level, setLevel] = useState('')
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)

  useEffect(() => {
    const fetchContent = async () => {
      const username = localStorage.getItem('u')
      if (!username) {
        navigate('/login')
        return
      }
      try {
        const res = await contentApi.getUserContent(username)
        const apiBody = res.data
        const content = apiBody.data || apiBody
        if (content && content.chapters) {
          setChapters(content.chapters)
          setLanguage(content.language)
          setLevel(content.level)
          setScore(content.score)
          setMaxScore(content.max_score)
          if (content.chapters.length > 0 && content.chapters[0].secciones.length > 0) {
            const firstChapter = content.chapters[0]
            const firstSection = firstChapter.secciones[0]
            setSelectedChapter(firstChapter)
            setSelectedSection(firstSection)
            setCode(firstSection.codigo || '')
          }
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

  const handleSectionClick = (chapter: Tema, section: Seccion) => {
    setSelectedChapter(chapter)
    setSelectedSection(section)
    setCode(section.codigo || '')
    setOutput('')
    setOutputError(null)
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
        <div className="learning-layout">
          <aside className="lessons-sidebar">
            <div className="sidebar-header">
              <BookOpen size={24} />
              <h2>Contenido</h2>
            </div>

            <div className="lessons-list">
              {chapters.map((chapter) => (
                <div key={chapter.id}>
                  <div className="chapter-header">
                    Cap. {chapter.id_capitulo} · {chapter.titulo_capitulo}
                  </div>
                  {chapter.secciones.map((section) => (
                    <div
                      key={section.id}
                      className={`lesson-item ${selectedSection?.id === section.id ? 'active' : ''}`}
                      onClick={() => handleSectionClick(chapter, section)}
                    >
                      <div className="lesson-status">
                        <div className="status-number">{section.id_seccion}</div>
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
                  ))}
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
                    <button
                      className="btn btn-primary"
                      onClick={handleRunCode}
                      disabled={running || !code.trim()}
                    >
                      <Play size={18} />
                      {running ? 'Ejecutando...' : 'Ejecutar'}
                    </button>
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
