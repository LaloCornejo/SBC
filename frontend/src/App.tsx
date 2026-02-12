import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Learning } from "./pages/Learning";
import { Profile } from "./pages/Profile";
import { Login } from "./pages";
import "./styles/app.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("t"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("t"));
    };

    window.addEventListener("storage", handleStorageChange);
    
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("t");
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  const isLoggedIn = !!token;

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/aprender"
            element={isLoggedIn ? <Learning /> : <Navigate to="/login" />}
          />
          <Route path="/acerca" element={<About />} />
          <Route
            path="/perfil"
            element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
