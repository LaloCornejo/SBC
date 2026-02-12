import { useState } from 'react'
import { BookOpen, Play, CheckCircle, Lock, Clock, Star, ChevronRight, Terminal, Lightbulb } from 'lucide-react'
import './styles.css'

export function Learning() {
  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [code, setCode] = useState('# Escribe tu código Python aquí\nprint("¡Hola, mundo!")')

  const lessons = [
    {
      id: '1',
      title: 'Introducción a Python',
      description: 'Conceptos básicos y sintaxis',
      duration: 15,
      difficulty: 'Principiante',
      completed: true,
      progress: 100,
    },
    {
      id: '2',
      title: 'Variables y Tipos de Datos',
      description: 'Números, strings y booleanos',
      duration: 20,
      difficulty: 'Principiante',
      completed: true,
      progress: 100,
    },
    {
      id: '3',
      title: 'Estructuras de Control',
      description: 'If, else, elif y loops',
      duration: 25,
      difficulty: 'Principiante',
      completed: false,
      progress: 60,
    },
    {
      id: '4',
      title: 'Funciones',
      description: 'Definición y llamada de funciones',
      duration: 30,
      difficulty: 'Intermedio',
      completed: false,
      progress: 0,
    },
    {
      id: '5',
      title: 'Listas y Diccionarios',
      description: 'Estructuras de datos en Python',
      duration: 35,
      difficulty: 'Intermedio',
      completed: false,
      progress: 0,
      locked: true,
    },
    {
      id: '6',
      title: 'Programación Orientada a Objetos',
      description: 'Clases y objetos',
      duration: 40,
      difficulty: 'Avanzado',
      completed: false,
      progress: 0,
      locked: true,
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Principiante':
        return 'difficulty-beginner'
      case 'Intermedio':
        return 'difficulty-intermediate'
      case 'Avanzado':
        return 'difficulty-advanced'
      default:
        return 'difficulty-beginner'
    }
  }

  return (
    <div className="page learning-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Aprender</h1>
          <p>Domina Python con lecciones interactivas y personalizadas</p>
        </div>
      </div>

      <div className="container">
        <div className="learning-layout">
          {/* Lessons Sidebar */}
          <aside className="lessons-sidebar">
            <div className="sidebar-header">
              <BookOpen size={24} />
              <h2>Lecciones</h2>
            </div>

            <div className="progress-overview">
              <div className="progress-info">
                <span className="progress-label">Progreso General</span>
                <span className="progress-value">33%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '33%' }}></div>
              </div>
            </div>

            <div className="lessons-list">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`lesson-item ${lesson.completed ? 'completed' : ''} ${lesson.locked ? 'locked' : ''} ${activeLesson === lesson.id ? 'active' : ''}`}
                  onClick={() => !lesson.locked && setActiveLesson(lesson.id)}
                >
                  <div className="lesson-status">
                    {lesson.completed ? (
                      <CheckCircle size={20} className="status-icon completed" />
                    ) : lesson.locked ? (
                      <Lock size={20} className="status-icon locked" />
                    ) : (
                      <div className="status-number">{lesson.id}</div>
                    )}
                  </div>
                  <div className="lesson-content">
                    <h4 className="lesson-title">{lesson.title}</h4>
                    <p className="lesson-description">{lesson.description}</p>
                    <div className="lesson-meta">
                      <span className={`difficulty-badge ${getDifficultyColor(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </span>
                      <span className="duration">
                        <Clock size={14} />
                        {lesson.duration} min
                      </span>
                    </div>
                    {!lesson.locked && !lesson.completed && (
                      <div className="lesson-progress-bar">
                        <div 
                          className="lesson-progress-fill" 
                          style={{ width: `${lesson.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={18} className="lesson-arrow" />
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="learning-content">
            {activeLesson ? (
              <div className="lesson-view">
                <div className="lesson-header">
                  <h2>Estructuras de Control</h2>
                  <div className="lesson-actions">
                    <button className="btn btn-secondary">
                      <Lightbulb size={18} />
                      Pista
                    </button>
                    <button className="btn btn-primary">
                      <Play size={18} />
                      Ejecutar
                    </button>
                  </div>
                </div>

                <div className="lesson-body">
                  <div className="lesson-instructions">
                    <h3>Instrucciones</h3>
                    <p>
                      En esta lección aprenderás sobre las estructuras de control en Python. 
                      Escribe un programa que verifique si un número es positivo, negativo o cero.
                    </p>
                    <div className="hint-box">
                      <Lightbulb size={18} />
                      <span>Usa la sentencia if-elif-else para verificar las condiciones.</span>
                    </div>
                  </div>

                  <div className="code-editor-container">
                    <div className="editor-header">
                      <Terminal size={18} />
                      <span>editor.py</span>
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
                      <p className="output-placeholder">
                        La salida aparecerá aquí después de ejecutar el código...
                      </p>
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
                  Selecciona una lección del menú lateral para comenzar. 
                  Cada lección incluye ejercicios prácticos y retroalimentación en tiempo real.
                </p>
                <div className="stats-grid">
                  <div className="stat-item">
                    <Star size={24} />
                    <span className="stat-value">2</span>
                    <span className="stat-label">Lecciones Completadas</span>
                  </div>
                  <div className="stat-item">
                    <Clock size={24} />
                    <span className="stat-value">35</span>
                    <span className="stat-label">Minutos de Estudio</span>
                  </div>
                  <div className="stat-item">
                    <CheckCircle size={24} />
                    <span className="stat-value">85%</span>
                    <span className="stat-label">Precisión</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
