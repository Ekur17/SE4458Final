import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo">Doktor Takvimi</h1>
        <ul className="navbar-links">
          <li>
            <Link to="/">Ana Sayfa</Link>
          </li>
          <li>
            <Link to="/doctors">Doktorlar</Link>
          </li>
          {user ? (
            <>
              <li>
                <span className="user-name">{user.displayName}</span>
              </li>
              <li>
                <button onClick={logout} className="logout-btn">
                  Çıkış Yap
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Giriş Yap</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
