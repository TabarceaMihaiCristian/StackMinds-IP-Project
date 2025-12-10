// src/components/StudentDashboard.js
import React from "react";
import "./Dashboard.css";

export default function StudentDashboard({ onLogout, onNavigateToCalendar }) {
  return (
    <div className="dashboard-container">
      <header className="topbar">
        <div className="title">USV Events</div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </header>

      <h2 className="section-title">Panou Student</h2>

      <div className="card-grid">
        <div 
          className="card" 
          style={{ cursor: "pointer" }}
          onClick={onNavigateToCalendar}
        >
          📅 Evenimente disponibile
        </div>
        <div className="card">⭐ Evenimente înscrise</div>
        <div className="card">👤 Profil</div>
      </div>
    </div>
  );
}