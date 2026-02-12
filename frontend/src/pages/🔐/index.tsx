import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, BookOpen, Zap, Target, Sparkles } from './icons'

const _1 = (s: string) => atob(s)
const _2 = 'aHR0cDovL2xvY2FsaG9zdDo4MDAz'
const _3 = _1(_2)

interface A0 {
  username: string
  password: string
}

interface B0 {
  success: boolean
  token?: string
  error?: string
}

const s = `
.x9 {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.x8 {
  width: 50%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
}

.x7 {
  margin-bottom: 3rem;
}

.x7 h1 {
  color: #1f2937;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.x7 p {
  color: #6b7280;
  font-size: 1.125rem;
  font-weight: 400;
}

.x6 {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 400px;
}

.x5 {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.x5 label {
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.x5 input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: #ffffff;
  color: #1f2937;
  transition: all 0.2s;
}

.x5 input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.x5 input.x4 {
  border-color: #ef4444;
}

.x5 input.x4:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.x3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
}

.x2 {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.x2:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
}

.x2:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.xz {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
}

.xz button {
  background: none;
  border: none;
  color: #6366f1;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  margin-left: 0.5rem;
  transition: color 0.2s;
}

.xz button:hover {
  color: #8b5cf6;
}

.info-panel {
  width: 50%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%);
  color: white;
}

.info-content {
  max-width: 400px;
}

.info-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.5rem;
  backdrop-filter: blur(10px);
}

.info-icon svg {
  color: white;
}

.info-panel h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  color: white;
}

.info-panel p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.feature-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon svg {
  color: white;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 3rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 1024px) {
  .x9 {
    flex-direction: column;
  }
  
  .x8, .info-panel {
    width: 100%;
    min-height: auto;
    padding: 2rem;
  }
  
  .info-panel {
    order: -1;
    min-height: auto;
  }
}
`

export function X9() {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [l, setL] = useState(false)
  const [e, setE] = useState('')
  const [r, setR] = useState(false)
  const n = useNavigate()

  useEffect(() => {
    const t = localStorage.getItem('t')
    if (t) {
      n('/')
    }
    const y = document.createElement('style')
    y.textContent = s
    document.head.appendChild(y)
    return () => { document.head.removeChild(y) }
  }, [n])

  const h = useCallback(async (ev: React.FormEvent) => {
    ev.preventDefault()
    setL(true)
    setE('')

    try {
      const d: A0 = { username: u, password: p }
      const b = _3
      const q = r ? '/api/v1/register' : '/api/v1/login'
      
      const w = await fetch(`${b}${q}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
      })

      const v: B0 = await w.json()

      if (v.success && v.token) {
        localStorage.setItem('t', v.token)
        localStorage.setItem('u', u)
        n('/')
      } else {
        setE(v.error || (r ? 'Error al registrar' : 'Credenciales inválidas'))
      }
    } catch (err) {
      setE('Error de conexión')
    } finally {
      setL(false)
    }
  }, [u, p, r, n])

  const toggleMode = () => {
    setR(!r)
    setE('')
    setU('')
    setP('')
  }

  return (
    <div className="x9">
      <div className="x8">
        <div className="x7">
          <h1>{r ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
          <p>{r ? 'Completa los datos para registrarte' : 'Ingresa tus credenciales para continuar'}</p>
        </div>
        
        <form className="x6" onSubmit={h}>
          <div className="x5">
            <label>Usuario</label>
            <input
              type="text"
              value={u}
              onChange={(ev) => setU(ev.target.value)}
              placeholder="usuario"
              disabled={l}
              className={e ? 'x4' : ''}
              required
            />
          </div>

          <div className="x5">
            <label>Contraseña</label>
            <input
              type="password"
              value={p}
              onChange={(ev) => setP(ev.target.value)}
              placeholder="••••••••"
              disabled={l}
              className={e ? 'x4' : ''}
              required
            />
          </div>

          {e && (
            <div className="x3">
              <span>{e}</span>
            </div>
          )}

          <button
            type="submit"
            className="x2"
            disabled={l || !u || !p}
          >
            <span>{r ? 'Registrarse' : 'Entrar'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="xz">
          {r ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <button onClick={toggleMode}>
            {r ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </div>
      </div>

      <div className="info-panel">
        <div className="info-content">
          <div className="info-icon">
            <Sparkles size={40} />
          </div>
          
          {r ? (
            <>
              <h2>Únete al aprendizaje</h2>
              <p>Crea tu cuenta y comienza a dominar la programación con nuestro sistema inteligente.</p>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <BookOpen size={20} />
                  </div>
                  <span>Acceso a todas las lecciones</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <Zap size={20} />
                  </div>
                  <span>Práctica en tiempo real</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <Target size={20} />
                  </div>
                  <span>Seguimiento de progreso</span>
                </div>
              </div>
              <button className="toggle-btn" onClick={toggleMode}>
                <ArrowLeft size={18} />
                <span>Ya tengo cuenta</span>
              </button>
            </>
          ) : (
            <>
              <h2>Bienvenido de vuelta</h2>
              <p>Continúa tu progreso y sigue aprendiendo con contenido personalizado para ti.</p>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <BookOpen size={20} />
                  </div>
                  <span>Retoma donde lo dejaste</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <Zap size={20} />
                  </div>
                  <span>Ejercicios adaptados a tu nivel</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <Target size={20} />
                  </div>
                  <span>Metas personalizadas</span>
                  </div>
              </div>
              <button className="toggle-btn" onClick={toggleMode}>
                <span>Crear cuenta nueva</span>
                <ArrowRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
