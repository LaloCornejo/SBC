import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { chatbotApi } from "../../services/api";
import "./Chatbot.css";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  language: string;
  level: string;
  sectionTitle: string | null;
  username: string;
}

const SUGGESTIONS = [
  { text: "¿Qué es una variable?", icon: "?" },
  { text: "Cómo resolver errores", icon: "!" },
  { text: "Tips de estudio", icon: "💡" },
  { text: "Ayuda con mi código", icon: "🔧" },
];

export function Chatbot({
  language,
  level,
  sectionTitle,
  username,
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente de aprendizaje. Estoy aquí para ayudarte con:\n- Conceptos de programación\n- Errores en tu código\n- Tips de estudio\n- Ejercicios\n\n¿En qué puedo ayudarte hoy?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input.trim(),
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatbotApi.sendMessage(
        input.trim(),
        language,
        level,
        sectionTitle,
        username,
      );

      if (res.success && res.data) {
        const botMessage: Message = {
          id: Date.now() + 1,
          text: res.data.response,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Lo siento, algo salió mal. Por favor intenta de nuevo.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = async (text: string) => {
    setInput(text);
    await new Promise((r) => setTimeout(r, 100));
    handleSend();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && <span className="chatbot-badge">1</span>}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <Bot size={24} />
            <div className="chatbot-header-info">
              <h3>Asistente</h3>
              <span className="chatbot-status">
                {language && level ? `${language} · ${level}` : "En línea"}
              </span>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-message ${msg.isBot ? "bot" : "user"}`}
              >
                <div className="message-icon">
                  {msg.isBot ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="message-content">
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-message bot">
                <div className="message-icon">
                  <Bot size={16} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!loading && messages.length === 1 && (
            <div className="chatbot-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-btn"
                  onClick={() => handleSuggestion(s.text)}
                >
                  <span className="suggestion-icon">{s.icon}</span>
                  {s.text}
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta..."
              rows={1}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Enviar"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
