import React from "react";
import "./Dashboard.css";

export default function OrganizerDashboard({ onLogout }) {
  return (
    <div className="dashboard-container">
      <header className="topbar">
        <div className="title">USV Events</div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </header>

      <h2 className="section-title">Panou Organizator</h2>

      <div className="card-grid">
        <div className="card">➕ Creează eveniment</div>
        <div className="card">📊 Gestionare evenimente</div>
        <div className="card">🧾 Lista participanților</div>
      </div>
    </div>
  );
}
