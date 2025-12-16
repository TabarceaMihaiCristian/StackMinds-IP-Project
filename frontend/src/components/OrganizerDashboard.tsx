import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  LogOut,
  Bell,
  User,
  Plus,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { apiFetch } from "../api/client";

interface OrganizerDashboardProps {
  onLogout: () => void;
}

interface Event {
  id: string;
  name: string;
  date: string; // formatted date, e.g. "15 decembrie 2025"
  participants: number;
  location: string;
  description: string;
}

// Matches what /dashboard/organizer likely returns for each upcoming event
interface DashboardEventSummary {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location_name?: string | null;
  category_name?: string | null;
  registrations_count?: number;
  description?: string | null;
}

interface OrganizerDashboardResponse {
  my_events_count: number;
  my_upcoming_events_count: number;
  total_registrations_for_my_events: number;
  upcoming_events: DashboardEventSummary[];
}

export function OrganizerDashboard({ onLogout }: OrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"evenimente" | "participanti">(
    "evenimente",
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const currentUser = {
    name: "Maria Ionescu",
    role: "Organizator",
  };

  // ---- Load organizer dashboard from backend ----

  const mapDashboardEventToEvent = (e: DashboardEventSummary): Event => {
    const startDate = new Date(e.start_at);
    const formattedDate = startDate.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      id: e.id,
      name: e.title,
      date: formattedDate,
      participants: e.registrations_count ?? 0,
      location: e.location_name ?? "Nespecificat",
      description: e.description ?? "",
    };
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoadingDashboard(true);
        setDashboardError(null);

        const data = await apiFetch<OrganizerDashboardResponse>(
          "/dashboard/organizer",
        );

        const mappedEvents = data.upcoming_events.map(mapDashboardEventToEvent);
        setEvents(mappedEvents);
      } catch (err: any) {
        setDashboardError(
          err?.message || "Nu s-au putut încărca evenimentele organizatorului",
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    loadDashboard();
  }, []);

  // ---- Local UI handlers (still operating on local state) ----

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedEvent) {
      // TODO: Call DELETE /events/{id} on backend before updating UI
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
      setShowDeleteConfirm(false);
      setSelectedEvent(null);
    }
  };

  const saveEdit = () => {
    if (selectedEvent) {
      // TODO: Call PUT /events/{id} on backend with updated data
      setEvents((prev) =>
        prev.map((e) => (e.id === selectedEvent.id ? selectedEvent : e)),
      );
      setShowEditModal(false);
      setSelectedEvent(null);
    }
  };

  const showParticipants = (event: Event) => {
    setSelectedEvent(event);
    setActiveTab("participanti");
    // TODO: Optionally fetch real participants:
    // await apiFetch(`/registrations/events/${event.id}/registrations`);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white flex flex-col">
        <div className="px-6 py-4 border-b border-indigo-600">
          <h1 className="text-lg font-semibold tracking-tight">USV Events</h1>
          <p className="text-indigo-200 text-sm mt-1">Organizer</p>
        </div>

        <nav className="flex-1 px-4 py-6">
          <button
            onClick={() => setActiveTab("evenimente")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === "evenimente"
                ? "bg-indigo-600"
                : "hover:bg-indigo-600"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Evenimentele mele</span>
          </button>

          <button
            onClick={() => setActiveTab("participanti")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === "participanti"
                ? "bg-indigo-600"
                : "hover:bg-indigo-600"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Participanți</span>
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
            {activeTab === "evenimente" && "Evenimentele mele"}
            {activeTab === "participanti" && "Participanți"}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
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
          {activeTab === "evenimente" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 text-sm">
                  Gestionează evenimentele tale
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition-colors text-sm font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Creează eveniment
                </button>
              </div>

              {loadingDashboard && (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-600 text-sm">
                  Se încarcă evenimentele...
                </div>
              )}

              {dashboardError && !loadingDashboard && (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center text-red-600 text-sm">
                  {dashboardError}
                </div>
              )}

              {!loadingDashboard && !dashboardError && (
                <div className="grid grid-cols-1 gap-6">
                  {events.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-600 text-sm">
                      Nu ai niciun eveniment creat încă.
                    </div>
                  ) : (
                    events.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white p-6 rounded-lg shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-gray-800 mb-2 font-semibold">
                              {event.name}
                            </h3>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-600">📅 {event.date}</p>
                              <p className="text-gray-600">
                                📍 {event.location}
                              </p>
                              <button
                                onClick={() => showParticipants(event)}
                                className="text-indigo-700 hover:underline"
                              >
                                👥 {event.participants} participanți înregistrați
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Editează
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event)}
                              className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Șterge
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "participanti" && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              {selectedEvent ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-gray-800 mb-2 font-semibold">
                      {selectedEvent.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Total participanți: {selectedEvent.participants}
                    </p>
                  </div>

                  {/* Still using dummy participants list for now */}
                  <div className="space-y-3">
                    {Array.from(
                      { length: selectedEvent.participants || 0 },
                      (_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-3 border-b border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-indigo-700" />
                            </div>
                            <div>
                              <p className="text-gray-800 text-sm">
                                Student {i + 1}
                              </p>
                              <p className="text-gray-500 text-xs">
                                student{i + 1}@usv.ro
                              </p>
                            </div>
                          </div>
                          <span className="text-green-700 text-xs bg-green-100 px-3 py-1 rounded">
                            Confirmat
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center text-sm">
                  Selectează un eveniment pentru a vedea participanții
                </p>
              )}
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

      {/* Create Event Modal (still local-only; TODO: wire to POST /events) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3>Creează eveniment nou</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-indigo-600 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Nume eveniment
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                  placeholder="Ex: Conferința IT 2025"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Data evenimentului
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Locație
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                  placeholder="Ex: Sala A1"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Descriere
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                  rows={4}
                  placeholder="Descrie evenimentul..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Anulează
                </button>
                <button
                  onClick={() => {
                    // TODO: Call POST /events here with form data, then reload dashboard
                    setShowCreateModal(false);
                  }}
                  className="flex-1 bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition-colors text-sm font-medium"
                >
                  Creează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3>Editează eveniment</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedEvent(null);
                }}
                className="p-1 hover:bg-indigo-600 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Nume eveniment
                </label>
                <input
                  type="text"
                  value={selectedEvent.name}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Data evenimentului
                </label>
                <input
                  type="text"
                  value={selectedEvent.date}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Locație
                </label>
                <input
                  type="text"
                  value={selectedEvent.location}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Descriere
                </label>
                <textarea
                  value={selectedEvent.description}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none text-sm"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Anulează
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition-colors text-sm font-medium"
                >
                  Salvează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-gray-800 mb-4 font-semibold">
                Șterge eveniment
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Ești sigur că vrei să ștergi evenimentul "
                <span className="font-medium">{selectedEvent.name}</span>"?
                Această acțiune nu poate fi anulată.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Anulează
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Șterge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
