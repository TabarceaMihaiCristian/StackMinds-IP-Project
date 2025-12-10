import React from "react";
import "./RoleSelection.css";

export default function RoleSelection({ onRoleSelect }) {
  return (
    <div className="role-container">
      <header className="topbar">
        <div className="title">USV Events</div>
      </header>

      <h2 className="select-title">Selectează un rol</h2>

      <div className="roles">
        <div className="role-card" onClick={() => onRoleSelect("student")}>
          🎓
          <p>Student</p>
        </div>

        <div className="role-card" onClick={() => onRoleSelect("organizer")}>
          👥
          <p>Organizator</p>
        </div>

        <div className="role-card" onClick={() => onRoleSelect("admin")}>
          🛡️
          <p>Admin</p>
        </div>
      </div>
    </div>
  );
}
