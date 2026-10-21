/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Layers,
  Printer,
} from 'lucide-react';
import { DEFAULT_RULES, ExamRecord, MonthSummary, RuleConfig, StudentProfile } from './types';
import {
  computeMonthlySummaries,
  getSampleData,
  calculatePointResult,
} from './utils/calculator';
import {
  exportToCSV,
  exportToJSON,
  loadSavedState,
  saveState,
  resetAllDataToZero,
} from './utils/storage';
import { Header } from './components/Header';
import { ScoreEntryView } from './components/ScoreEntryView';
import { SummaryOverview } from './components/SummaryOverview';
import { CumulativeChart } from './components/CumulativeChart';
import { ProfileModal } from './components/ProfileModal';
import { RuleSettingsModal } from './components/RuleSettingsModal';

export default function App() {
  // Load saved state or empty fresh slate
  const [profile, setProfile] = useState<StudentProfile>(() => loadSavedState().profile);
  const [exams, setExams] = useState<ExamRecord[]>(() => loadSavedState().exams);
  const [rules, setRules] = useState<RuleConfig>(() => loadSavedState().rules);

  // Active view: 'dashboard' (Bản Nhập Điểm) vs 'summary' (Bản Tổng Kết)
  const [activeView, setActiveView] = useState<'dashboard' | 'summary'>('dashboard');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'danger';
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveState(profile, exams, rules);
  }, [profile, exams, rules]);

  const showToast = (text: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Re-compute monthly summaries and cumulative balances whenever exams/profile/rules change
  const monthlySummaries: MonthSummary[] = useMemo(() => {
    return computeMonthlySummaries(exams, profile, rules);
  }, [exams, profile, rules]);

  // All-time cumulative points
  const allTimeCumulativePoints = useMemo(() => {
    if (monthlySummaries.length === 0) return profile.startingBalance || 0;
    return monthlySummaries[monthlySummaries.length - 1].cumulativePoints;
  }, [monthlySummaries, profile.startingBalance]);

  // Overall average score
  const overallAvgExamScore = useMemo(() => {
    if (exams.length === 0) return 0;
    const total = exams.reduce((acc, curr) => acc + curr.examScore, 0);
    return total / exams.length;
  }, [exams]);

  // Add Exam handler (Instant from ScoreEntryView)
  const handleAddExam = (examData: Omit<ExamRecord, 'id' | 'createdAt'>) => {
    const newExam: ExamRecord = {
      id: `exam_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
      ...examData,
    };
    setExams((prev) => [...prev, newExam]);

    const evalResult = calculatePointResult(examData.examScore, rules);
    if (evalResult.type === 'reward') {
      showToast(`+${evalResult.points} điểm thưởng (≥7.5đ)`, 'success');
    } else if (evalResult.type === 'neutral') {
      showToast('0 điểm (giữ nguyên)', 'info');
    } else {
      showToast(`${evalResult.points} điểm phạt (<6.0đ)`, 'danger');
    }
  };

  const handleDeleteExam = (id: string) => {
    const toDelete = exams.find((e) => e.id === id);
    if (!toDelete) return;

    setExams((prev) => prev.filter((e) => e.id !== id));
    showToast(`Đã xóa bài thi (${toDelete.examScore} điểm).`, 'info');
  };

  const handleUpdateExam = (id: string, updated: Partial<ExamRecord>) => {
    setExams((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast('Đã cập nhật bài thi thành công!');
  };

  // Reset to Zero handler: immediate clean reset without blocking dialog
  const handleResetToZero = () => {
    const reset = resetAllDataToZero();
    setProfile(reset.profile);
    setExams([]);
    setRules(DEFAULT_RULES);
    setSelectedMonthKey(null);
    showToast('Đã xóa sạch toàn bộ điểm về 0 để bạn tự điền mới!', 'info');
  };

  const handleResetSample = () => {
    const sample = getSampleData();
    setProfile(sample.profile);
    setExams(sample.exams);
    setRules(DEFAULT_RULES);
    setSelectedMonthKey(null);
    showToast('Đã nạp dữ liệu mẫu!');
  };

  const handleExportCSV = () => {
    exportToCSV(profile, monthlySummaries, rules);
    showToast('Đã tải xuống file báo cáo Excel (CSV).');
  };

  const handleExportJSON = () => {
    exportToJSON(profile, exams, rules);
    showToast('Đã xuất file sao lưu JSON.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : toastMessage.type === 'danger'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-800 text-white border-slate-900'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {toastMessage.type === 'danger' && <AlertCircle className="w-4 h-4 shrink-0" />}
            {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        profile={profile}
        totalCumulativePoints={allTimeCumulativePoints}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAddModal={() => setActiveView('dashboard')}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onResetSample={handleResetSample}
        onClearAll={handleResetToZero}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* VIEW 1: BẢN NHẬP ĐIỂM (Chỉ thể hiện điểm được cộng & Tỉ lệ thưởng/phạt & Ô nhập điểm) */}
        {activeView === 'dashboard' ? (
          <ScoreEntryView
            profile={profile}
            exams={exams}
            rules={rules}
            allTimeCumulativePoints={allTimeCumulativePoints}
            monthlySummaries={monthlySummaries}
            onAddExam={handleAddExam}
            onUpdateExam={handleUpdateExam}
            onDeleteExam={handleDeleteExam}
            onResetToZero={handleResetToZero}
            onGoToSummary={() => setActiveView('summary')}
          />
        ) : (
          /* VIEW 2: BẢN TỔNG KẾT (Nơi thể hiện đầy đủ bản điểm của mình & Tổng kết lũy kế) */
          <div className="space-y-6">
            <SummaryOverview
              profile={profile}
              summaries={monthlySummaries}
              rules={rules}
              allTimeCumulativePoints={allTimeCumulativePoints}
              totalExamsCount={exams.length}
              overallAvgExamScore={overallAvgExamScore}
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              onBackToEntry={() => setActiveView('dashboard')}
            />

            {/* Visual Cumulative Progression Chart Over Months */}
            {monthlySummaries.length > 0 && (
              <CumulativeChart
                profile={profile}
                summaries={monthlySummaries}
                selectedMonthKey={selectedMonthKey}
                onSelectMonth={setSelectedMonthKey}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Quy định: ≥ {rules.highThreshold}đ (+{rules.highPoints}đ) · {rules.neutralThreshold} - {rules.highThreshold - 0.1}đ ({rules.neutralPoints}đ) · &lt; {rules.neutralThreshold}đ ({rules.lowPoints}đ)
          </span>
          <button
            onClick={handleResetToZero}
            className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
          >
            Reset về 0 để nhập mới
          </button>
        </div>
      </footer>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={(updated) => {
          setProfile(updated);
          showToast('Đã lưu thông tin hồ sơ.');
        }}
      />

      {/* Rule Settings Modal */}
      <RuleSettingsModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={rules}
        onSave={(updated) => {
          setRules(updated);
          showToast('Đã cập nhật quy tắc tính điểm.');
        }}
      />
    </div>
  );
}
