import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  LogOut,
  Bell,
  User,
  BarChart3,
  Shield,
  X,
} from "lucide-react";
import { apiFetch } from "../api/client";

interface AdminDashboardProps {
  onLogout: () => void;
}

// Matches what /dashboard/admin likely returns
interface AdminDashboardResponse {
  total_users: number;
  total_events: number;
  total_registrations: number;
  upcoming_events_count: number;
}

interface AdminStats {
  totalEvents: number;
  totalUsers: number;
  totalRegistrations: number;
  upcomingEvents: number;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "evenimente" | "utilizatori">(
    "overview",
  );
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [stats, setStats] = useState<AdminStats>({
    totalEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const currentUser = {
    name: "Admin Principal",
    role: "Administrator",
  };

  // Load admin dashboard stats from backend
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        setStatsError(null);

        const data = await apiFetch<AdminDashboardResponse>("/dashboard/admin");

        setStats({
          totalEvents: data.total_events,
          totalUsers: data.total_users,
          totalRegistrations: data.total_registrations,
          upcomingEvents: data.upcoming_events_count,
        });
      } catch (err: any) {
        setStatsError(
          err?.message ||
            "Nu s-au putut încărca statisticile panoului de administrare",
        );
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white flex flex-col">
        <div className="px-6 py-4 border-b border-indigo-600">
          <h1 className="text-lg font-semibold tracking-tight">USV Events</h1>
          <p className="text-indigo-200 text-sm mt-1">Administrator</p>
        </div>

        <nav className="flex-1 px-4 py-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === "overview"
                ? "bg-indigo-600"
                : "hover:bg-indigo-600"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Statistici</span>
          </button>

          <button
            onClick={() => setActiveTab("evenimente")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === "evenimente"
                ? "bg-indigo-600"
                : "hover:bg-indigo-600"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Gestionare evenimente</span>
          </button>

          <button
            onClick={() => setActiveTab("utilizatori")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === "utilizatori"
                ? "bg-indigo-600"
                : "hover:bg-indigo-600"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Utilizatori</span>
          </button>
        </nav>

        <div className="p-4 border-t border-indigo-600">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <h2 className="text-gray-800 text-lg font-semibold">
            {activeTab === "overview" && "Panou de control"}
            {activeTab === "evenimente" && "Gestionare evenimente"}
            {activeTab === "utilizatori" && "Gestionare utilizatori"}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              {stats.upcomingEvents > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {stats.upcomingEvents}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowUserDropdown((prev) => !prev)}
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 top-12 bg-white border border-gray-200 shadow-lg rounded-lg w-48 z-50">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowProfileModal(true);
                    }}
                    className="block px-4 py-3 text-gray-800 hover:bg-gray-100 w-full text-left text-sm"
                  >
                    Profilul meu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === "overview" && (
            <div>
              {loadingStats && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8 text-center text-gray-600 text-sm">
                  Se încarcă statisticile...
                </div>
              )}

              {statsError && !loadingStats && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8 text-center text-red-600 text-sm">
                  {statsError}
                </div>
              )}

              {!loadingStats && !statsError && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        Total evenimente
                      </p>
                      <p className="text-gray-800 text-xl font-semibold">
                        {stats.totalEvents}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        Total utilizatori
                      </p>
                      <p className="text-gray-800 text-xl font-semibold">
                        {stats.totalUsers}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        Înscrieri totale
                      </p>
                      <p className="text-gray-800 text-xl font-semibold">
                        {stats.totalRegistrations}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Bell className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        Evenimente viitoare
                      </p>
                      <p className="text-gray-800 text-xl font-semibold">
                        {stats.upcomingEvents}
                      </p>
                    </div>
                  </div>

                  {/* Still static for now – you can later wire this to an activity log endpoint if you add one */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-800 mb-4 font-semibold">
                      Activitate recentă
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <p className="text-gray-800 text-sm">
                            Eveniment nou creat: &quot;Hackathon de Iarnă&quot;
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Acum 2 ore
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <p className="text-gray-800 text-sm">
                            Utilizator nou înregistrat:
                            ion.popescu@student.ro
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Acum 5 ore
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-gray-800 text-sm">
                            Cerere de organizator de la
                            maria.ionescu@org.ro
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Acum 1 zi
                          </p>
                        </div>
                        <button className="bg-indigo-700 text-white px-4 py-1 rounded text-sm hover:bg-indigo-800 transition-colors">
                          Revizuiește
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "evenimente" && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-800 font-semibold">
                  Toate evenimentele
                </h3>
                <input
                  type="text"
                  placeholder="Caută evenimente..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                />
              </div>
              <div className="space-y-3">
                {/* TODO: Înlocuiește conținutul static cu date reale din /events atunci când expui acel endpoint */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <p className="text-gray-800 text-sm">
                      Conferința IT 2025
                    </p>
                    <p className="text-gray-500 text-xs">
                      Organizator: Tech Club
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium">
                      Activ
                    </button>
                    <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium">
                      Șterge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "utilizatori" && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-800 font-semibold">Toți utilizatorii</h3>
                <input
                  type="text"
                  placeholder="Caută utilizatori..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                />
              </div>
              <div className="space-y-3">
                {/* TODO: Înlocuiește conținutul static cu date reale din /users atunci când expui acel endpoint */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <p className="text-gray-800 text-sm">Ion Popescu</p>
                    <p className="text-gray-500 text-xs">
                      ion.popescu@student.ro • Student
                    </p>
                  </div>
                  <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors text-xs font-medium">
                    Vizualizează
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="font-semibold">Profilul meu</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 hover:bg-indigo-600 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-indigo-700" />
                </div>
                <h4 className="text-gray-800 text-center font-medium">
                  {currentUser.name}
                </h4>
                <p className="text-gray-600 text-sm">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
