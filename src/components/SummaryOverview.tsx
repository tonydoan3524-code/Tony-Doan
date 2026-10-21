import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  MinusCircle,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Download,
  Layers,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MonthSummary, RuleConfig, StudentProfile } from '../types';
import { formatDateVN } from '../utils/calculator';

interface SummaryOverviewProps {
  profile: StudentProfile;
  summaries: MonthSummary[];
  rules: RuleConfig;
  allTimeCumulativePoints: number;
  totalExamsCount: number;
  overallAvgExamScore: number;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onBackToEntry?: () => void;
}

export const SummaryOverview: React.FC<SummaryOverviewProps> = ({
  profile,
  summaries,
  rules,
  allTimeCumulativePoints,
  totalExamsCount,
  overallAvgExamScore,
  onExportCSV,
  onExportJSON,
  onBackToEntry,
}) => {
  // Aggregate all-time reward/neutral/penalty counts
  let totalRewardCount = 0;
  let totalNeutralCount = 0;
  let totalPenaltyCount = 0;
  let totalBonusPointsEarned = 0;
  let totalPenaltyPointsLost = 0;

  for (const s of summaries) {
    totalRewardCount += s.rewardCount;
    totalNeutralCount += s.neutralCount;
    totalPenaltyCount += s.penaltyCount;

    for (const ex of s.exams) {
      if (ex.calculatedPoints > 0) {
        totalBonusPointsEarned += ex.calculatedPoints;
      } else if (ex.calculatedPoints < 0) {
        totalPenaltyPointsLost += Math.abs(ex.calculatedPoints);
      }
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. BẢNG TỔNG KẾT & CHỐT ĐIỂM TÍCH LŨY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Banner */}
        <div className="p-5 border-b border-slate-200 bg-linear-to-r from-slate-50 via-indigo-50/30 to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Bản Tổng Kết Lũy Kế & Bảng Điểm
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Người được tính điểm: <strong className="text-slate-800">{profile.name}</strong> · Tổng cộng{' '}
              <strong>{totalExamsCount}</strong> lần thi qua {summaries.length} kỳ tháng
            </p>
          </div>

          {/* Quick actions: Print & Export */}
          <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
            <button
              onClick={handlePrint}
              title="In bảng tổng kết hoặc lưu file PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>In / Lưu PDF</span>
            </button>
            <button
              onClick={onExportCSV}
              title="Tải bảng điểm dạng Excel"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shadow-2xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={onExportJSON}
              title="Sao lưu dữ liệu an toàn"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sao Lưu</span>
            </button>
          </div>
        </div>

        {/* High-level All-Time Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-200 text-xs bg-slate-50/50">
          <div className="p-4 text-center">
            <span className="text-slate-500 block mb-0.5">Tổng số lần thi</span>
            <span className="text-xl font-extrabold text-slate-900">{totalExamsCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Điểm TB: {overallAvgExamScore > 0 ? overallAvgExamScore.toFixed(1) : 0}/10đ
            </span>
          </div>

          <div className="p-4 text-center">
            <span className="text-emerald-700 font-medium block mb-0.5 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Thưởng (≥{rules.highThreshold}đ)</span>
            </span>
            <span className="text-xl font-extrabold text-emerald-700">
              {totalRewardCount}{' '}
              <span className="text-xs font-normal text-emerald-600">
                (+{totalBonusPointsEarned}đ)
              </span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {totalExamsCount > 0 ? Math.round((totalRewardCount / totalExamsCount) * 100) : 0}% tổng số bài
            </span>
          </div>

          <div className="p-4 text-center">
            <span className="text-rose-700 font-medium block mb-0.5 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Bị phạt (&lt;{rules.neutralThreshold}đ)</span>
            </span>
            <span className="text-xl font-extrabold text-rose-700">
              {totalPenaltyCount}{' '}
              <span className="text-xs font-normal text-rose-600">
                (-{totalPenaltyPointsLost}đ)
              </span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {totalExamsCount > 0 ? Math.round((totalPenaltyCount / totalExamsCount) * 100) : 0}% tổng số bài
            </span>
          </div>

          <div className="p-4 text-center bg-indigo-50/40">
            <span className="text-indigo-900 font-bold block mb-0.5">
              TỔNG ĐIỂM CỘNG DỒN
            </span>
            <span
              className={`text-2xl font-black ${
                allTimeCumulativePoints > 0
                  ? 'text-emerald-700'
                  : allTimeCumulativePoints < 0
                  ? 'text-rose-700'
                  : 'text-slate-800'
              }`}
            >
              {allTimeCumulativePoints > 0
                ? `+${allTimeCumulativePoints}`
                : allTimeCumulativePoints}
              <span className="text-xs font-bold ml-0.5">đ</span>
            </span>
            <span className="text-[11px] text-indigo-700 font-medium block mt-0.5">
              {allTimeCumulativePoints >= 0 ? 'Tích lũy dương' : 'Đang bị âm điểm'}
            </span>
          </div>
        </div>

        {/* Monthly Recap Table: Clean Rollup by Month */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-4 w-12 text-center">STT</th>
                <th className="py-2.5 px-4 min-w-[120px]">Kỳ Tháng</th>
                <th className="py-2.5 px-4 text-center w-24">Số bài thi</th>
                <th className="py-2.5 px-4 text-center w-24">≥7.5đ (+3)</th>
                <th className="py-2.5 px-4 text-center w-24">6-7.4đ (0)</th>
                <th className="py-2.5 px-4 text-center w-24">&lt;6đ (-7)</th>
                <th className="py-2.5 px-4 text-center w-28">Điểm tháng</th>
                <th className="py-2.5 px-4 text-center w-28">Trước chuyển sang</th>
                <th className="py-2.5 px-4 text-center w-36 font-black bg-indigo-50/60 text-indigo-950">
                  Chốt Cộng Dồn
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {summaries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Chưa có bài thi nào được ghi nhận. Hãy qua tab &ldquo;Bản Nhập Điểm&rdquo; để bắt đầu điền.
                  </td>
                </tr>
              ) : (
                summaries.map((s, idx) => {
                  const isMonthlyPos = s.monthlyPoints > 0;
                  const isMonthlyNeg = s.monthlyPoints < 0;
                  const isCumulPos = s.cumulativePoints > 0;
                  const isCumulNeg = s.cumulativePoints < 0;

                  return (
                    <tr key={s.monthKey} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-semibold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {s.displayMonth}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700">
                        {s.examCount}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700 bg-emerald-50/30">
                        {s.rewardCount}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-amber-700 bg-amber-50/30">
                        {s.neutralCount}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-rose-700 bg-rose-50/30">
                        {s.penaltyCount}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            isMonthlyPos
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : isMonthlyNeg
                              ? 'text-rose-700 bg-rose-50 border border-rose-200'
                              : 'text-slate-600 bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {isMonthlyPos ? `+${s.monthlyPoints}đ` : `${s.monthlyPoints}đ`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-500 whitespace-nowrap">
                        {s.prevMonthCumulative > 0
                          ? `+${s.prevMonthCumulative}đ`
                          : `${s.prevMonthCumulative}đ`}
                      </td>
                      <td className="py-3 px-4 text-center font-black text-sm whitespace-nowrap bg-indigo-50/40">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md ${
                            isCumulPos
                              ? 'text-emerald-800 bg-emerald-100 font-extrabold'
                              : isCumulNeg
                              ? 'text-rose-800 bg-rose-100 font-extrabold'
                              : 'text-slate-800 bg-slate-200'
                          }`}
                        >
                          {isCumulPos ? `+${s.cumulativePoints}đ` : `${s.cumulativePoints}đ`}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {summaries.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={2} className="py-3 px-4 text-center uppercase tracking-wider">
                    Tổng Lũy Kế
                  </td>
                  <td className="py-3 px-4 text-center">{totalExamsCount}</td>
                  <td className="py-3 px-4 text-center text-emerald-700">{totalRewardCount}</td>
                  <td className="py-3 px-4 text-center text-amber-700">{totalNeutralCount}</td>
                  <td className="py-3 px-4 text-center text-rose-700">{totalPenaltyCount}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-slate-700 font-extrabold">
                      {allTimeCumulativePoints - (profile.startingBalance || 0) > 0
                        ? `+${allTimeCumulativePoints - (profile.startingBalance || 0)}đ`
                        : `${allTimeCumulativePoints - (profile.startingBalance || 0)}đ`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-medium">
                    {profile.startingBalance || 0}đ
                  </td>
                  <td className="py-3 px-4 text-center text-base bg-indigo-100/70 text-indigo-950 font-black">
                    {allTimeCumulativePoints > 0
                      ? `+${allTimeCumulativePoints}đ`
                      : `${allTimeCumulativePoints}đ`}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 2. BẢN ĐIỂM CHI TIẾT CỦA MÌNH (ĐẦY ĐỦ TỪNG LẦN THI THEO THÁNG) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Bản Điểm Chi Tiết Từng Lần Thi
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Lưu trữ chi tiết để đối chiếu và kiểm tra
          </span>
        </div>

        {summaries.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            Chưa có lần thi nào trong bảng điểm.
          </div>
        ) : (
          <div className="space-y-6">
            {summaries.map((s) => (
              <div key={s.monthKey} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{s.displayMonth}</span>
                    <span className="text-slate-400 font-normal">({s.examCount} lần thi)</span>
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Chốt tháng: {s.cumulativePoints > 0 ? `+${s.cumulativePoints}đ` : `${s.cumulativePoints}đ`}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] bg-white">
                        <th className="py-2.5 px-4 w-14 text-center">Lần</th>
                        <th className="py-2.5 px-4 w-32">Ngày thi</th>
                        <th className="py-2.5 px-4 text-center w-28">Điểm bài thi</th>
                        <th className="py-2.5 px-4 text-center w-36">Thưởng / Phạt</th>
                        <th className="py-2.5 px-4 text-center w-36 font-bold text-slate-800">
                          Cộng dồn sau bài
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {s.exams.map((ex, idx) => {
                        const isReward = ex.pointType === 'reward';
                        const isNeutral = ex.pointType === 'neutral';
                        const isPenalty = ex.pointType === 'penalty';

                        return (
                          <tr key={ex.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 text-center font-bold text-slate-400">
                              #{idx + 1}
                            </td>
                            <td className="py-2.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                              {formatDateVN(ex.date)}
                            </td>
                            <td className="py-2.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded-md border ${
                                  ex.examScore >= rules.highThreshold
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : ex.examScore >= rules.neutralThreshold
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {ex.examScore.toFixed(1)}/10đ
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center whitespace-nowrap">
                              {isReward && (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>+{ex.calculatedPoints}đ</span>
                                </span>
                              )}
                              {isNeutral && (
                                <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                                  <MinusCircle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>0đ</span>
                                </span>
                              )}
                              {isPenalty && (
                                <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>{ex.calculatedPoints}đ</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-center whitespace-nowrap font-black">
                              <span
                                className={
                                  ex.runningBalanceAfter > 0
                                    ? 'text-emerald-700'
                                    : ex.runningBalanceAfter < 0
                                    ? 'text-rose-700'
                                    : 'text-slate-700'
                                }
                              >
                                {ex.runningBalanceAfter > 0
                                  ? `+${ex.runningBalanceAfter}đ`
                                  : `${ex.runningBalanceAfter}đ`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
