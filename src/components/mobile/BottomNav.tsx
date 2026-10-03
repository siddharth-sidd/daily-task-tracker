import React from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import { Home, Calendar, Plus, BarChart3, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsAddTaskOpen } = useTasks();

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-2">
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        {/* 1. Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'home' ? 'text-teal-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">Home</span>
        </button>

        {/* 2. Calendar */}
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'calendar' ? 'text-teal-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-1">Calendar</span>
        </button>

        {/* 3. Floating Add Task Action Button */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/40 hover:scale-105 active:scale-95 transition transform ring-4 ring-white"
            aria-label="Add Task"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-semibold text-slate-500 mt-0.5">Add</span>
        </div>

        {/* 4. Reports */}
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'reports' ? 'text-teal-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-1">Reports</span>
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'profile' ? 'text-teal-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
};
