"use client";

import { useState } from "react";
import { MessageSquare, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCaseStatus, formatDate, CASE_STATUS_COLORS } from "@/lib/utils";

const ALL_STATUSES = [
  "NEW", "SEARCHING", "VIEWING_SCHEDULED", "APPLICATION_STARTED",
  "DOCUMENTS_NEEDED", "INSPECTION_PENDING", "APPROVED", "LEASE_SIGNING",
  "HOUSED", "CLOSED", "LOST",
] as const;

type Note = {
  id: string;
  note: string;
  noteType: string;
  createdAt: Date;
  createdBy?: { fullName: string; avatarUrl?: string | null } | null;
};

interface CaseDetailClientProps {
  caseId: string;
  currentStatus: string;
  caseNotes: Note[];
}

const NOTE_TYPE_ICONS: Record<string, string> = {
  GENERAL: "💬",
  CALL: "📞",
  EMAIL: "📧",
  MEETING: "🤝",
  SYSTEM: "⚙️",
  STATUS_UPDATE: "🔄",
};

export function CaseDetailClient({ caseId, currentStatus, caseNotes: initialNotes }: CaseDetailClientProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("GENERAL");
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText, noteType, relatedCaseId: caseId }),
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes((prev) => [newNote, ...prev]);
        setNoteText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusUpdate(newStatus: string) {
    if (newStatus === status) return;
    setUpdatingStatus(true);
    setStatus(newStatus);
    try {
      await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      setStatus(currentStatus);
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Update Buttons */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Update Status
        </h3>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusUpdate(s)}
              disabled={updatingStatus}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all border",
                status === s
                  ? "ring-2 ring-offset-1 ring-[#4caf50] scale-105"
                  : "opacity-70 hover:opacity-100",
                CASE_STATUS_COLORS[s] ?? "bg-gray-100 text-gray-700",
                "border-transparent"
              )}
            >
              {formatCaseStatus(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-semibold text-[#1a2b1a] mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#4caf50]" />
          Activity & Notes
        </h3>

        {/* Add note form */}
        <form onSubmit={handleAddNote} className="mb-5">
          <div className="flex gap-2 mb-2">
            {(["GENERAL", "CALL", "EMAIL", "MEETING"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setNoteType(t)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  noteType === t
                    ? "bg-[#1a2b1a] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                <span>{NOTE_TYPE_ICONS[t]}</span>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note, call log, or update…"
              rows={3}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4caf50]/30 focus:border-[#4caf50]"
            />
          </div>
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              disabled={submitting || !noteText.trim()}
              className="bg-[#1a2b1a] hover:bg-[#2d4a2d] text-white gap-2"
              size="sm"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? "Adding…" : "Add Note"}
            </Button>
          </div>
        </form>

        {/* Notes list */}
        {notes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No activity yet.</p>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {notes.map((note) => (
              <div key={note.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1a2b1a] flex items-center justify-center text-xs font-semibold text-white">
                  {note.createdBy?.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {note.createdBy?.fullName ?? "System"}
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 font-medium">
                      {NOTE_TYPE_ICONS[note.noteType]} {note.noteType.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(note.createdAt, "MMM d, yyyy · h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-3">
                    {note.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
