import React from 'react';
import {
  Award,
  Calendar,
  Download,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  User,
  Printer,
  Layers,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface HeaderProps {
  profile: StudentProfile;
  totalCumulativePoints: number;
  activeView: 'dashboard' | 'summary';
  setActiveView: (view: 'dashboard' | 'summary') => void;
  onOpenAddModal: () => void;
  onOpenProfileModal: () => void;
  onOpenRulesModal: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onResetSample: () => void;
  onClearAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  totalCumulativePoints,
  activeView,
  setActiveView,
  onOpenAddModal,
  onOpenProfileModal,
  onOpenRulesModal,
  onExportCSV,
  onExportJSON,
  onResetSample,
  onClearAll,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Main App Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Sổ Điểm Thưởng Phạt & Tích Lũy
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Lưu Trữ & Tổng Kết
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Quy tắc: ≥7.5đ (+3đ) · 6.0 – 7.4đ (0đ) · &lt;6.0đ (-7đ)
              </p>
            </div>
          </div>

          {/* Navigation Mode Switcher & Right actions */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bản Nhập Điểm
              </button>
              <button
                onClick={() => setActiveView('summary')}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeView === 'summary'
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Bản Tổng Kết</span>
              </button>
            </div>

            {/* Person Profile Badge button */}
            <button
              onClick={onOpenProfileModal}
              title="Đổi tên người được tính điểm"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-medium text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-slate-800">
                {profile.name}
              </span>
            </button>

            {/* Quick Rule config button */}
            <button
              onClick={onOpenRulesModal}
              title="Xem và chỉnh sửa mốc điểm thưởng/phạt"
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Export & Data menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Dữ liệu</span>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onExportCSV();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Xuất bảng tổng kết Excel (CSV)</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onExportJSON();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-indigo-600" />
                      <span>Sao lưu toàn bộ (JSON)</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onResetSample();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      <span>Nạp lại dữ liệu mẫu</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onClearAll();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-500" />
                      <span>Xóa trắng tất cả bài thi</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Main Primary CTA: Add Exam */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs hover:shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Điểm</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
