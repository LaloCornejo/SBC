import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css'

const QUESTIONS: Record<number, string> = {
  1:  '¿Te gustaría crear programas que puedan "aprender" o tomar decisiones inteligentes?',
  2:  '¿Te llama la atención trabajar analizando grandes cantidades de datos?',
  3:  '¿Te gustaría desarrollar sistemas que puedan predecir resultados futuros?',
  4:  '¿Te interesa automatizar tareas para ahorrar tiempo?',
  5:  '¿Prefieres ver resultados funcionales en poco tiempo cuando programas?',
  6:  '¿Te gusta crear pequeños programas o scripts para resolver problemas específicos?',
  7:  '¿Te gustaría participar en el desarrollo de videojuegos?',
  8:  '¿Te interesa programar cosas que estén muy cerca del funcionamiento del hardware?',
  9:  '¿Te llama la atención cómo funcionan los sistemas operativos por dentro?',
  10: '¿Te gusta mejorar programas para que funcionen más rápido y consuman menos recursos?',
  11: '¿Estarías dispuesto a trabajar gestionando manualmente la memoria de un programa?',
  12: '¿Te motivan los retos técnicos difíciles?',
  13: '¿Te gustaría desarrollar software para empresas grandes?',
  14: '¿Te interesa trabajar en la parte "detrás" de las aplicaciones web (backend)?',
  15: '¿Te gustaría crear APIs que conecten diferentes sistemas?',
  16: '¿Te gusta organizar programas usando clases y objetos?',
  17: '¿Te atraen los proyectos grandes que requieren estructura y organización?',
  18: '¿Te gustaría desarrollar aplicaciones para Android?',
  19: '¿Disfrutas las matemáticas avanzadas?',
  20: '¿Te sientes cómodo resolviendo problemas de lógica abstracta?',
  21: '¿Prefieres que un lenguaje sea sencillo aunque tenga menos control interno?',
  22: '¿Prefieres tener control total del programa aunque sea más complejo?',
  23: '¿Te desesperan los errores difíciles de entender?',
  24: '¿Te interesa entender cómo funciona una computadora internamente?',
  25: '¿Te gusta seguir reglas y estructuras bien definidas al programar?',
  26: '¿Te interesa crear aplicaciones web de manera rápida?',
  27: '¿Te gustaría desarrollar herramientas para investigación científica?',
  28: '¿Te interesan los dispositivos electrónicos pequeños (como microcontroladores)?',
  29: '¿Te gustaría desarrollar software para bancos o sistemas financieros?',
  30: '¿Te interesa trabajar con servidores e infraestructura?',
  31: '¿Te gustaría crear aplicaciones que funcionen en múltiples plataformas?',
  32: '¿Te interesa que tus programas tengan el máximo rendimiento posible?',
  33: '¿Estás comenzando tu camino en la programación?',
  34: '¿Prefieres un lenguaje con sintaxis clara y fácil de leer?',
  35: '¿Te interesa aprender un lenguaje muy utilizado en ciencia de datos?',
  36: '¿Te gustaría aprender un lenguaje muy usado en empresas grandes?',
  37: '¿Te gustaría trabajar en estudios profesionales de videojuegos?',
  38: '¿Te interesa trabajar en proyectos donde la eficiencia sea crítica?',
  39: '¿Te gustaría desarrollar aplicaciones de escritorio completas y complejas?',
  40: '¿Te importa que el lenguaje tenga una comunidad grande y muchos recursos de aprendizaje?',
}

type GraphNode = { yes: number; no: number }
const GRAPH: Record<number, GraphNode> = {
  1:  { yes: 2,  no: 7  },
  2:  { yes: 3,  no: 19 },
  3:  { yes: 4,  no: 27 },
  4:  { yes: 5,  no: 26 },
  5:  { yes: 6,  no: 21 },
  6:  { yes: 33, no: 20 },
  7:  { yes: 8,  no: 13 },
  8:  { yes: 9,  no: 24 },
  9:  { yes: 10, no: 32 },
  10: { yes: 11, no: 17 },
  11: { yes: 12, no: 16 },
  12: { yes: 38, no: 25 },
  13: { yes: 14, no: 19 },
  14: { yes: 15, no: 26 },
  15: { yes: 16, no: 21 },
  16: { yes: 17, no: 22 },
  17: { yes: 18, no: 20 },
  18: { yes: 36, no: 19 },
  19: { yes: 20, no: 23 },
  20: { yes: 24, no: 33 },
  21: { yes: 34, no: 22 },
  22: { yes: 28, no: 25 },
  23: { yes: 34, no: 24 },
  24: { yes: 28, no: 29 },
  25: { yes: 30, no: 33 },
  26: { yes: 27, no: 31 },
  27: { yes: 35, no: 28 },
  28: { yes: 37, no: 29 },
  29: { yes: 30, no: 32 },
  30: { yes: 31, no: 38 },
  31: { yes: 39, no: 32 },
  32: { yes: 37, no: 33 },
  33: { yes: 34, no: 36 },
  34: { yes: 35, no: 40 },
  35: { yes: 40, no: 36 },
  36: { yes: 39, no: 37 },
  37: { yes: 38, no: 40 },
  38: { yes: -1, no: 39 },
  39: { yes: 40, no: 40 },
  40: { yes: -1, no: -1 },
}

type Scores = { python: number; cpp: number; java: number }

function getPoints(q: number): Partial<Scores> {
  if (q >= 1  && q <= 6)  return { python: 1 }
  if (q >= 7  && q <= 12) return { cpp: 1 }
  if (q >= 13 && q <= 18) return { java: 1 }
  if (q === 19) return { cpp: 1, python: 1 }
  if (q === 20) return { cpp: 1 }
  if (q === 21) return { python: 1 }
  if (q === 22) return { cpp: 1 }
  if (q === 23) return { python: 1 }
  if (q === 24) return { cpp: 1 }
  if (q === 25) return { java: 1 }
  if (q === 26) return { python: 1 }
  if (q === 27) return { python: 1 }
  if (q === 28) return { cpp: 1 }
  if (q === 29) return { java: 1 }
  if (q === 30) return { java: 1 }
  if (q === 31) return { java: 1 }
  if (q === 32) return { cpp: 1 }
  if (q === 33) return { python: 1 }
  if (q === 34) return { python: 1 }
  if (q === 35) return { python: 1 }
  if (q === 36) return { java: 1 }
  if (q === 37) return { cpp: 1 }
  if (q === 38) return { cpp: 1 }
  if (q === 39) return { java: 1 }
  if (q === 40) return { python: 1 }
  return {}
}

type BlockType = 'block-python' | 'block-cpp' | 'block-java' | 'block-mixed'

function getBlock(q: number): BlockType {
  const pythonQs = [1,2,3,4,5,6,21,23,26,27,33,34,35,40]
  const cppQs    = [7,8,9,10,11,12,20,22,24,28,32,37,38]
  const javaQs   = [13,14,15,16,17,18,25,29,30,31,36,39]
  if (pythonQs.includes(q)) return 'block-python'
  if (cppQs.includes(q))    return 'block-cpp'
  if (javaQs.includes(q))   return 'block-java'
  return 'block-mixed'
}

const BLOCK_LABELS: Record<BlockType, string> = {
  'block-python': 'Bloque Python',
  'block-cpp':    'Bloque C++',
  'block-java':   'Bloque Java',
  'block-mixed':  'Zona de convergencia',
}

type Winner = 'python' | 'cpp' | 'java'

const RESULT_INFO: Record<Winner, { emoji: string; name: string; description: string; bgClass: string }> = {
  python: {
    emoji: '🐍',
    name: 'Python',
    description:
      '¡Python es perfecto para ti! Es ideal para inteligencia artificial, ciencia de datos, automatización y desarrollo rápido. Su sintaxis clara lo hace excelente para comenzar.',
    bgClass: 'result-bg-python',
  },
  cpp: {
    emoji: '⚡',
    name: 'C++',
    description:
      '¡C++ es tu lenguaje! Domina el rendimiento, los videojuegos y la programación de sistemas. Tendrás control total sobre el hardware.',
    bgClass: 'result-bg-cpp',
  },
  java: {
    emoji: '☕',
    name: 'Java',
    description:
      '¡Java es ideal para ti! Perfecto para aplicaciones empresariales, Android y sistemas robustos. Su estructura y organización te darán bases sólidas.',
    bgClass: 'result-bg-java',
  },
}

export function Diagnostico() {
  const navigate = useNavigate()

  const [currentQuestion, setCurrentQuestion] = useState<number>(1)
  const [scores, setScores] = useState<Scores>({ python: 0, cpp: 0, java: 0 })
  const [finished, setFinished] = useState<boolean>(false)
  const [questionCount, setQuestionCount] = useState<number>(0)
  const [animKey, setAnimKey] = useState<number>(0)

  const handleAnswer = (answer: 'yes' | 'no') => {
    const node = GRAPH[currentQuestion]
    const nextQ = answer === 'yes' ? node.yes : node.no

    if (answer === 'yes') {
      const pts = getPoints(currentQuestion)
      setScores((prev) => ({
        python: prev.python + (pts.python ?? 0),
        cpp:    prev.cpp    + (pts.cpp    ?? 0),
        java:   prev.java   + (pts.java   ?? 0),
      }))
    }

    setQuestionCount((c) => c + 1)

    if (nextQ === -1) {
      setFinished(true)
    } else {
      setCurrentQuestion(nextQ)
      setAnimKey((k) => k + 1)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(1)
    setScores({ python: 0, cpp: 0, java: 0 })
    setFinished(false)
    setQuestionCount(0)
    setAnimKey((k) => k + 1)
  }

  const getWinner = (): Winner => {
    if (scores.python >= scores.cpp && scores.python >= scores.java) return 'python'
    if (scores.cpp >= scores.java) return 'cpp'
    return 'java'
  }

  if (finished) {
    const winner = getWinner()
    const info   = RESULT_INFO[winner]

    return (
      <div className={`page diagnostico-page result-page ${info.bgClass}`}>
        <div className="container">
          <div className="result-card animate-fadeIn">
            <div className="result-emoji">{info.emoji}</div>
            <p className="result-label">Tu lenguaje ideal es...</p>
            <h1 className="result-language">{info.name}</h1>
            <p className="result-description">{info.description}</p>

            <div className="result-scores">
              <span className="score-item score-python">🐍 Python: {scores.python} pts</span>
              <span className="score-item score-cpp">⚡ C++: {scores.cpp} pts</span>
              <span className="score-item score-java">☕ Java: {scores.java} pts</span>
            </div>

            <div className="result-actions">
              <button
                className="btn btn-result-primary"
                onClick={() => navigate('/aprender')}
              >
                Comenzar a aprender →
              </button>
              <button
                className="btn btn-result-secondary"
                onClick={handleRestart}
              >
                Repetir examen
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const block      = getBlock(currentQuestion)
  const blockLabel = BLOCK_LABELS[block]

  return (
    <div className="page diagnostico-page">
      <div className="page-header diagnostico-header">
        <div className="container">
          <h1>Examen Diagnóstico</h1>
          <p>Descubre tu lenguaje ideal</p>
        </div>
      </div>

      <div className="container diagnostico-container">
        <div className="scoreboard">
          <span className="score-pill score-pill-python">🐍 Python: {scores.python}</span>
          <span className="score-pill score-pill-cpp">⚡ C++: {scores.cpp}</span>
          <span className="score-pill score-pill-java">☕ Java: {scores.java}</span>
        </div>

        <p className="question-counter">Pregunta {questionCount} respondida</p>

        <div key={animKey} className={`question-card ${block} animate-fadeIn`}>
          <span className="block-badge">{blockLabel}</span>
          <div className="question-number">#{currentQuestion}</div>
          <p className="question-text">{QUESTIONS[currentQuestion]}</p>
        </div>

        <div className="answer-buttons">
          <button
            className="btn-answer btn-yes"
            onClick={() => handleAnswer('yes')}
          >
            ✓ Sí
          </button>
          <button
            className="btn-answer btn-no"
            onClick={() => handleAnswer('no')}
          >
            ✗ No
          </button>
        </div>
      </div>
    </div>
  )
}
