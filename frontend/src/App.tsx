import { useState } from "react";
import { RoleSelection } from "./components/RoleSelection";
import { LoginPage } from "./components/LoginPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { OrganizerDashboard } from "./components/OrganizerDashboard";
import { AdminDashboard } from "./components/AdminDashboard";

type Screen =
  | "role-selection"
  | "student-login"
  | "organizer-login"
  | "admin-login"
  | "student-dashboard"
  | "organizer-dashboard"
  | "admin-dashboard";

export type Role = "student" | "organizer" | "admin";

interface AuthState {
  token: string;
  role: Role;
}

function decodeRoleFromToken(token: string): Role | null {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson) as { role?: string };
    if (
      payload.role === "student" ||
      payload.role === "organizer" ||
      payload.role === "admin"
    ) {
      return payload.role;
    }
  } catch {

  }
  return null;
}

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const token = window.localStorage.getItem("authToken");
    const role = window.localStorage.getItem("authRole") as Role | null;
    return token && role ? { token, role } : null;
  });

  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    if (auth) {
      return `${auth.role}-dashboard` as Screen;
    }
    return "role-selection";
  });

  const [selectedRole, setSelectedRole] = useState<Role | null>(
    auth?.role ?? null,
  );

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setCurrentScreen(`${role}-login` as Screen);
  };

  const handleLoginSuccess = (token: string) => {
    const role = decodeRoleFromToken(token);
    if (!role) {
      return;
    }

    window.localStorage.setItem("authToken", token);
    window.localStorage.setItem("authRole", role);

    setAuth({ token, role });
    setCurrentScreen(`${role}-dashboard` as Screen);
  };

  const handleLogout = () => {
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("authRole");
    setAuth(null);
    setCurrentScreen("role-selection");
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {currentScreen === "role-selection" && (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      )}

      {currentScreen === "student-login" && (
        <LoginPage
          role="student"
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setCurrentScreen("role-selection")}
        />
      )}

      {currentScreen === "organizer-login" && (
        <LoginPage
          role="organizer"
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setCurrentScreen("role-selection")}
        />
      )}

      {currentScreen === "admin-login" && (
        <LoginPage
          role="admin"
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setCurrentScreen("role-selection")}
        />
      )}

      {currentScreen === "student-dashboard" && (
        <StudentDashboard onLogout={handleLogout} />
      )}

      {currentScreen === "organizer-dashboard" && (
        <OrganizerDashboard onLogout={handleLogout} />
      )}

      {currentScreen === "admin-dashboard" && (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}
