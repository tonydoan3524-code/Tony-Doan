import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  MinusCircle,
  AlertCircle,
  Pencil,
  Trash2,
  Plus,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import { ExamRecord, MonthSummary, RuleConfig } from '../types';
import { calculatePointResult, formatDateVN, getMonthKeyFromDate } from '../utils/calculator';

interface MonthlyBreakdownProps {
  summaries: MonthSummary[];
  rules: RuleConfig;
  onEditExam: (exam: ExamRecord) => void;
  onDeleteExam: (id: string) => void;
  onQuickAdd: (examData: Omit<ExamRecord, 'id' | 'createdAt'>) => void;
  onOpenAddModal: () => void;
}

export const MonthlyBreakdown: React.FC<MonthlyBreakdownProps> = ({
  summaries,
  rules,
  onEditExam,
  onDeleteExam,
  onQuickAdd,
  onOpenAddModal,
}) => {
  // Inline quick-entry state for active month
  const [quickDate, setQuickDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [quickScore, setQuickScore] = useState<string>('7.5');

  const parsedQuickScore = parseFloat(quickScore);
  const isQuickScoreValid =
    !isNaN(parsedQuickScore) && parsedQuickScore >= 0 && parsedQuickScore <= 10;
  const quickEvaluation = isQuickScoreValid
    ? calculatePointResult(parsedQuickScore, rules)
    : null;

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isQuickScoreValid || !quickDate) return;

    onQuickAdd({
      studentId: 'student_1',
      date: quickDate,
      month: getMonthKeyFromDate(quickDate),
      examScore: Math.round(parsedQuickScore * 10) / 10,
      calculatedPoints: quickEvaluation!.points,
      pointType: quickEvaluation!.type,
    });

    // Reset score to default 7.5 for convenient next entry
    setQuickScore('7.5');
  };

  if (summaries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Chưa có bài thi nào được ghi nhận</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Nhập điểm bài thi bằng thanh công cụ nhanh bên dưới hoặc nhấn nút &ldquo;Nhập Điểm&rdquo; để bắt đầu lưu trữ và cộng dồn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Fast-Entry Bar */}
      <div className="bg-white p-4 rounded-xl border border-indigo-200/80 shadow-xs bg-linear-to-r from-white via-indigo-50/20 to-white">
        <form
          onSubmit={handleInlineSubmit}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-600 text-white">
              <Plus className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-900">
              Nhập nhanh điểm thi:
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Date input */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-medium text-[11px] text-slate-500">Ngày:</span>
              <input
                type="date"
                required
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Score input */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-medium text-[11px] text-slate-500">Điểm thi:</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={quickScore}
                onChange={(e) => setQuickScore(e.target.value)}
                placeholder="7.5"
                className="w-20 px-2 py-1 text-xs font-bold text-center bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400">/ 10đ</span>
            </div>

            {/* Instant calculated badge */}
            {quickEvaluation && (
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                  quickEvaluation.type === 'reward'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : quickEvaluation.type === 'neutral'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {quickEvaluation.points > 0 ? `+${quickEvaluation.points}đ` : `${quickEvaluation.points}đ`}
              </span>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isQuickScoreValid}
              className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-2xs transition-colors"
            >
              Lưu & Cộng Dồn
            </button>
          </div>
        </form>
      </div>

      {/* Month-by-month tables */}
      {summaries.map((summary) => {
        const isPositiveMonth = summary.monthlyPoints > 0;
        const isNegativeMonth = summary.monthlyPoints < 0;

        return (
          <div
            key={summary.monthKey}
            className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
          >
            {/* Month Header Banner */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>{summary.displayMonth}</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {summary.examCount} lần thi
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">
                  Điểm TB: <strong className="text-slate-700">{summary.avgExamScore.toFixed(1)}/10đ</strong>
                </span>
              </div>

              {/* Monthly Cumulative Calculation Formula */}
              <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs self-start md:self-auto">
                <span className="text-slate-500">
                  Trước:{' '}
                  <strong className="text-slate-800">
                    {summary.prevMonthCumulative > 0
                      ? `+${summary.prevMonthCumulative}đ`
                      : `${summary.prevMonthCumulative}đ`}
                  </strong>
                </span>
                <span className="text-slate-300 font-bold">+</span>
                <span className="text-slate-500">
                  Tháng này:{' '}
                  <strong
                    className={
                      isPositiveMonth
                        ? 'text-emerald-700'
                        : isNegativeMonth
                        ? 'text-rose-700'
                        : 'text-slate-800'
                    }
                  >
                    {isPositiveMonth ? `+${summary.monthlyPoints}đ` : `${summary.monthlyPoints}đ`}
                  </strong>
                </span>
                <span className="text-slate-300 font-bold">=</span>
                <span className="font-bold text-slate-900">
                  Chốt Lũy Kế:{' '}
                  <strong
                    className={`font-black ${
                      summary.cumulativePoints >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {summary.cumulativePoints > 0
                      ? `+${summary.cumulativePoints}đ`
                      : `${summary.cumulativePoints}đ`}
                  </strong>
                </span>
              </div>
            </div>

            {/* Streamlined Table (UNNECESSARY COLUMNS REMOVED) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4 w-14 text-center">Lần</th>
                    <th className="py-2.5 px-4 w-32">Ngày thi</th>
                    <th className="py-2.5 px-4 text-center w-28">Điểm bài thi</th>
                    <th className="py-2.5 px-4 text-center w-36">Thưởng / Phạt</th>
                    <th className="py-2.5 px-4 text-center w-36 font-bold text-slate-800">
                      Cộng dồn sau bài
                    </th>
                    <th className="py-2.5 px-4 w-20 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {summary.exams.map((exam, idx) => {
                    const isReward = exam.pointType === 'reward';
                    const isPenalty = exam.pointType === 'penalty';
                    const isNeutral = exam.pointType === 'neutral';

                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Lần thi */}
                        <td className="py-3 px-4 text-center font-bold text-slate-400">
                          #{idx + 1}
                        </td>

                        {/* Ngày thi */}
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                          {formatDateVN(exam.date)}
                        </td>

                        {/* Điểm bài thi */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded-md border ${
                              exam.examScore >= rules.highThreshold
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : exam.examScore >= rules.neutralThreshold
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {exam.examScore.toFixed(1)}
                            <span className="text-[10px] font-normal text-slate-500 ml-0.5">/10đ</span>
                          </span>
                        </td>

                        {/* Thưởng / Phạt theo quy tắc */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {isReward && (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>+{exam.calculatedPoints}đ</span>
                              <span className="text-[10px] font-normal text-emerald-600/80">(≥7.5)</span>
                            </span>
                          )}
                          {isNeutral && (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                              <MinusCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>0đ</span>
                              <span className="text-[10px] font-normal text-amber-600/80">(6-7.4)</span>
                            </span>
                          )}
                          {isPenalty && (
                            <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>{exam.calculatedPoints}đ</span>
                              <span className="text-[10px] font-normal text-rose-600/80">(&lt;6)</span>
                            </span>
                          )}
                        </td>

                        {/* Cộng dồn lũy kế sau bài thi */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`font-black text-xs ${
                              exam.runningBalanceAfter > 0
                                ? 'text-emerald-700'
                                : exam.runningBalanceAfter < 0
                                ? 'text-rose-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {exam.runningBalanceAfter > 0
                              ? `+${exam.runningBalanceAfter}đ`
                              : `${exam.runningBalanceAfter}đ`}
                          </span>
                        </td>

                        {/* Thao tác (Sửa / Xóa) */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditExam(exam)}
                              title="Chỉnh sửa điểm"
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteExam(exam.id)}
                              title="Xóa bài thi"
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
