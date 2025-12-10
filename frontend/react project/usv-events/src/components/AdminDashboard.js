import React from "react";
import "./Dashboard.css";

export default function AdminDashboard({ onLogout }) {
  return (
    <div className="dashboard-container">
      <header className="topbar">
        <div className="title">USV Events</div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </header>

      <h2 className="section-title">Panou Admin</h2>

      <div className="card-grid">
        <div className="card">🧑‍🎓 Gestionare studenți</div>
        <div className="card">📅 Gestionare organizatori</div>
        <div className="card">⚙ Setări platformă</div>
      </div>
    </div>
  );
}
