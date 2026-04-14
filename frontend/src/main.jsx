import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

function formatDateTime(value) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function formatTimeOnly(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleTimeString();
}

function EventCard({ event, onConfirm, compact = false }) {
  return (
    <div
      className={`bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition ${
        compact ? "group" : ""
      }`}
    >
      <div className="flex gap-4">
        {event.snapshot_path ? (
          <img
            src={`/${event.snapshot_path}`}
            className="w-20 h-20 object-cover rounded-md border border-slate-600 shadow-sm"
            alt={`Event ${event.id} snapshot`}
          />
        ) : (
          <div className="w-20 h-20 bg-slate-700 rounded-md flex items-center justify-center text-xs text-slate-500">
            No Image
          </div>
        )}

        <div className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
              #{event.id} {event.detection_type}
            </span>
            <span className="text-[10px] text-slate-500">
              {compact ? formatTimeOnly(event.timestamp) : formatDateTime(event.timestamp)}
            </span>
          </div>

          <div className="mt-1">
            {event.metadata?.recognized_names?.length > 0 ? (
              <span className="bg-blue-500/20 text-blue-300 text-[11px] px-2 py-0.5 rounded border border-blue-500/30 font-bold">
                IDENTIFIED: {event.metadata.recognized_names[0]}
              </span>
            ) : (
              <span className="text-slate-300 text-sm font-medium">Unidentified Person</span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span
              className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded border ${
                event.status === "confirmed"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-orange-500/10 text-orange-300 border-orange-500/20"
              }`}
            >
              {event.status || "unknown"}
            </span>

            {event.status !== "confirmed" && (
              <button
                className={`bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-1.5 px-3 rounded transition ${
                  compact ? "opacity-0 group-hover:opacity-100" : ""
                }`}
                onClick={() => onConfirm(event)}
              >
                CONFIRM IDENTITY
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("dashboard");

  const [confirmingEvent, setConfirmingEvent] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [confirmNotes, setConfirmNotes] = useState("");
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

  const load = async ({ showLoader = false } = {}) => {
    if (showLoader) setLoading(true);

    try {
      setError("");

      const [eventsResponse, membersResponse, statsResponse] = await Promise.all([
        fetch("/api/events?limit=10"),
        fetch("/api/members"),
        fetch("/api/stats"),
      ]);

      if (!eventsResponse.ok) throw new Error("Failed to load events");
      if (!membersResponse.ok) throw new Error("Failed to load members");
      if (!statsResponse.ok) throw new Error("Failed to load stats");

      const [ev, mb, st] = await Promise.all([
        eventsResponse.json(),
        membersResponse.json(),
        statsResponse.json(),
      ]);

      setEvents(ev.events || []);
      setMembers(mb.members || []);
      setStats(st || {});
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ showLoader: true });
    const t = setInterval(() => load(), 2000); // 2-second refresh for tighter feel
    return () => clearInterval(t);
  }, []);

  const openConfirmModal = (event) => {
    setConfirmingEvent(event);
    setSelectedMemberId(members[0]?.id ? String(members[0].id) : "");
    setConfirmNotes("");
  };

  const closeConfirmModal = () => {
    setConfirmingEvent(null);
    setSelectedMemberId("");
    setConfirmNotes("");
    setConfirmSubmitting(false);
  };

  const submitConfirmation = async () => {
    if (!confirmingEvent || !selectedMemberId) return;

    try {
      setConfirmSubmitting(true);
      setError("");

      const response = await fetch(`/api/events/${confirmingEvent.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "manual",
          member_id: Number(selectedMemberId),
          notes: confirmNotes || "Admin confirm",
        }),
      });

      if (!response.ok) {
        let message = "Confirmation failed";
        try {
          const data = await response.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore JSON parsing errors here and keep the default message
        }
        throw new Error(message);
      }

      closeConfirmModal();
      await load();
    } catch (err) {
      console.error("Confirmation failed", err);
      setError(err.message || "Confirmation failed");
    } finally {
      setConfirmSubmitting(false);
    }
  };

  const pageMeta = {
    dashboard: {
      title: "Smart Arrival Dashboard",
      subtitle: "System Status: Optimal",
    },
    events: {
      title: "Events",
      subtitle: "Review recent detections and confirmations",
    },
    members: {
      title: "Members",
      subtitle: "View registered members available for confirmation",
    },
    settings: {
      title: "System Settings",
      subtitle: "Frontend section ready for settings integration",
    },
  };

  const currentPage = pageMeta[view] || pageMeta.dashboard;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 p-6 border-r border-slate-800 hidden md:block">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-8">
          <span className="text-blue-500">📷</span> Camera AI
        </h2>

        <nav className="space-y-4">
          <button
            className={`w-full text-left p-2 rounded-lg transition ${
              view === "dashboard"
                ? "text-blue-400 bg-blue-500/10"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`w-full text-left p-2 rounded-lg transition ${
              view === "events"
                ? "text-blue-400 bg-blue-500/10"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setView("events")}
          >
            Events
          </button>

          <button
            className={`w-full text-left p-2 rounded-lg transition ${
              view === "members"
                ? "text-blue-400 bg-blue-500/10"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setView("members")}
          >
            Members
          </button>

          <button
            className={`w-full text-left p-2 rounded-lg transition ${
              view === "settings"
                ? "text-blue-400 bg-blue-500/10"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setView("settings")}
          >
            System Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {loading && (
          <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-300">
            Loading dashboard data...
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>{error}</span>
            <button
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-sm self-start sm:self-auto"
              onClick={() => load({ showLoader: true })}
            >
              Retry
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{currentPage.title}</h1>
            <p className="text-slate-400 text-sm">{currentPage.subtitle}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 animate-pulse">
              ● LIVE
            </span>
          </div>
        </header>

        {view === "dashboard" && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <p className="text-slate-400 text-sm mb-1">Total Events</p>
                <p className="text-3xl font-mono font-bold">{stats.total_events || 0}</p>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <p className="text-slate-400 text-sm mb-1">Pending Review</p>
                <p className="text-3xl font-mono font-bold text-orange-400">
                  {stats.pending_events || 0}
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <p className="text-slate-400 text-sm mb-1">Authenticated</p>
                <p className="text-3xl font-mono font-bold text-emerald-400">
                  {stats.confirmed_events || 0}
                </p>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Live Feed Column */}
              <div className="xl:col-span-2 space-y-6">
                <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold">Primary Camera View</h3>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                      Pi5 Ribbon Cam
                    </span>
                  </div>
                  <div className="relative aspect-video bg-black">
                    <img
                      src="/api/stream"
                      className="w-full h-full object-cover"
                      alt="Stream"
                    />
                  </div>
                </section>
              </div>

              {/* Activity Sidebar */}
              <section className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[600px] shadow-xl">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="font-bold text-slate-200">Recent Activity</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {events.length === 0 && (
                    <p className="text-slate-500 text-center py-10">No recent events</p>
                  )}

                  {events.map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      onConfirm={openConfirmModal}
                      compact={true}
                    />
                  ))}
                </div>
              </section>
            </div>
          </>
        )}

        {view === "events" && (
          <section className="space-y-4">
            {events.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-400">
                No events available.
              </div>
            )}

            {events.map((e) => (
              <EventCard key={e.id} event={e} onConfirm={openConfirmModal} />
            ))}
          </section>
        )}

        {view === "members" && (
          <section className="space-y-4">
            {members.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-400">
                No members available.
              </div>
            )}

            {members.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg"
              >
                <p className="font-bold text-slate-100">{m.name || `Member ${m.id}`}</p>
                <p className="text-sm text-slate-400 mt-1">ID: {m.id}</p>
              </div>
            ))}
          </section>
        )}

        {view === "settings" && (
          <section className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-2">Settings Integration Ready</h3>
              <p className="text-slate-400 text-sm">
                This sidebar view is now functional. The next frontend step is to bind
                editable controls to the existing <code>/api/settings</code> backend route.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <p className="text-slate-400 text-sm mb-1">Refresh Interval</p>
                <p className="text-2xl font-mono font-bold">2s</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <p className="text-slate-400 text-sm mb-1">Active API Sources</p>
                <p className="text-2xl font-mono font-bold">Events / Members / Stats</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {confirmingEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Confirm Identity</h2>

            <p className="text-sm text-slate-400 mb-4">
              Event #{confirmingEvent.id} • {confirmingEvent.detection_type}
            </p>

            <label className="block text-sm mb-2">Select Member</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 mb-4"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              <option value="">Choose a member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || `Member ${m.id}`}
                </option>
              ))}
            </select>

            <label className="block text-sm mb-2">Notes</label>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 mb-4"
              rows="3"
              value={confirmNotes}
              onChange={(e) => setConfirmNotes(e.target.value)}
              placeholder="Optional notes"
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                onClick={closeConfirmModal}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
                disabled={!selectedMemberId || confirmSubmitting}
                onClick={submitConfirmation}
              >
                {confirmSubmitting ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);