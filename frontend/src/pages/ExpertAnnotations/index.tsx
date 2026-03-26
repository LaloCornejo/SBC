import { useState, useEffect } from 'react'
import { expertApi } from '../../services/api'
import type { StudentSummary, DiagnosticResultWithId, ExpertAnnotation } from '../../types'
import './styles.css'

const LANGUAGE_INFO: Record<string, { emoji: string; name: string; color: string }> = {
  python: { emoji: '🐍', name: 'Python', color: '#3776ab' },
  cpp: { emoji: '⚡', name: 'C++', color: '#00599c' },
  java: { emoji: '☕', name: 'Java', color: '#ed8b00' },
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function parseDifficultyResponses(raw: string): string[] {
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function ExpertAnnotations() {
  const expertUsername = localStorage.getItem('u') || ''
  const userRole = localStorage.getItem('role') || 'student'

  const [students, setStudents] = useState<StudentSummary[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [diagnostics, setDiagnostics] = useState<DiagnosticResultWithId[]>([])
  const [annotations, setAnnotations] = useState<ExpertAnnotation[]>([])
  const [newAnnotation, setNewAnnotation] = useState('')
  const [selectedDiagnosticId, setSelectedDiagnosticId] = useState<number | null>(null)
  const [editingAnnotation, setEditingAnnotation] = useState<ExpertAnnotation | null>(null)
  const [editText, setEditText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userRole !== 'expert' && userRole !== 'admin') {
      setError('Acceso denegado: se requiere rol de experto')
      setLoading(false)
      return
    }
    loadStudents()
  }, [])

  useEffect(() => {
    if (selectedStudent) {
      loadStudentData(selectedStudent)
    }
  }, [selectedStudent])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const response = await expertApi.getStudents(expertUsername)
      if (response.success) {
        setStudents(response.data)
      }
    } catch (err) {
      setError('Error al cargar estudiantes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadStudentData = async (username: string) => {
    try {
      const [diagResponse, annotResponse] = await Promise.all([
        expertApi.getStudentDiagnostics(username, expertUsername),
        expertApi.getStudentAnnotations(username, expertUsername),
      ])
      if (diagResponse.success) {
        setDiagnostics(diagResponse.data)
      }
      if (annotResponse.success) {
        setAnnotations(annotResponse.data)
      }
    } catch (err) {
      console.error('Error loading student data:', err)
    }
  }

  const handleCreateAnnotation = async () => {
    if (!newAnnotation.trim() || !selectedStudent) return

    try {
      setSaving(true)
      const response = await expertApi.createAnnotation(
        expertUsername,
        selectedStudent,
        newAnnotation,
        selectedDiagnosticId || undefined
      )
      if (response.success) {
        setNewAnnotation('')
        setSelectedDiagnosticId(null)
        await loadStudentData(selectedStudent)
      }
    } catch (err) {
      console.error('Error creating annotation:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateAnnotation = async (annotationId: number) => {
    if (!editText.trim()) return

    try {
      setSaving(true)
      const response = await expertApi.updateAnnotation(
        annotationId,
        editText,
        expertUsername
      )
      if (response.success) {
        setEditingAnnotation(null)
        setEditText('')
        if (selectedStudent) {
          await loadStudentData(selectedStudent)
        }
      }
    } catch (err) {
      console.error('Error updating annotation:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAnnotation = async (annotationId: number) => {
    if (!confirm('¿Eliminar esta anotación?')) return

    try {
      const response = await expertApi.deleteAnnotation(annotationId, expertUsername)
      if (response.success && selectedStudent) {
        await loadStudentData(selectedStudent)
      }
    } catch (err) {
      console.error('Error deleting annotation:', err)
    }
  }

  if (loading) {
    return (
      <div className="page expert-page">
        <div className="container">
          <p className="loading-text">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page expert-page">
        <div className="container">
          <div className="error-card">
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page expert-page">
      <div className="page-header expert-header">
        <div className="container">
          <h1>Panel del Experto</h1>
          <p>Gestiona anotaciones de estudiantes</p>
        </div>
      </div>

      <div className="container expert-container">
        <div className="expert-layout">
          <aside className="students-sidebar">
            <h2>Estudiantes</h2>
            <div className="students-list">
              {students.length === 0 ? (
                <p className="no-data">No hay estudiantes con diagnósticos</p>
              ) : (
                students.map((student) => (
                  <button
                    key={student.username}
                    className={`student-item ${selectedStudent === student.username ? 'active' : ''}`}
                    onClick={() => setSelectedStudent(student.username)}
                  >
                    <span className="student-name">{student.username}</span>
                    <span className="student-meta">
                      {student.diagnostic_count} examen{student.diagnostic_count !== 1 ? 'es' : ''}
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <main className="student-detail">
            {!selectedStudent ? (
              <div className="empty-state">
                <p>Selecciona un estudiante para ver sus detalles</p>
              </div>
            ) : (
              <>
                <section className="detail-section">
                  <h2>Exámenes de {selectedStudent}</h2>
                  {diagnostics.length === 0 ? (
                    <p className="no-data">Este estudiante no tiene exámenes</p>
                  ) : (
                    <div className="diagnostics-grid">
                      {diagnostics.map((diag) => {
                        const langInfo = LANGUAGE_INFO[diag.result] || { emoji: '❓', name: diag.result, color: '#666' }
                        const difficulties = parseDifficultyResponses(diag.difficulty_responses)
                        return (
                          <div
                            key={diag.id}
                            className={`diagnostic-card ${selectedDiagnosticId === diag.id ? 'selected' : ''}`}
                            onClick={() => setSelectedDiagnosticId(
                              selectedDiagnosticId === diag.id ? null : diag.id
                            )}
                          >
                            <div className="diagnostic-header">
                              <span className="language-badge" style={{ backgroundColor: langInfo.color }}>
                                {langInfo.emoji} {langInfo.name}
                              </span>
                              <span className="diagnostic-date">{formatDate(diag.created)}</span>
                            </div>
                            <div className="diagnostic-scores">
                              <span>🐍 {diag.python_score}</span>
                              <span>⚡ {diag.cpp_score}</span>
                              <span>☕ {diag.java_score}</span>
                            </div>
                            {difficulties.length > 0 && (
                              <div className="difficulty-responses">
                                <small>Autoevaluación: {difficulties.join(', ')}</small>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>

                <section className="detail-section">
                  <h2>Nueva Anotación</h2>
                  <div className="annotation-form">
                    {selectedDiagnosticId && (
                      <p className="form-hint">
                        Anotación vinculada al examen seleccionado
                      </p>
                    )}
                    <textarea
                      className="annotation-textarea"
                      placeholder="Escribe tu anotación sobre este estudiante..."
                      value={newAnnotation}
                      onChange={(e) => setNewAnnotation(e.target.value)}
                      rows={4}
                    />
                    <div className="form-actions">
                      <button
                        className="btn btn-primary"
                        onClick={handleCreateAnnotation}
                        disabled={saving || !newAnnotation.trim()}
                      >
                        {saving ? 'Guardando...' : 'Guardar Anotación'}
                      </button>
                      {selectedDiagnosticId && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => setSelectedDiagnosticId(null)}
                        >
                          Sin vincular examen
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                <section className="detail-section">
                  <h2>Historial de Anotaciones</h2>
                  {annotations.length === 0 ? (
                    <p className="no-data">No hay anotaciones previas</p>
                  ) : (
                    <div className="annotations-list">
                      {annotations.map((annot) => (
                        <div key={annot.id} className="annotation-card">
                          {editingAnnotation?.id === annot.id ? (
                            <div className="annotation-edit">
                              <textarea
                                className="annotation-textarea"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={3}
                              />
                              <div className="edit-actions">
                                <button
                                  className="btn btn-primary btn-small"
                                  onClick={() => handleUpdateAnnotation(annot.id)}
                                  disabled={saving}
                                >
                                  Guardar
                                </button>
                                <button
                                  className="btn btn-secondary btn-small"
                                  onClick={() => {
                                    setEditingAnnotation(null)
                                    setEditText('')
                                  }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="annotation-header">
                                <span className="annotation-meta">
                                  Por: {annot.expert_username}
                                </span>
                                <span className="annotation-date">
                                  {formatDate(annot.updated)}
                                </span>
                              </div>
                              <p className="annotation-text">{annot.annotation}</p>
                              {annot.diagnostic_id && (
                                <span className="annotation-linked">
                                  Vinculado a examen #{annot.diagnostic_id}
                                </span>
                              )}
                              <div className="annotation-actions">
                                <button
                                  className="btn-icon"
                                  onClick={() => {
                                    setEditingAnnotation(annot)
                                    setEditText(annot.annotation)
                                  }}
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="btn-icon btn-danger"
                                  onClick={() => handleDeleteAnnotation(annot.id)}
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
