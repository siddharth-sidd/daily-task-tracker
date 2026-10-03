import React, { useMemo, useRef } from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const DateStrip: React.FC = () => {
  const { selectedDate, setSelectedDate } = useTasks();
  const scrollRef = useRef<HTMLDivElement>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Generate a 14-day window: 4 days before today and 9 days ahead
  const dateList = useMemo(() => {
    const list: { fullDate: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
    const base = new Date();
    for (let i = -4; i <= 9; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const fullDate = d.toISOString().split('T')[0];
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
      const dayNum = d.getDate();
      list.push({
        fullDate,
        dayName,
        dayNum,
        isToday: fullDate === todayStr,
      });
    }
    return list;
  }, [todayStr]);

  const handleScroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-2.5 px-4 bg-white border-b border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-xs font-semibold text-slate-700">
            {selectedDate === todayStr ? 'Today Schedule' : 'Schedule for ' + selectedDate}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {selectedDate !== todayStr && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full transition"
            >
              Today
            </button>
          )}
          <button
            onClick={() => handleScroll(-140)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleScroll(140)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal date pill selector */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dateList.map((item) => {
          const isSelected = item.fullDate === selectedDate;
          return (
            <button
              key={item.fullDate}
              onClick={() => setSelectedDate(item.fullDate)}
              className={`flex flex-col items-center justify-center min-w-12 h-14 rounded-2xl transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/25 scale-105 ring-2 ring-teal-600 ring-offset-2'
                  : item.isToday
                  ? 'bg-teal-50/80 text-teal-800 border border-teal-200/80 hover:bg-teal-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <span className={`text-[10px] font-medium uppercase tracking-tight ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                {item.dayName}
              </span>
              <span className="text-base font-bold leading-none mt-0.5">
                {item.dayNum}
              </span>
              {item.isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-teal-600 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
