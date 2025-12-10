// src/App.js
import React, { useState } from "react";
import RoleSelection from "./components/RoleSelection";
import LoginPage from "./components/LoginPage";
import StudentDashboard from "./components/StudentDashboard";
import OrganizerDashboard from "./components/OrganizerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import CalendarPage from "./components/CalendarPage"; 

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("role-selection");
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentScreen(`${role}-login`);
  };

  const handleLogin = () => {
    if (selectedRole) {
      setCurrentScreen(`${selectedRole}-dashboard`);
    }
  };

  const handleLogout = () => {
    setCurrentScreen('role-selection');
    setSelectedRole(null);
  };

  // Funcție pentru a naviga la calendar
  const navigateToCalendar = () => {
    setCurrentScreen("calendar");
  };

  // Funcție pentru a reveni la dashboard-ul curent
  const backFromCalendar = () => {
    if (selectedRole) {
      setCurrentScreen(`${selectedRole}-dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {currentScreen === 'role-selection' && (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      )}
      
      {currentScreen === 'student-login' && (
        <LoginPage 
          role="student" 
          onLogin={handleLogin} 
          onBack={() => setCurrentScreen('role-selection')} 
        />
      )}
      
      {currentScreen === 'organizer-login' && (
        <LoginPage 
          role="organizer" 
          onLogin={handleLogin} 
          onBack={() => setCurrentScreen('role-selection')} 
        />
      )}
      
      {currentScreen === 'admin-login' && (
        <LoginPage 
          role="admin" 
          onLogin={handleLogin} 
          onBack={() => setCurrentScreen('role-selection')} 
        />
      )}
      
      {currentScreen === 'student-dashboard' && (
        <StudentDashboard 
          onLogout={handleLogout} 
          onNavigateToCalendar={navigateToCalendar} 
        />
      )}
      
      {currentScreen === 'organizer-dashboard' && (
        <OrganizerDashboard onLogout={handleLogout} />
      )}
      
      {currentScreen === 'admin-dashboard' && (
        <AdminDashboard onLogout={handleLogout} />
      )}
      
      {currentScreen === 'calendar' && (
        <CalendarPage onBack={backFromCalendar} />
      )}
    </div>
  );
}