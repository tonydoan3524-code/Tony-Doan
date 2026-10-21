import React from 'react';
import { Award, TrendingUp, TrendingDown, Target, FileText, CheckCircle2, MinusCircle, AlertCircle } from 'lucide-react';
import { MonthSummary, StudentProfile } from '../types';

interface StatsCardsProps {
  profile: StudentProfile;
  allSummaries: MonthSummary[];
  selectedSummary: MonthSummary | null;
  totalExamsCount: number;
  overallAvgExamScore: number;
  allTimeCumulativePoints: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  profile,
  allSummaries,
  selectedSummary,
  totalExamsCount,
  overallAvgExamScore,
  allTimeCumulativePoints,
}) => {
  // Counts across all exams or selected month
  const target = profile.targetPoints || 20;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((allTimeCumulativePoints / target) * 100))
  );

  // Totals
  let allRewards = 0;
  let allNeutrals = 0;
  let allPenalties = 0;

  for (const s of allSummaries) {
    allRewards += s.rewardCount;
    allNeutrals += s.neutralCount;
    allPenalties += s.penaltyCount;
  }

  // Monthly stats to display (either currently selected month or the latest month)
  const activeMonthSummary = selectedSummary || allSummaries[allSummaries.length - 1];
  const monthlyPoints = activeMonthSummary ? activeMonthSummary.monthlyPoints : 0;
  const monthlyCumulative = activeMonthSummary ? activeMonthSummary.cumulativePoints : allTimeCumulativePoints;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: All-Time Cumulative Points */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Tổng Điểm Cộng Dồn
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                allTimeCumulativePoints >= 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                allTimeCumulativePoints > 0
                  ? 'text-emerald-600'
                  : allTimeCumulativePoints < 0
                  ? 'text-rose-600'
                  : 'text-slate-700'
              }`}
            >
              {allTimeCumulativePoints > 0 ? `+${allTimeCumulativePoints}` : allTimeCumulativePoints}
            </span>
            <span className="text-xs font-semibold text-slate-500">điểm lũy kế</span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {allTimeCumulativePoints >= 0
              ? 'Tích lũy dương qua các tháng'
              : 'Đang bị âm điểm do các bài thi <6đ'}
          </p>
        </div>

        {/* Target Progress Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Target className="w-3 h-3 text-indigo-500" /> Mục tiêu: {target}đ
            </span>
            <span className="font-semibold text-slate-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                allTimeCumulativePoints >= target
                  ? 'bg-emerald-500'
                  : allTimeCumulativePoints > 0
                  ? 'bg-indigo-600'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 2: Current / Selected Month Points & Carryover */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {activeMonthSummary ? activeMonthSummary.displayMonth : 'Tháng Hiện Tại'}
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                monthlyPoints > 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : monthlyPoints < 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {monthlyPoints >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                monthlyPoints > 0
                  ? 'text-emerald-600'
                  : monthlyPoints < 0
                  ? 'text-rose-600'
                  : 'text-slate-700'
              }`}
            >
              {monthlyPoints > 0 ? `+${monthlyPoints}` : monthlyPoints}
            </span>
            <span className="text-xs font-semibold text-slate-500">điểm trong tháng</span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {activeMonthSummary
              ? `${activeMonthSummary.examCount} bài thi trong tháng`
              : 'Chưa có bài thi nào'}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center">
          <span>Lũy kế chốt cuối tháng:</span>
          <span className="font-bold text-slate-900">
            {monthlyCumulative > 0 ? `+${monthlyCumulative}đ` : `${monthlyCumulative}đ`}
          </span>
        </div>
      </div>

      {/* Card 3: Total Exams & Average Exam Score */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Bài Thi Đã Ghi Nhận
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalExamsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">bài thi</span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Lưu trữ qua {allSummaries.length} kỳ tháng
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center">
          <span>Điểm thi TB:</span>
          <span className="font-bold text-slate-900">
            {totalExamsCount > 0 ? `${overallAvgExamScore.toFixed(1)} / 10đ` : '—'}
          </span>
        </div>
      </div>

      {/* Card 4: Breakdown by Result Type */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
            Tỉ Lệ Thưởng / Phạt
          </span>

          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thưởng (≥7.5đ)</span>
              </span>
              <span className="font-bold text-emerald-700">{allRewards} bài</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5">
                <MinusCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Không đổi (6.0 - 7.4)</span>
              </span>
              <span className="font-bold text-amber-700">{allNeutrals} bài</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Phạt (&lt;6.0đ)</span>
              </span>
              <span className="font-bold text-rose-700">{allPenalties} bài</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          Tỉ lệ bài thưởng:{' '}
          <strong className="text-slate-800">
            {totalExamsCount > 0 ? Math.round((allRewards / totalExamsCount) * 100) : 0}%
          </strong>
        </div>
      </div>
    </div>
  );
};
