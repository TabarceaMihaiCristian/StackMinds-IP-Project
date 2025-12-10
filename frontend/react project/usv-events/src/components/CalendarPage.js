// src/components/CalendarPage.js
import React from "react";
import "./Dashboard.css";

export default function CalendarPage({ onBack }) {
  return (
    <div className="dashboard-container">
      <header className="topbar">
        <div className="title">USV Events - Calendar</div>
        <button className="logout-btn" onClick={onBack}>Înapoi</button>
      </header>

      <h2 className="section-title">Calendar Evenimente</h2>
      
      <div className="card-grid">
        <div className="card">📅 Eveniment 1 - 10.12.2024</div>
        <div className="card">📅 Eveniment 2 - 15.12.2024</div>
        <div className="card">📅 Eveniment 3 - 20.12.2024</div>
      </div>
    </div>
  );
}