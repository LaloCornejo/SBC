import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, BookOpen, Users, User, Code2, LogOut } from 'lucide-react'
import './styles.css'

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const token = localStorage.getItem('t')

  const handleLogout = () => {
    localStorage.removeItem('t')
    localStorage.removeItem('u')
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/aprender', label: 'Aprender', icon: BookOpen },
    { path: '/acerca', label: 'Acerca de', icon: Users },
    { path: '/perfil', label: 'Perfil', icon: User },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logos">
          <div className="logo-icbi">
            <img
              src="/icbi.png"
              alt="ICBI"
              className="logo-img icbi"
            />
          </div>
          <div className="logo-uaeh">
            <img
              src="/uaeh.png"
              alt="UAEH"
              className="logo-img uaeh"
            />
          </div>
        </div>

        <Link to="/" className="navbar-brand">
          <Code2 className="brand-icon" size={28} />
          <span className="brand-text">Aprender<span className="brand-plus">++</span></span>
        </Link>

        <ul className="navbar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
          {token && (
            <li className="nav-item">
              <button onClick={handleLogout} className="nav-link logout-btn">
                <LogOut size={20} />
                <span>Salir</span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}
