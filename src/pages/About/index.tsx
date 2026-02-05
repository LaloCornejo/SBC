import {
  Users,
  GraduationCap,
  Building2,
  Lightbulb,
  Code2,
} from "lucide-react";
import "./styles.css";

export function About() {
  const teamMembers = [
    {
      name: "Hernández Franco",
      lastName: "Brandom Galder",
      role: "Disenador",
    },
    {
      name: "Manzanilla Hornung",
      lastName: "Mauricio Daniel",
      role: "Lider de projecto",
    },
    {
      name: "Orta Escobar",
      lastName: "Felipe de Jesús",
      role: "Ni idea",
    },
    {
      name: "Cornejo Clavel",
      lastName: "Jesús Eduardo",
      role: "Programador",
    },
  ];

  const projectInfo = [
    {
      icon: Building2,
      title: "Institución",
      description: "Universidad Autónoma del Estado de Hidalgo (UAEH)",
    },
    {
      icon: GraduationCap,
      title: "Semestre y Grupo",
      description: "6to semestre, Grupo 1",
    },
    {
      icon: Lightbulb,
      title: "Proyecto",
      description: "Sistema Inteligente de Aprendizaje de Programación",
    },
    {
      icon: Code2,
      title: "Tecnología",
      description: "Python + React + Sistemas Basados en Conocimiento",
    },
  ];

  return (
    <div className="page about-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Acerca de Nosotros</h1>
          <p>Conoce al equipo detrás de Aprender++</p>
        </div>
      </div>

      <div className="container">
        {/* Project Info Cards */}
        <section className="info-section">
          <div className="info-grid">
            {projectInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="info-card">
                  <div className="info-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="info-title">{info.title}</h3>
                  <p className="info-description">{info.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* About Project */}
        <section className="about-project">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">Sobre el Proyecto</h2>
              <p>
                <strong>Aprender++</strong> es un sistema inteligente de tutoría
                diseñado para facilitar el aprendizaje de programación,
                específicamente en Python. Utilizando sistemas basados en
                conocimiento, el sistema adapta el contenido y la dificultad
                según el progreso y estilo de aprendizaje de cada estudiante.
              </p>
              <p>
                Este proyecto fue desarrollado como parte del programa académico
                del Instituto de Ciencias Básicas e Ingeniería (ICBI) de la
                Universidad Autónoma del Estado de Hidalgo, con el objetivo de
                explorar las capacidades de los sistemas tutores inteligentes en
                la educación tecnológica.
              </p>
            </div>
            <div className="about-stats">
              <div className="stat-card">
                <span className="stat-number">4</span>
                <span className="stat-label">Integrantes</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">1na</span>
                <span className="stat-label">hueva</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">0</span>
                <span className="stat-label">Ganas</span>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <div className="section-header">
            <div className="section-icon">
              <Users size={32} />
            </div>
            <h2 className="section-title">Nuestro Equipo</h2>
          </div>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="team-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="team-avatar">
                  <span className="avatar-initials">
                    {member.name.charAt(0)}
                    {member.lastName.charAt(0)}
                  </span>
                </div>
                <div className="team-info">
                  <h3 className="team-name">{member.name}</h3>
                  <h4 className="team-lastname">{member.lastName}</h4>
                  <span className="team-role">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Institution Logos */}
        <section className="institution-section">
          <div className="institution-logos">
            <div className="institution-card">
              <img
                src="/icbi.png"
                alt="ICBI - Instituto de Ciencias Básicas e Ingeniería"
                className="institution-logo-img"
              />
            </div>
            <div className="institution-card">
              <img
                src="/uaeh.png"
                alt="UAEH - Universidad Autónoma del Estado de Hidalgo"
                className="institution-logo-img"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
