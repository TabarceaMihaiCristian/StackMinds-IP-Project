import React, { useState } from "react";
import "./LoginPage.css";

export default function LoginPage({ role, onLogin, onBack }) {
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");

  return (
    <div className="login-container">

      <header className="topbar">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="title">USV Events</div>
      </header>

      <div className="login-box">
        <h2 className="login-role">
          {role === "student" ? "🎓 Student" : ""}
          {role === "organizer" ? "👥 Organizator" : ""}
          {role === "admin" ? "🛡️ Admin" : ""}
        </h2>

        <label>Nume utilizator</label>
        <input 
          type="text"
          placeholder="Introduceți numele"
          value={username}
          onChange={(e) => setUser(e.target.value)}
        />

        <label>Parola</label>
        <input 
          type="password"
          placeholder="Introduceți parola"
          value={password}
          onChange={(e) => setPass(e.target.value)}
        />

        <button className="login-btn" onClick={onLogin}>
          Login
        </button>
      </div>
    </div>
  );
}
