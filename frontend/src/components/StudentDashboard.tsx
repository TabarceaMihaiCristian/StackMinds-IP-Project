import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  LogOut,
  Bell,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Clock,
} from "lucide-react";
import { apiFetch } from "../api/client";

interface StudentDashboardProps {
  onLogout: () => void;
}

interface UiEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // hours
  location: string;
  description: string;
  organizer: string;
}

// Shape that matches backend EventRead (simplified)
interface ApiEvent {
  id: string;
  title: string;
  description?: string | null;
  start_at: string; // ISO
  end_at: string; // ISO
  location?: {
    id: string;
    name: string;
    room?: string | null;
  } | null;
  category?: {
    id: string;
    name: string;
  } | null;
  organizer_id: string;
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<"evenimente" | "inscrieri">(
    "evenimente",
  );
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 15)); // December 15, 2025

  const [events, setEvents] = useState<UiEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<UiEvent | null>(null);

  // participationStatus[eventId] = true | false | undefined
  const [participationStatus, setParticipationStatus] = useState<{
    [eventId: string]: boolean | undefined;
  }>({});

  const [savingParticipationFor, setSavingParticipationFor] = useState<
    string | null
  >(null);

  const currentUser = {
    name: "Ion Popescu",
    role: "Student",
  };

  const [showProfileModal, setShowProfileModal] = useState(false);

  // -------- API helpers --------

  const mapApiEventToUiEvent = (e: ApiEvent): UiEvent => {
    const start = new Date(e.start_at);
    const end = new Date(e.end_at);

    let durationHours =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60); // ms → hours
    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      durationHours = 1; // fallback
    }

    return {
      id: e.id,
      name: e.title,
      date: e.start_at.slice(0, 10), // YYYY-MM-DD
      time: start.toTimeString().slice(0, 5), // HH:mm
      duration: durationHours,
      location: e.location?.name ?? "Nespecificat",
      description: e.description ?? "",
      organizer: e.category?.name ?? "Eveniment",
    };
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoadingEvents(true);
        setEventsError(null);

        // adjust query params if needed (e.g. ?skip=0&limit=100&upcoming_only=true)
        const apiEvents = await apiFetch<ApiEvent[]>(
          "/events?upcoming_only=true",
        );
        const uiEvents = apiEvents.map(mapApiEventToUiEvent);
        setEvents(uiEvents);
      } catch (err: any) {
        setEventsError(
          err?.message || "Nu s-a putut încărca lista de evenimente",
        );
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  // If you have an endpoint like GET /registrations/me,
  // you can also pre-populate participationStatus here by fetching
  // the user's registrations and marking which events they're registered to.

  // -------- Calendar helpers --------

  // Generate time slots from 8:00 to 20:00
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // Get week days starting from currentDate
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDays = getWeekDays();
  const dayNames = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getEventsForDateAndTime = (date: Date, timeSlot: string) => {
    const dateStr = formatDate(date);
    const [slotHour] = timeSlot.split(":").map(Number);

    return events.filter((event) => {
      if (event.date !== dateStr) return false;
      const [eventHour] = event.time.split(":").map(Number);
      return eventHour <= slotHour && slotHour < eventHour + event.duration;
    });
  };

  const isEventStart = (event: UiEvent, timeSlot: string) => {
    const [slotHour] = timeSlot.split(":").map(Number);
    const [eventHour] = event.time.split(":").map(Number);
    return eventHour === slotHour;
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const toggleParticipation = (eventId: string) => {
    // Move back to "no answer" (UI only); next choice will hit backend again
    setParticipationStatus((prev) => ({ ...prev, [eventId]: undefined }));
  };

  const handleParticipate = async (eventId: string, willParticipate: boolean) => {
    try {
      setSavingParticipationFor(eventId);

      // ⬇️ Adjust these endpoints to match your backend if needed
      if (willParticipate) {
        await apiFetch(`/registrations/events/${eventId}/register`, {
          method: "POST",
        });
      } else {
        await apiFetch(`/registrations/events/${eventId}/register`, {
          method: "DELETE",
        });
      }

      setParticipationStatus((prev) => ({ ...prev, [eventId]: willParticipate }));
    } catch (err: any) {
      alert(
        err?.message ||
          "A apărut o problemă la actualizarea participării la eveniment",
      );
    } finally {
      setSavingParticipationFor(null);
    }
  };

  const acceptedEvents = events.filter(
    (event) => participationStatus[event.id] === true,
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white flex flex-col">
        <div className="px-6 py-4 border-b border-indigo-600">
          <h1 className="text-lg font-semibold tracking-tight">USV Events</h1>
          <p className="text-indigo-200 text-sm mt-1">Student</p>
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
            <span>Evenimente</span>
          </button>

          <button
            onClick={() => setActiveTab("inscrieri")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === "inscrieri"
                ? "bg-indigo-600"
                : "hover:bg-indigo-600"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Înscrieri</span>
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
            {activeTab === "evenimente" && "Calendar Evenimente"}
            {activeTab === "inscrieri" && "Înscrierile mele"}
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
                <UserIcon className="w-5 h-5 text-gray-600" />
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
          {/* Events tab */}
          {activeTab === "evenimente" && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                  onClick={previousWeek}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <div className="text-gray-800 text-sm font-medium">
                  {weekDays[0].toLocaleDateString("ro-RO", {
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {weekDays[6].toLocaleDateString("ro-RO", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                  onClick={nextWeek}
                >
                  Următor
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {loadingEvents && (
                <div className="p-6 text-center text-gray-600 text-sm">
                  Se încarcă evenimentele...
                </div>
              )}

              {eventsError && !loadingEvents && (
                <div className="p-6 text-center text-red-600 text-sm">
                  {eventsError}
                </div>
              )}

              {!loadingEvents && !eventsError && (
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    {/* Day Headers */}
                    <div className="grid grid-cols-8 border-b border-gray-200">
                      <div className="p-3 bg-gray-50" />
                      {weekDays.map((day, index) => (
                        <div
                          key={index}
                          className="p-3 text-center bg-gray-50 border-l border-gray-200"
                        >
                          <div className="text-gray-600 text-xs">
                            {dayNames[index]}
                          </div>
                          <div className="text-gray-800 mt-1 text-sm font-medium">
                            {day.getDate()}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Time Slots */}
                    {timeSlots.map((timeSlot, timeIndex) => (
                      <div
                        key={timeIndex}
                        className="grid grid-cols-8 border-b border-gray-200"
                      >
                        <div className="p-3 text-gray-600 text-xs bg-gray-50 flex items-start justify-end pr-4">
                          {timeSlot}
                        </div>
                        {weekDays.map((day, dayIndex) => {
                          const dayEvents = getEventsForDateAndTime(
                            day,
                            timeSlot,
                          );
                          const eventToShow = dayEvents.find((event) =>
                            isEventStart(event, timeSlot),
                          );

                          return (
                            <div
                              key={dayIndex}
                              className="p-2 border-l border-gray-200 min-h-[80px] relative"
                            >
                              {eventToShow && (
                                <div
                                  className="bg-indigo-600 text-white p-2 rounded-lg text-xs absolute left-2 right-2 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                  style={{
                                    height: `${eventToShow.duration * 80 - 16}px`,
                                    zIndex: 10,
                                  }}
                                  onClick={() => setSelectedEvent(eventToShow)}
                                >
                                  <div className="font-medium truncate">
                                    {eventToShow.name}
                                  </div>
                                  <div className="text-[11px] mt-1 opacity-90">
                                    {eventToShow.time} -{" "}
                                    {eventToShow.location}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* My registrations tab */}
          {activeTab === "inscrieri" && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              {acceptedEvents.length === 0 ? (
                <p className="text-gray-600 text-center text-sm">
                  Nu ești înscris la niciun eveniment încă.
                </p>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-gray-800 mb-4 text-base font-semibold">
                    Evenimente la care participi ({acceptedEvents.length})
                  </h3>
                  {acceptedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-gray-800 mb-2 font-medium">
                            {event.name}
                          </h4>
                          <div className="space-y-1">
                            <p className="text-gray-600 text-sm flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(event.date).toLocaleDateString(
                                "ro-RO",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}{" "}
                              - {event.time}
                            </p>
                            <p className="text-gray-600 text-sm flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                        >
                          Detalii
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <UserIcon className="w-10 h-10 text-indigo-700" />
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

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="font-semibold">{selectedEvent.name}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 hover:bg-indigo-600 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-gray-600 text-sm">Dată și oră</p>
                    <p className="text-gray-800">
                      {new Date(selectedEvent.date).toLocaleDateString(
                        "ro-RO",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                    <p className="text-gray-800">
                      {selectedEvent.time} ({selectedEvent.duration}{" "}
                      {selectedEvent.duration === 1 ? "oră" : "ore"})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-gray-600 text-sm">Locație</p>
                    <p className="text-gray-800">{selectedEvent.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-gray-600 text-sm">Organizator</p>
                    <p className="text-gray-800">{selectedEvent.organizer}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-gray-600 text-sm mb-2">Descriere</p>
                  <p className="text-gray-800">{selectedEvent.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                {participationStatus[selectedEvent.id] === undefined ? (
                  <>
                    <button
                      onClick={() =>
                        handleParticipate(selectedEvent.id, true)
                      }
                      disabled={savingParticipationFor === selectedEvent.id}
                      className="flex-1 bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-70 text-sm font-medium"
                    >
                      {savingParticipationFor === selectedEvent.id
                        ? "Se salvează..."
                        : "Particip"}
                    </button>
                    <button
                      onClick={() =>
                        handleParticipate(selectedEvent.id, false)
                      }
                      disabled={savingParticipationFor === selectedEvent.id}
                      className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-70 text-sm font-medium"
                    >
                      {savingParticipationFor === selectedEvent.id
                        ? "Se salvează..."
                        : "Nu particip"}
                    </button>
                  </>
                ) : participationStatus[selectedEvent.id] ? (
                  <div className="flex-1 flex items-center justify-between bg-green-50 border border-green-200 px-6 py-3 rounded-lg">
                    <span className="text-green-800 text-sm">
                      ✓ Confirmat - Vei participa la acest eveniment
                    </span>
                    <button
                      onClick={() => toggleParticipation(selectedEvent.id)}
                      className="text-sm text-green-700 hover:text-green-900 underline"
                    >
                      Schimbă răspuns
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between bg-gray-50 border border-gray-200 px-6 py-3 rounded-lg">
                    <span className="text-gray-800 text-sm">
                      Nu vei participa la acest eveniment
                    </span>
                    <button
                      onClick={() => toggleParticipation(selectedEvent.id)}
                      className="text-sm text-gray-700 hover:text-gray-900 underline"
                    >
                      Schimbă răspuns
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
