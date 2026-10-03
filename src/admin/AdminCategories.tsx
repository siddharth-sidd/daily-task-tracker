import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Category } from '../types/index.ts';
import { Layers, Plus, Check, Shield } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0d9488');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCats = async () => {
    try {
      const list = await api.getCategories();
      setCategories(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createCategory(name.trim(), color);
      setName('');
      fetchCats();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">Categories & Priority Configuration</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure system-wide categories, colors, and priority weighting.
          </p>
        </div>
      </div>

      {/* Priority Weighting Overview */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-white">Priority Scoring Weights (Algorithm Rule 10)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <span className="font-bold block">Critical</span>
            <span className="text-[11px] text-slate-400">Weight: 4x points</span>
          </div>
          <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <span className="font-bold block">High</span>
            <span className="text-[11px] text-slate-400">Weight: 3x points</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <span className="font-bold block">Medium</span>
            <span className="text-[11px] text-slate-400">Weight: 2x points</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="font-bold block">Low</span>
            <span className="text-[11px] text-slate-400">Weight: 1x point</span>
          </div>
        </div>
      </div>

      {/* Add Category Form */}
      <form onSubmit={handleCreate} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-white text-sm">Add System Category</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name (e.g. Design, Operations)"
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 w-full"
          />
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-slate-400">Color:</span>
            {['#0d9488', '#6366f1', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#dc2626', '#06b6d4'].map(
              (hex) => (
                <button
                  type="button"
                  key={hex}
                  onClick={() => setColor(hex)}
                  className={`w-6 h-6 rounded-full ring-2 transition ${
                    color === hex ? 'ring-white scale-110' : 'ring-transparent'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              )
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-500 transition disabled:opacity-50 shrink-0"
          >
            Create Category
          </button>
        </div>
      </form>

      {/* Existing Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-bold text-white text-xs truncate">{cat.name}</span>
            </div>
            {cat.isSystem && (
              <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded font-mono">
                System
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
