import { useEffect, useMemo, useState } from "react";
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

type AdminTab = "overview" | "evenimente" | "utilizatori";

interface DashboardEventSummary {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  status: string;
  category_name?: string | null;
  location_name?: string | null;
}

interface AdminDashboardResponse {
  total_users: number;
  total_events: number;
  total_registrations: number;
  upcoming_events_count: number;
  upcoming_events: DashboardEventSummary[];
}

// Matches EventRead from backend (extended with organizer_name)
interface ApiEvent {
  id: string;
  title: string;
  description?: string | null;
  start_at: string;
  end_at: string;
  status: string;
  organizer_id: string;
  organizer_name?: string | null;
  location?: string | null;
  category?: string | null;
  max_participants?: number | null;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [dashboardData, setDashboardData] = useState<
    AdminDashboardResponse | null
  >(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventsSearch, setEventsSearch] = useState("");

  const [eventActionLoadingId, setEventActionLoadingId] = useState<string | null>(
    null,
  );

  const pendingApprovals = 0; // still a placeholder, can be wired later

  // ---- API calls ----

  const loadCurrentUser = async () => {
    try {
      const user = await apiFetch<CurrentUser>("/auth/me");
      setCurrentUser(user);
    } catch (err) {
      console.error("Nu s-a putut încărca utilizatorul curent", err);
    }
  };

  const loadDashboard = async () => {
    try {
      setDashboardLoading(true);
      setDashboardError(null);

      const data = await apiFetch<AdminDashboardResponse>("/dashboard/admin");
      setDashboardData(data);
    } catch (err: any) {
      console.error(err);
      setDashboardError(
        err?.message || "Nu s-au putut încărca statisticile administratorului.",
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      setEventsError(null);

      const data = await apiFetch<ApiEvent[]>("/events?upcoming_only=false");
      setEvents(data);
    } catch (err: any) {
      console.error(err);
      setEventsError(
        err?.message || "Nu s-a putut încărca lista de evenimente.",
      );
    } finally {
      setEventsLoading(false);
    }
  };

  const reloadAll = async () => {
    await Promise.all([loadDashboard(), loadEvents()]);
  };

  useEffect(() => {
    reloadAll();
    loadCurrentUser();
  }, []);

  // ---- Event actions (admin) ----

  const toggleEventStatus = async (event: ApiEvent) => {
    const newStatus = event.status === "published" ? "draft" : "published";
    try {
      setEventActionLoadingId(event.id);
      await apiFetch(`/events/${event.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      await reloadAll();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Nu s-a putut actualiza statusul evenimentului.");
    } finally {
      setEventActionLoadingId(null);
    }
  };

  const deleteEvent = async (event: ApiEvent) => {
    if (
      !window.confirm(
        `Ești sigur că vrei să ștergi evenimentul "${event.title}"? Această acțiune nu poate fi anulată.`,
      )
    ) {
      return;
    }

    try {
      setEventActionLoadingId(event.id);
      await apiFetch(`/events/${event.id}`, {
        method: "DELETE",
      });
      await reloadAll();
    } catch (err: any) {
      console.error(err);
      alert("Nu s-a putut șterge evenimentul.");
    } finally {
      setEventActionLoadingId(null);
    }
  };

  // ---- Derived UI data ----

  const filteredEvents = useMemo(() => {
    const term = eventsSearch.trim().toLowerCase();
    if (!term) return events;
    return events.filter((e) => e.title.toLowerCase().includes(term));
  }, [events, eventsSearch]);

  const totalEvents = dashboardData?.total_events ?? events.length;
  const totalUsers = dashboardData?.total_users ?? 0;
  const totalRegistrations = dashboardData?.total_registrations ?? 0;
  const upcomingEventsCount = dashboardData?.upcoming_events_count ?? 0;

  const displayRole =
    currentUser?.role === "admin"
      ? "Administrator"
      : currentUser?.role ?? "Administrator";

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white flex flex-col">
        <div className="px-6 py-4 border-b border-indigo-600">
          <h1 className="text-lg font-semibold tracking-tight">USV Events</h1>
          <p className="text-indigo-200 text-sm mt-1">{displayRole}</p>
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
              {dashboardLoading && (
                <p className="text-gray-600 text-sm mb-4">
                  Se încarcă statisticile...
                </p>
              )}
              {dashboardError && !dashboardLoading && (
                <p className="text-red-600 text-sm mb-4">{dashboardError}</p>
              )}

              {/* Stats cards */}
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
                    {totalEvents}
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
                    {totalUsers}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    Total înscrieri
                  </p>
                  <p className="text-gray-800 text-xl font-semibold">
                    {totalRegistrations}
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
                    {upcomingEventsCount}
                  </p>
                </div>
              </div>

              {/* Recent / Upcoming events activity */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-gray-800 mb-4 font-semibold text-sm">
                  Activitate recentă / Evenimente viitoare
                </h3>
                {dashboardData?.upcoming_events?.length ? (
                  <div className="space-y-3">
                    {dashboardData.upcoming_events.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100"
                      >
                        <div>
                          <p className="text-gray-800 text-sm">
                            {e.title}{" "}
                            <span className="text-gray-500 text-xs">
                              ({e.status})
                            </span>
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(e.start_at).toLocaleString("ro-RO", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            • {e.location_name ?? "Locație nespecificată"}
                          </p>
                          {e.category_name && (
                            <p className="text-gray-400 text-[11px] mt-0.5">
                              Categoria: {e.category_name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Nu există evenimente viitoare înregistrate.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "evenimente" && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6 gap-4">
                <h3 className="text-gray-800 font-semibold text-sm">
                  Toate evenimentele
                </h3>
                <input
                  type="text"
                  placeholder="Caută evenimente..."
                  value={eventsSearch}
                  onChange={(e) => setEventsSearch(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                />
              </div>

              {eventsLoading && (
                <p className="text-gray-600 text-sm text-center">
                  Se încarcă lista de evenimente...
                </p>
              )}
              {eventsError && !eventsLoading && (
                <p className="text-red-600 text-sm text-center">{eventsError}</p>
              )}

              {!eventsLoading && !eventsError && filteredEvents.length === 0 && (
                <p className="text-gray-600 text-sm text-center">
                  Nu s-au găsit evenimente.
                </p>
              )}

              {!eventsLoading && !eventsError && filteredEvents.length > 0 && (
                <div className="space-y-3">
                  {filteredEvents.map((event) => {
                    const isPublished = event.status === "published";
                    const isBusy = eventActionLoadingId === event.id;
                    const organizerDisplay =
                      event.organizer_name ?? event.organizer_id;

                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between py-4 border-b border-gray-100"
                      >
                        <div>
                          <p className="text-gray-800 text-sm">
                            {event.title}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Organizator: {organizerDisplay}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(event.start_at).toLocaleString("ro-RO", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            • {event.location ?? "Locație nespecificată"}
                          </p>
                          {event.category && (
                            <p className="text-gray-400 text-[11px] mt-0.5">
                              Categoria: {event.category}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleEventStatus(event)}
                            disabled={isBusy}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                              isPublished
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            } disabled:opacity-60`}
                          >
                            {isBusy
                              ? "..."
                              : isPublished
                              ? "Activ"
                              : "Draft"}
                          </button>
                          <button
                            onClick={() => deleteEvent(event)}
                            disabled={isBusy}
                            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium disabled:opacity-60"
                          >
                            Șterge
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "utilizatori" && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-800 font-semibold text-sm">
                  Toți utilizatorii
                </h3>
                <input
                  type="text"
                  placeholder="Caută utilizatori... (de implementat)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                  disabled
                />
              </div>
              {/* You can wire this later to a /users endpoint */}
              <p className="text-gray-500 text-sm">
                Gestionarea utilizatorilor nu este încă conectată la backend.
                Vei putea adăuga aici o listă reală atunci când vei crea un
                endpoint pentru utilizatori (ex: <code>/users</code>).
              </p>
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
                  {currentUser?.name ?? "Utilizator"}
                </h4>
                <p className="text-gray-600 text-sm">
                  {displayRole || "Administrator"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
