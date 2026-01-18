import { useEffect, useState } from "react";
import { Calendar, Users, LogOut, User, Plus, Edit, Trash2, X } from "lucide-react";
import { apiFetch } from "../api/client";

interface OrganizerDashboardProps {
  onLogout: () => void;
}

interface Event {
  id: string;
  name: string;

  // for display
  displayDate: string; // "18 decembrie 2025"

  // for edits
  date: string;        // "YYYY-MM-DD"
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"

  participants: number;
  location: string;
  description: string;

  category?: string | null;
  max_participants?: number | null;
}

// Matches what /dashboard/organizer returns for each upcoming event
interface DashboardEventSummary {
  id: string;
  title: string;
  description?: string | null;
  start_at: string;
  end_at: string;
  location_name?: string | null;
  category_name?: string | null;
  location?: string | null;
  category?: string | null;
  registrations_count?: number;
  max_participants?: number | null;
}

interface OrganizerDashboardResponse {
  my_events_count: number;
  my_upcoming_events_count: number;
  total_registrations_for_my_events: number;
  upcoming_events: DashboardEventSummary[];
}

interface CreateEventForm {
  name: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  location: string;
  category: string;
  maxParticipants: string;
  description: string;
}

interface EditEventForm {
  name: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  location: string;
  description: string;
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

interface EventRegistration {
  id: string;
  user_id: string;
  user_name: string;
  event_id: string;
  status: string; // "registered" | "canceled" | ...
  created_at: string;
  updated_at: string;
}

// --- helpers for local date/time formatting ---

const toDateInputValue = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeInputValue = (d: Date) => {
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// build a *local* datetime string without timezone offset issues
const buildLocalDateTime = (dateStr: string, timeStr: string) =>
  `${dateStr}T${timeStr}:00`;

export function OrganizerDashboard({ onLogout }: OrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"evenimente" | "participanti">("evenimente");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [originalEvent, setOriginalEvent] = useState<Event | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPendingApprovalModal, setShowPendingApprovalModal] = useState(false);

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CreateEventForm>({
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    category: "",
    maxParticipants: "",
    description: "",
  });

  const [editForm, setEditForm] = useState<EditEventForm | null>(null);

  const [createSaving, setCreateSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // participants state for selected event
  const [participants, setParticipants] = useState<EventRegistration[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);

  // ---- Helpers ----

  const mapDashboardEventToEvent = (e: DashboardEventSummary): Event => {
    const start = new Date(e.start_at);
    const end = new Date(e.end_at);

    const displayDate = start.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      id: e.id,
      name: e.title,
      displayDate,
      date: toDateInputValue(start),
      startTime: toTimeInputValue(start),
      endTime: toTimeInputValue(end),
      participants: e.registrations_count ?? 0,
      location: e.location_name ?? e.location ?? "Nespecificat",
      description: e.description ?? "",
      category: e.category_name ?? e.category ?? null,
      max_participants: e.max_participants ?? null,
    };
  };

  const loadDashboard = async () => {
    try {
      setLoadingDashboard(true);
      setDashboardError(null);

      const data = await apiFetch<OrganizerDashboardResponse>("/dashboard/organizer");
      const mappedEvents = data.upcoming_events.map(mapDashboardEventToEvent);
      setEvents(mappedEvents);
    } catch (err: any) {
      console.error(err);
      setDashboardError(
        err?.message || "Nu s-au putut încărca evenimentele organizatorului",
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await apiFetch<CurrentUser>("/auth/me");
      setCurrentUser(user);
    } catch (err) {
      console.error("Nu s-a putut încărca utilizatorul curent", err);
    }
  };

  const loadParticipantsForEvent = async (eventId: string) => {
    try {
      setParticipantsLoading(true);
      setParticipantsError(null);

      const regs = await apiFetch<EventRegistration[]>(
        `/registrations/events/${eventId}/registrations`,
      );

      // consider only "registered" as active participants
      const activeRegs = regs.filter((r) => r.status === "registered");

      // update participants list
      setParticipants(activeRegs);

      // update count in events array
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, participants: activeRegs.length } : e,
        ),
      );

      // update count for currently selected event
      setSelectedEvent((prev) =>
        prev && prev.id === eventId
          ? { ...prev, participants: activeRegs.length }
          : prev,
      );
    } catch (err: any) {
      console.error(err);
      setParticipantsError(
        err?.message ||
          "Nu s-au putut încărca participanții pentru acest eveniment.",
      );
      setParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadCurrentUser();
  }, []);

  // ---- UI handlers ----

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setOriginalEvent(event);
    setEditForm({
      name: event.name,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location === "Nespecificat" ? "" : event.location,
      description: event.description ?? "",
    });
    setShowEditModal(true);
  };

  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteConfirm(true);
  };

  const showParticipants = (event: Event) => {
    setSelectedEvent(event);
    setActiveTab("participanti");
    loadParticipantsForEvent(event.id);
  };

  // Create event: POST /events
  const handleCreateEvent = async () => {
    if (
      !createForm.name ||
      !createForm.date ||
      !createForm.startTime ||
      !createForm.endTime
    ) {
      alert("Te rog completează numele, data, ora de început și ora de sfârșit.");
      return;
    }

    let maxParticipantsNumber: number | null = null;
    if (createForm.maxParticipants.trim() !== "") {
      const parsed = Number(createForm.maxParticipants);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        alert("Numărul maxim de participanți trebuie să fie un număr întreg pozitiv.");
        return;
      }
      maxParticipantsNumber = parsed;
    }

    const startAtStr = buildLocalDateTime(createForm.date, createForm.startTime);
    const endAtStr = buildLocalDateTime(createForm.date, createForm.endTime);

    if (new Date(endAtStr) <= new Date(startAtStr)) {
      alert("Ora de sfârșit trebuie să fie după ora de început.");
      return;
    }

    try {
      setCreateSaving(true);

      await apiFetch("/events", {
        method: "POST",
        body: JSON.stringify({
          title: createForm.name,
          description: createForm.description || null,
          start_at: startAtStr,
          end_at: endAtStr,
          location: createForm.location || null,
          category: createForm.category || null,
          max_participants: maxParticipantsNumber,
          status: "draft",
        }),
      });

      setCreateForm({
        name: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        category: "",
        maxParticipants: "",
        description: "",
      });
      setShowCreateModal(false);
      setShowPendingApprovalModal(true);

      await loadDashboard();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Eroare la crearea evenimentului.");
    } finally {
      setCreateSaving(false);
    }
  };

  // Edit event: PUT /events/{id} – only send changed fields
  const saveEdit = async () => {
    if (!selectedEvent || !editForm || !originalEvent) return;

    const payload: any = {};

    // title
    if (editForm.name !== originalEvent.name) {
      payload.title = editForm.name;
    }

    // description – only send if changed
    if (editForm.description !== originalEvent.description) {
      payload.description =
        editForm.description.trim() === "" ? null : editForm.description.trim();
    }

    // date / time
    const dateChanged =
      editForm.date !== originalEvent.date ||
      editForm.startTime !== originalEvent.startTime ||
      editForm.endTime !== originalEvent.endTime;

    if (dateChanged) {
      if (!editForm.date || !editForm.startTime || !editForm.endTime) {
        alert("Data, ora de început și ora de sfârșit trebuie completate.");
        return;
      }

      const startAtStr = buildLocalDateTime(editForm.date, editForm.startTime);
      const endAtStr = buildLocalDateTime(editForm.date, editForm.endTime);

      if (new Date(endAtStr) <= new Date(startAtStr)) {
        alert("Ora de sfârșit trebuie să fie după ora de început.");
        return;
      }

      payload.start_at = startAtStr;
      payload.end_at = endAtStr;
    }

    // location
    if (editForm.location !== originalEvent.location) {
      payload.location =
        editForm.location.trim() === "" ? null : editForm.location.trim();
    }

    // nothing changed → just close modal
    if (Object.keys(payload).length === 0) {
      setShowEditModal(false);
      setSelectedEvent(null);
      setOriginalEvent(null);
      setEditForm(null);
      return;
    }

    try {
      setEditSaving(true);

      await apiFetch(`/events/${selectedEvent.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setShowEditModal(false);
      setSelectedEvent(null);
      setOriginalEvent(null);
      setEditForm(null);

      await loadDashboard();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Eroare la actualizarea evenimentului.");
    } finally {
      setEditSaving(false);
    }
  };

  // Delete event: DELETE /events/{id}
  const confirmDelete = async () => {
    if (!selectedEvent) return;

    try {
      setDeleteSaving(true);

      await apiFetch(`/events/${selectedEvent.id}`, {
        method: "DELETE",
      });

      setShowDeleteConfirm(false);
      setSelectedEvent(null);

      await loadDashboard();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Nu s-a putut șterge evenimentul.");
    } finally {
      setDeleteSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white flex flex-col">
        <div className="px-6 py-4 border-b border-indigo-600">
          <h1>USV Events</h1>
          <p className="text-indigo-200 text-sm mt-1">Organizator</p>
        </div>

        <nav className="flex-1 px-4 py-6">
          <button
            onClick={() => setActiveTab("evenimente")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === "evenimente" ? "bg-indigo-600" : "hover:bg-indigo-600"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Evenimentele mele</span>
          </button>

          <button
            onClick={() => setActiveTab("participanti")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === "participanti" ? "bg-indigo-600" : "hover:bg-indigo-600"
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
          <h2 className="text-gray-800">
            {activeTab === "evenimente" && "Evenimentele mele"}
            {activeTab === "participanti" && "Participanți"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
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
                    className="block px-4 py-3 text-gray-800 hover:bg-gray-100 w-full text-left"
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
                <p className="text-gray-600">Gestionează evenimentele tale</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition-colors"
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
                      <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-gray-800 mb-2">{event.name}</h3>
                            <div className="space-y-1">
                              <p className="text-gray-600 text-sm">📅 {event.displayDate}</p>
                              <p className="text-gray-600 text-sm">
                                ⏰ {event.startTime} – {event.endTime}
                              </p>
                              <p className="text-gray-600 text-sm">📍 {event.location}</p>
                              <button
                                onClick={() => showParticipants(event)}
                                className="text-indigo-700 text-sm hover:underline"
                              >
                                👥 Participanți înregistrați
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                              disabled={editSaving}
                            >
                              <Edit className="w-4 h-4" />
                              Editează
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event)}
                              className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                              disabled={deleteSaving}
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
                    <h3 className="text-gray-800 mb-2">{selectedEvent.name}</h3>
                    <p className="text-gray-600">
                      Total participanți (înregistrări): {selectedEvent.participants}
                    </p>
                  </div>

                  {participantsLoading && (
                    <p className="text-gray-600 text-sm text-center">
                      Se încarcă participanții...
                    </p>
                  )}

                  {participantsError && !participantsLoading && (
                    <p className="text-red-600 text-sm text-center">
                      {participantsError}
                    </p>
                  )}

                  {!participantsLoading &&
                    !participantsError &&
                    participants.length === 0 && (
                      <p className="text-gray-600 text-sm text-center">
                        Nu există participanți înregistrați pentru acest eveniment.
                      </p>
                    )}

                  {!participantsLoading &&
                    !participantsError &&
                    participants.length > 0 && (
                      <div className="space-y-3">
                        {participants.map((p, index) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between py-3 border-b border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-indigo-700" />
                              </div>
                              <div>
                                <p className="text-gray-800">
                                  Participant {index + 1}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  Nume: {p.user_name || "Nespecificat"}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-sm px-3 py-1 rounded ${
                                p.status === "registered"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {p.status === "registered"
                                ? "Confirmat"
                                : p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ) : (
                <p className="text-gray-600 text-center">
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
              <h3>Profilul meu</h3>
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
                <h4 className="text-gray-800 text-center">
                  {currentUser?.name ?? "Utilizator"}
                </h4>
                <p className="text-gray-600 text-sm">
                  {currentUser?.role ?? ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
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
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                  placeholder="Ex: Conferința IT 2025"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Data evenimentului
                </label>
                <input
                  type="date"
                  value={createForm.date}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Ora început
                  </label>
                  <input
                    type="time"
                    value={createForm.startTime}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        startTime: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Ora sfârșit
                  </label>
                  <input
                    type="time"
                    value={createForm.endTime}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        endTime: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Locație
                </label>
                <input
                  type="text"
                  value={createForm.location}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, location: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                  placeholder="Ex: Sala A1"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Categorie
                </label>
                <input
                  type="text"
                  value={createForm.category}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                  placeholder="Ex: Conferință"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Nr maxim participanți
                </label>
                <input
                  type="number"
                  min={1}
                  value={createForm.maxParticipants}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      maxParticipants: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                  placeholder="Ex: 50"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Descriere
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                  rows={4}
                  placeholder="Descrie evenimentul..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={createSaving}
                >
                  Anulează
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-70"
                  disabled={createSaving}
                >
                  {createSaving ? "Se creează..." : "Creează"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3>Editează eveniment</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedEvent(null);
                  setOriginalEvent(null);
                  setEditForm(null);
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
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, name: e.target.value } : f))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Data evenimentului
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, date: e.target.value } : f))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Ora început
                  </label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) =>
                      setEditForm((f) =>
                        f ? { ...f, startTime: e.target.value } : f,
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Ora sfârșit
                  </label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) =>
                      setEditForm((f) =>
                        f ? { ...f, endTime: e.target.value } : f,
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Locație
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, location: e.target.value } : f,
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                  placeholder="Ex: Sala A1"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Descriere
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, description: e.target.value } : f,
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-700 outline-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEvent(null);
                    setOriginalEvent(null);
                    setEditForm(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={editSaving}
                >
                  Anulează
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-70"
                  disabled={editSaving}
                >
                  {editSaving ? "Se salvează..." : "Salvează"}
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
              <h3 className="text-gray-800 mb-4">Șterge eveniment</h3>
              <p className="text-gray-600 mb-6">
                Ești sigur că vrei să ștergi evenimentul "{selectedEvent.name}"?
                Această acțiune nu poate fi anulată.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={deleteSaving}
                >
                  Anulează
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
                  disabled={deleteSaving}
                >
                  {deleteSaving ? "Se șterge..." : "Șterge"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Approval Modal */}
      {showPendingApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-gray-800 mb-3">Eveniment creat</h3>
              <p className="text-gray-600 mb-6">
                Evenimentul a fost creat si este in asteptare pentru confirmarea unui administrator
              </p>
              <button
                onClick={() => setShowPendingApprovalModal(false)}
                className="w-full bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition-colors"
              >
                Am inteles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
