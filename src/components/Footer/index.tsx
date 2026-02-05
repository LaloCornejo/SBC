import { Code2, Heart } from "lucide-react";
import "./styles.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <Code2 size={24} className="footer-icon" />
            <span className="footer-brand-text">Aprender++</span>
          </div>

          <div className="footer-info">
            <p className="footer-text">6to semestre, Grupo 1</p>
            <p className="footer-copyright">
              © {currentYear} Aprender++. Todos los derechos reservados.
            </p>
          </div>

          <div className="footer-made">
            <span>Chinga tu madre Seinbaum</span>
            <Heart size={16} className="heart-icon" />
          </div>
        </div>
      </div>
    </footer>
  );
}
