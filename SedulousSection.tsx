import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, Clock, Trash2, Calendar, X, Bell } from 'lucide-react';
import { SedulousEntry } from '../types';

interface SedulousSectionProps {
  entries: SedulousEntry[];
  onUpdateEntries: (entries: SedulousEntry[]) => void;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SedulousSection: React.FC<SedulousSectionProps> = ({ entries, onUpdateEntries }) => {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const touchStartPos = useRef<{ x: number, y: number } | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Request Notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const getNextOccurrence = (entry: SedulousEntry) => {
    const [time, modifier] = entry.classTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const occurrences: Date[] = [];
    const currentDayIdx = now.getDay();

    entry.classDays.forEach(day => {
      const targetDayIdx = DAYS_OF_WEEK.indexOf(day);
      let daysUntil = (targetDayIdx - currentDayIdx + 7) % 7;
      
      const occurrence = new Date(now);
      occurrence.setDate(now.getDate() + daysUntil);
      occurrence.setHours(hours, minutes, 0, 0);

      // If it's today but already passed, move to next week
      if (occurrence.getTime() <= now.getTime()) {
        occurrence.setDate(occurrence.getDate() + 7);
      }
      occurrences.push(occurrence);
    });

    return new Date(Math.min(...occurrences.map(d => d.getTime())));
  };

  // Notification Logic
  useEffect(() => {
    entries.forEach(entry => {
      const next = getNextOccurrence(entry);
      const diffMs = next.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins === 10 && diffMs > 0) {
        const notifyKey = `${entry.id}-${next.toISOString()}`;
        if (entry.lastNotifiedAt !== notifyKey) {
          if (Notification.permission === "granted") {
            new Notification("BIOM Class Alert", {
              body: `আপনার ${entry.courseName} ${entry.batchNumber} ব্যচের ${entry.classType} ক্লাস ১০ মিনিট পর শুরু হবে। আপনি কি প্রস্তুত?`,
              icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
            });
            onUpdateEntries(entries.map(e => e.id === entry.id ? { ...e, lastNotifiedAt: notifyKey } : e));
          }
        }
      }
    });
  }, [now, entries]);

  const sortedEntries = useMemo(() => {
    return [...entries]
      .filter(e => e.courseName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => getNextOccurrence(a).getTime() - getNextOccurrence(b).getTime());
  }, [entries, search, now]);

  const formatCountdown = (target: Date) => {
    const diff = target.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  };

  const handleLongPressStart = (id: string, e: React.PointerEvent) => {
    touchStartPos.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = window.setTimeout(() => {
      setDeletingId(id);
    }, 700);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (touchStartPos.current) {
      const dist = Math.sqrt(
        Math.pow(e.clientX - touchStartPos.current.x, 2) + 
        Math.pow(e.clientY - touchStartPos.current.y, 2)
      );
      if (dist > 8) {
        handleLongPressEnd();
      }
    }
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
  };

  const handleDelete = (id: string) => {
    onUpdateEntries(entries.filter(e => e.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-50 dark:bg-slate-950">
      {/* Search Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex gap-2 items-center flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
          />
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Schedule List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y overscroll-contain pb-24">
        {sortedEntries.map((entry) => {
          const next = getNextOccurrence(entry);
          const isSoon = (next.getTime() - now.getTime()) < 3600000;

          return (
            <div 
              key={entry.id}
              onPointerDown={(e) => handleLongPressStart(entry.id, e)}
              onPointerUp={handleLongPressEnd}
              onPointerLeave={handleLongPressEnd}
              onPointerCancel={handleLongPressEnd}
              onPointerMove={handlePointerMove}
              className={`relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all active:scale-[0.99] touch-pan-y select-none ${deletingId === entry.id ? 'ring-2 ring-rose-500' : ''}`}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{entry.courseName}</h3>
                <p className="text-sm font-bold text-indigo-500 dark:text-indigo-400 mt-1">{entry.classType}</p>
              </div>

              <div className="flex justify-between items-end border-t border-slate-50 dark:border-slate-800/50 pt-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BATCH</span>
                    <span className="text-sm font-bold dark:text-slate-200">{entry.batchNumber}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.classDays.map(day => (
                      <span key={day} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-md text-[9px] font-bold text-slate-500 dark:text-slate-400">
                        {day.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-indigo-600 dark:text-indigo-400 font-black mb-1">
                    <Clock size={14} />
                    <span>{entry.classTime}</span>
                  </div>
                  <div className={`text-[10px] font-black px-3 py-1 rounded-full inline-block ${isSoon ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
                    {formatCountdown(next)}
                  </div>
                </div>
              </div>

              {/* Deletion Overlay */}
              {deletingId === entry.id && (
                <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 rounded-[2rem] flex items-center justify-center gap-4 animate-fadeIn z-10 p-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                    className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {entries.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <Calendar size={64} className="mx-auto mb-4" />
            <p className="font-bold">No schedules added yet</p>
          </div>
        )}
      </div>

      {/* Entry Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[70] bg-white dark:bg-slate-950 overflow-y-auto flex flex-col animate-slideUp">
          <div className="sticky top-0 z-30 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between border-b dark:border-slate-800">
            <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-slate-500 font-black hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">Cancel</button>
            <h2 className="font-black text-lg dark:text-white uppercase tracking-widest">New Schedule</h2>
            <button 
              form="schedule-form"
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-transform"
            >Create</button>
          </div>

          <div className="p-8 space-y-8 max-w-lg mx-auto w-full pb-10">
            <form id="schedule-form" className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const days = DAYS_OF_WEEK.filter(d => formData.get(`day-${d}`) === 'on');
              
              if (days.length === 0) return alert("Please select at least one day");

              const newEntry: SedulousEntry = {
                id: Date.now().toString(),
                courseName: formData.get('courseName') as string,
                classType: formData.get('classType') as string,
                batchNumber: formData.get('batchNumber') as string,
                classTime: `${formData.get('time')} ${formData.get('period')}`,
                classDays: days,
              };
              onUpdateEntries([...entries, newEntry]);
              setIsFormOpen(false);
            }}>
              <Input label="Course Name" name="courseName" required placeholder="e.g. Quran Shikkha" />
              <Input label="Class Type" name="classType" required placeholder="e.g. Amukhta Class" />
              <Input label="Batch Number" name="batchNumber" required placeholder="e.g. 27th Batch" />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Time" name="time" type="time" required />
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period</label>
                  <select name="period" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent dark:border-slate-800 rounded-2xl dark:text-white font-bold outline-none appearance-none">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Days</label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <label key={day} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                      <input type="checkbox" name={`day-${day}`} className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500" />
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-sm group-has-[:checked]:text-indigo-600">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, name, type = "text", required, placeholder }: { label: string, name: string, type?: string, required?: boolean, placeholder?: string }) => (
  <div className="flex flex-col gap-2 group">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">{label}</label>
    <input
      type={type}
      name={name}
      required={required}
      placeholder={placeholder}
      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent dark:border-slate-800 rounded-2xl dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-300 font-bold"
    />
  </div>
);

export default SedulousSection;