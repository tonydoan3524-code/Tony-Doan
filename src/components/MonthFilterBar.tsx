import React from 'react';
import { Calendar, Filter, Search, X } from 'lucide-react';
import { MonthSummary } from '../types';

interface MonthFilterBarProps {
  summaries: MonthSummary[];
  selectedMonthKey: string | null;
  onSelectMonth: (monthKey: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const MonthFilterBar: React.FC<MonthFilterBarProps> = ({
  summaries,
  selectedMonthKey,
  onSelectMonth,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
      {/* Month Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
          <Calendar className="w-3.5 h-3.5" /> Xem kỳ:
        </span>

        <button
          onClick={() => onSelectMonth(null)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedMonthKey === null
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50'
          }`}
        >
          Tất cả các tháng ({summaries.length})
        </button>

        {summaries.map((s) => {
          const isSelected = selectedMonthKey === s.monthKey;
          return (
            <button
              key={s.monthKey}
              onClick={() => onSelectMonth(s.monthKey)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50'
              }`}
            >
              <span>{s.displayMonth}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : s.monthlyPoints > 0
                    ? 'text-emerald-700 bg-emerald-100'
                    : s.monthlyPoints < 0
                    ? 'text-rose-700 bg-rose-100'
                    : 'text-slate-600 bg-slate-200'
                }`}
              >
                {s.monthlyPoints > 0 ? `+${s.monthlyPoints}` : s.monthlyPoints}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative min-w-[220px]">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Lọc ngày thi (dd/mm)..."
          className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
