import { Link } from "react-router-dom";
import {
  Code2,
  Sparkles,
  Zap,
  Target,
  BookOpen,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import "./styles.css";

export function Home() {
  const features = [
    {
      icon: Sparkles,
      title: "Aprendizaje Inteligente",
      description:
        "Sistema adaptativo que ajusta el contenido según tu ritmo y estilo de aprendizaje.",
    },
    {
      icon: Zap,
      title: "Práctica en Tiempo Real",
      description:
        "Ejecuta código directamente en el navegador con retroalimentación instantánea.",
    },
    {
      icon: Target,
      title: "Seguimiento de Progreso",
      description:
        "Visualiza tu avance con estadísticas detalladas y metas personalizadas.",
    },
    {
      icon: BookOpen,
      title: "Contenido Estructurado",
      description:
        "Lecciones organizadas desde nivel principiante hasta avanzado.",
    },
  ];

  return (
    <div className="page home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Sistema Inteligente de Aprendizaje</span>
            </div>

            <h1 className="hero-title">
              Aprende a programar con
              <span className="gradient-text">
                {" "}
                sistemas basados en conocimiento
              </span>
            </h1>

            <p className="hero-description">
              Aprender++ es una plataforma educativa que utiliza sistemas
              basados en conocimiento para personalizar tu experiencia de
              aprendizaje en programación Python, C++ y mucho mas.
            </p>

            <div className="hero-actions">
              <Link to="/aprender" className="btn btn-primary btn-lg">
                <PlayCircle size={20} />
                <span>Comenzar a Aprender</span>
              </Link>
              <Link to="/acerca" className="btn btn-secondary btn-lg">
                <span>Conocer Más</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">¿Por qué Aprender++?</h2>
            <p className="section-subtitle">
              Una plataforma diseñada para hacer del aprendizaje de programación
              una experiencia personalizada y efectiva.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="feature-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="feature-icon">
                    <Icon size={28} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <Code2 size={48} className="cta-icon" />
              <h2 className="cta-title">¿Listo para comenzar?</h2>
              <p className="cta-description">
                Únete a Aprender++ y descubre una nueva forma de aprender
                programación adaptada a tus necesidades.
              </p>
              <Link to="/aprender" className="btn btn-primary btn-lg">
                <span>Empezar Ahora</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
