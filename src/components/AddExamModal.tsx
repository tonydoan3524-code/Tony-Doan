import React, { useState, useEffect } from 'react';
import { X, Calendar, Award, CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';
import { ExamRecord, RuleConfig } from '../types';
import { calculatePointResult, getMonthKeyFromDate } from '../utils/calculator';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (examData: Omit<ExamRecord, 'id' | 'createdAt'>, existingId?: string) => void;
  rules: RuleConfig;
  initialExam?: ExamRecord | null;
  defaultMonthKey?: string | null;
}

export const AddExamModal: React.FC<AddExamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  rules,
  initialExam,
  defaultMonthKey,
}) => {
  const [date, setDate] = useState<string>('');
  const [examScoreStr, setExamScoreStr] = useState<string>('7.5');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialExam) {
      setDate(initialExam.date);
      setExamScoreStr(initialExam.examScore.toString());
    } else {
      const today = new Date();
      let defaultDate = today.toISOString().split('T')[0];
      if (defaultMonthKey) {
        defaultDate = `${defaultMonthKey}-15`;
      }
      setDate(defaultDate);
      setExamScoreStr('7.5');
    }
    setError('');
  }, [initialExam, defaultMonthKey, isOpen]);

  if (!isOpen) return null;

  const scoreNum = parseFloat(examScoreStr);
  const isValidScore = !isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 10;
  const pointEvaluation = isValidScore ? calculatePointResult(scoreNum, rules) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError('Vui lòng chọn ngày thi');
      return;
    }
    if (!isValidScore) {
      setError('Điểm thi phải từ 0 đến 10');
      return;
    }

    const monthKey = getMonthKeyFromDate(date);
    const evalResult = calculatePointResult(scoreNum, rules);

    onSave(
      {
        studentId: initialExam?.studentId || 'student_1',
        date,
        month: monthKey,
        examScore: Math.round(scoreNum * 10) / 10,
        calculatedPoints: evalResult.points,
        pointType: evalResult.type,
      },
      initialExam?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {initialExam ? 'Chỉnh Sửa Điểm Thi' : 'Ghi Nhận Điểm Thi'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Tự động tính: ≥7.5 (+3) · 6-7.4 (0) · &lt;6 (-7)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Ultra clean & focused */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngày thi
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 font-medium"
            />
          </div>

          {/* Exam Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Điểm bài thi
              </label>
              <span className="text-sm font-bold text-slate-900">{examScoreStr} / 10đ</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                required
                autoFocus
                value={examScoreStr}
                onChange={(e) => setExamScoreStr(e.target.value)}
                className="w-24 px-3 py-2 text-base font-extrabold text-center bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
              />

              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={examScoreStr || '0'}
                onChange={(e) => setExamScoreStr(e.target.value)}
                className="flex-1 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Quick Score preset buttons */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {[
                { label: '5.0 (-7)', val: '5.0' },
                { label: '6.0 (0)', val: '6.0' },
                { label: '7.5 (+3)', val: '7.5' },
                { label: '8.0 (+3)', val: '8.0' },
                { label: '9.0 (+3)', val: '9.0' },
                { label: '10.0', val: '10.0' },
              ].map((preset) => (
                <button
                  type="button"
                  key={preset.val}
                  onClick={() => setExamScoreStr(preset.val)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    examScoreStr === preset.val
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* LIVE RESULT PREVIEW BOX */}
          {pointEvaluation && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                pointEvaluation.type === 'reward'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : pointEvaluation.type === 'neutral'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2">
                {pointEvaluation.type === 'reward' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {pointEvaluation.type === 'neutral' && (
                  <MinusCircle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                {pointEvaluation.type === 'penalty' && (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold leading-tight">
                    {pointEvaluation.type === 'reward' && 'Thưởng điểm (+3đ)'}
                    {pointEvaluation.type === 'neutral' && 'Giữ nguyên (0đ)'}
                    {pointEvaluation.type === 'penalty' && 'Bị trừ điểm (-7đ)'}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {scoreNum >= rules.highThreshold
                      ? `≥ ${rules.highThreshold}đ`
                      : scoreNum >= rules.neutralThreshold
                      ? `${rules.neutralThreshold} - ${rules.highThreshold - 0.1}đ`
                      : `< ${rules.neutralThreshold}đ`}
                  </div>
                </div>
              </div>

              <span
                className={`text-lg font-black tracking-tight ${
                  pointEvaluation.points > 0
                    ? 'text-emerald-700'
                    : pointEvaluation.points < 0
                    ? 'text-rose-700'
                    : 'text-amber-800'
                }`}
              >
                {pointEvaluation.points > 0
                  ? `+${pointEvaluation.points}đ`
                  : `${pointEvaluation.points}đ`}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              {initialExam ? 'Cập Nhật' : 'Lưu Điểm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
