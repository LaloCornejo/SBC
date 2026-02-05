import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Learning } from './pages/Learning'
import { Profile } from './pages/Profile'
import './styles/app.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aprender" element={<Learning />} />
          <Route path="/acerca" element={<About />} />
          <Route path="/perfil" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
