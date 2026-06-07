"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, Home, FileText, CheckSquare } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, format, addMonths, subMonths, isToday } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "follow_up" | "task" | "inspection" | "move_in";
  color: string;
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Follow-up: Johnson Case", date: new Date(), type: "follow_up", color: "bg-blue-500" },
  { id: "2", title: "Inspection: 145 Bronx Ave", date: new Date(Date.now() + 86400000 * 2), type: "inspection", color: "bg-orange-500" },
  { id: "3", title: "Move-in: Rivera Family", date: new Date(Date.now() + 86400000 * 5), type: "move_in", color: "bg-green-500" },
  { id: "4", title: "Task Due: Collect Documents", date: new Date(Date.now() + 86400000 * 1), type: "task", color: "bg-purple-500" },
  { id: "5", title: "Follow-up: Martinez Case", date: new Date(Date.now() + 86400000 * 7), type: "follow_up", color: "bg-blue-500" },
  { id: "6", title: "Move-in Target: Lee Family", date: new Date(Date.now() + 86400000 * 14), type: "move_in", color: "bg-green-500" },
  { id: "7", title: "Inspection: 89 Queens Blvd", date: new Date(Date.now() + 86400000 * 10), type: "inspection", color: "bg-orange-500" },
];

const EVENT_ICONS = {
  follow_up: Clock,
  task: CheckSquare,
  inspection: Home,
  move_in: FileText,
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startPad = startOfMonth(currentMonth).getDay();

  function getEventsForDay(day: Date) {
    return MOCK_EVENTS.filter(e => isSameDay(e.date, day));
  }

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b1a]">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Follow-ups, inspections, move-ins, and task deadlines</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1a2b1a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d4a2d]">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        {[
          { type: "follow_up", label: "Follow-ups", color: "bg-blue-500" },
          { type: "task", label: "Task Deadlines", color: "bg-purple-500" },
          { type: "inspection", label: "Inspections", color: "bg-orange-500" },
          { type: "move_in", label: "Move-ins", color: "bg-green-500" },
        ].map(item => (
          <div key={item.type} className="flex items-center gap-2 text-xs text-gray-500">
            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <h2 className="font-semibold text-[#1a2b1a]">{format(currentMonth, "MMMM yyyy")}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {/* Padding for start of month */}
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="h-20 border-b border-r border-gray-50" />
            ))}
            {days.map((day) => {
              const events = getEventsForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const todayDay = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "h-20 border-b border-r border-gray-50 p-1 cursor-pointer transition-colors",
                    isSelected ? "bg-green-50" : "hover:bg-gray-50",
                    !isSameMonth(day, currentMonth) && "opacity-30"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    todayDay ? "bg-[#1a2b1a] text-white" : "text-gray-700"
                  )}>
                    {format(day, "d")}
                  </span>
                  <div className="space-y-0.5 mt-0.5">
                    {events.slice(0, 2).map(ev => (
                      <div key={ev.id} className={`${ev.color} rounded text-white text-xs px-1 py-0.5 truncate`}>
                        {ev.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-gray-400">+{events.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Events */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-[#1a2b1a] mb-1">
            {selectedDay ? format(selectedDay, "EEEE, MMMM d") : "Select a day"}
          </h3>
          {selectedDay && isToday(selectedDay) && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Today</span>
          )}
          <div className="mt-4 space-y-3">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No events this day</p>
              </div>
            ) : (
              selectedDayEvents.map(event => {
                const Icon = EVENT_ICONS[event.type];
                return (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", event.color)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a2b1a]">{event.title}</p>
                      <p className="text-xs text-gray-400 capitalize">{event.type.replace("_", " ")}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
