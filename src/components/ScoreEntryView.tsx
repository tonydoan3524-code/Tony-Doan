import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  MinusCircle,
  AlertCircle,
  Plus,
  RotateCcw,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  PieChart,
  Percent,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { ExamRecord, MonthSummary, RuleConfig, StudentProfile } from '../types';
import { calculatePointResult, formatDateVN, getMonthKeyFromDate } from '../utils/calculator';

interface ScoreEntryViewProps {
  profile: StudentProfile;
  exams: ExamRecord[];
  rules: RuleConfig;
  allTimeCumulativePoints: number;
  monthlySummaries: MonthSummary[];
  onAddExam: (examData: Omit<ExamRecord, 'id' | 'createdAt'>) => void;
  onUpdateExam: (id: string, updated: Partial<ExamRecord>) => void;
  onDeleteExam: (id: string) => void;
  onResetToZero: () => void;
  onGoToSummary: () => void;
}

export const ScoreEntryView: React.FC<ScoreEntryViewProps> = ({
  profile,
  exams,
  rules,
  allTimeCumulativePoints,
  monthlySummaries,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onResetToZero,
  onGoToSummary,
}) => {
  // Input state
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [scoreStr, setScoreStr] = useState<string>('7.5');

  // Inline row edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editScoreStr, setEditScoreStr] = useState<string>('');

  // Clear all confirmation toggle
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState<boolean>(false);

  const numScore = parseFloat(scoreStr);
  const isValid = !isNaN(numScore) && numScore >= 0 && numScore <= 10;
  const evaluation = isValid ? calculatePointResult(numScore, rules) : null;

  // Calculate Reward / Penalty statistics
  const totalExams = exams.length;
  let rewardCount = 0;
  let neutralCount = 0;
  let penaltyCount = 0;

  for (const ex of exams) {
    if (ex.calculatedPoints > 0) rewardCount++;
    else if (ex.calculatedPoints === 0) neutralCount++;
    else penaltyCount++;
  }

  const rewardPercent = totalExams > 0 ? Math.round((rewardCount / totalExams) * 100) : 0;
  const neutralPercent = totalExams > 0 ? Math.round((neutralCount / totalExams) * 100) : 0;
  const penaltyPercent = totalExams > 0 ? Math.round((penaltyCount / totalExams) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !date) return;

    onAddExam({
      studentId: profile.id,
      date,
      month: getMonthKeyFromDate(date),
      examScore: Math.round(numScore * 10) / 10,
      calculatedPoints: evaluation!.points,
      pointType: evaluation!.type,
    });

    // Reset score input to 7.5 for convenient next entry
    setScoreStr('7.5');
  };

  // Start editing a row
  const handleStartEdit = (exam: ExamRecord) => {
    setEditingId(exam.id);
    setEditDate(exam.date);
    setEditScoreStr(exam.examScore.toString());
  };

  // Save inline edit
  const handleSaveEdit = (id: string) => {
    const parsed = parseFloat(editScoreStr);
    if (isNaN(parsed) || parsed < 0 || parsed > 10 || !editDate) return;

    const evalRes = calculatePointResult(parsed, rules);
    onUpdateExam(id, {
      date: editDate,
      month: getMonthKeyFromDate(editDate),
      examScore: Math.round(parsed * 10) / 10,
      calculatedPoints: evalRes.points,
      pointType: evalRes.type,
    });

    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* 2 MAIN CARDS: 1. ĐIỂM ĐƯỢC CỘNG & 2. TỈ LỆ THƯỞNG / PHẠT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Điểm Được Cộng & Lũy Kế Hiện Tại */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Điểm Được Cộng & Lũy Kế</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                {profile.name}
              </span>
            </div>

            {/* Big Cumulative Point Display */}
            <div className="mt-4 flex items-baseline gap-2">
              <span
                className={`text-4xl sm:text-5xl font-black tracking-tight ${
                  allTimeCumulativePoints > 0
                    ? 'text-emerald-600'
                    : allTimeCumulativePoints < 0
                    ? 'text-rose-600'
                    : 'text-slate-800'
                }`}
              >
                {allTimeCumulativePoints > 0
                  ? `+${allTimeCumulativePoints}`
                  : allTimeCumulativePoints}
              </span>
              <span className="text-sm font-bold text-slate-500">điểm tích lũy</span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {allTimeCumulativePoints > 0
                ? 'Đang có số điểm thưởng dương trong quỹ tích lũy'
                : allTimeCumulativePoints < 0
                ? 'Đang bị trừ âm quỹ do bài thi dưới 6.0 điểm'
                : 'Điểm khởi đầu: 0 điểm (sẵn sàng nhập mới)'}
            </p>
          </div>

          {/* Quy tắc tóm tắt ngắn gọn */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              ≥7.5đ (+3đ)
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 font-semibold text-amber-700">
              6.0 - 7.4đ (0đ)
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 font-semibold text-rose-700">
              &lt;6.0đ (-7đ)
            </span>
          </div>
        </div>

        {/* Card 2: Tỉ Lệ Thưởng / Phạt */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>Tỉ Lệ Thưởng / Phạt</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Tổng: <strong className="text-slate-900">{totalExams}</strong> lần thi
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="mt-4 w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
              {totalExams > 0 ? (
                <>
                  <div
                    style={{ width: `${rewardPercent}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`Thưởng: ${rewardPercent}%`}
                  />
                  <div
                    style={{ width: `${neutralPercent}%` }}
                    className="bg-amber-400 transition-all duration-500"
                    title={`Không đổi: ${neutralPercent}%`}
                  />
                  <div
                    style={{ width: `${penaltyPercent}%` }}
                    className="bg-rose-500 transition-all duration-500"
                    title={`Bị phạt: ${penaltyPercent}%`}
                  />
                </>
              ) : (
                <div className="w-full bg-slate-200" />
              )}
            </div>

            {/* Three Proportion Stats */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-800 block">
                  Thưởng (≥7.5)
                </span>
                <span className="text-base font-extrabold text-emerald-700">
                  {rewardPercent}%
                </span>
                <span className="text-[10px] text-emerald-600 block">({rewardCount} bài)</span>
              </div>

              <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                <span className="text-[11px] font-semibold text-amber-800 block">
                  Hòa (6-7.4)
                </span>
                <span className="text-base font-extrabold text-amber-700">
                  {neutralPercent}%
                </span>
                <span className="text-[10px] text-amber-600 block">({neutralCount} bài)</span>
              </div>

              <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-100">
                <span className="text-[11px] font-semibold text-rose-800 block">
                  Phạt (&lt;6.0)
                </span>
                <span className="text-base font-extrabold text-rose-700">
                  {penaltyPercent}%
                </span>
                <span className="text-[10px] text-rose-600 block">({penaltyCount} bài)</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 text-center">
            <button
              onClick={onGoToSummary}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Xem Bản Điểm & Tổng Kết Toàn Diện</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KHU VỰC NHẬP ĐIỂM ĐƠN GIẢN */}
      <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5 sm:p-6 bg-linear-to-b from-white via-indigo-50/10 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>Nhập Điểm Bài Thi Mới</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn ngày thi và điền điểm số $\rightarrow$ Điểm cộng dồn và tỉ lệ sẽ tự động cập nhật
            </p>
          </div>

          {/* Quick reset button */}
          <button
            onClick={onResetToZero}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
            title="Xóa trắng toàn bộ điểm để bắt đầu điền từ đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset điểm về 0</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input 1: Ngày thi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày thi
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium text-slate-900"
              />
            </div>

            {/* Input 2: Điểm bài thi */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Điểm bài thi (thang 10)
                </label>
                <span className="text-xs font-extrabold text-slate-900">
                  {scoreStr ? `${scoreStr} / 10đ` : 'Chưa nhập'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  autoFocus
                  placeholder="7.5"
                  value={scoreStr}
                  onChange={(e) => setScoreStr(e.target.value)}
                  className="w-28 px-3 py-2 text-lg font-black text-center bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                />
                <input
                  type="range"
                  step="0.1"
                  min="0"
                  max="10"
                  value={scoreStr || '0'}
                  onChange={(e) => setScoreStr(e.target.value)}
                  className="flex-1 accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-600 font-semibold text-[11px]">Chọn nhanh:</span>
            {[
              { val: '5.0', label: '5.0 (-7đ)' },
              { val: '5.5', label: '5.5 (-7đ)' },
              { val: '6.0', label: '6.0 (0đ)' },
              { val: '7.0', label: '7.0 (0đ)' },
              { val: '7.5', label: '7.5 (+3đ)' },
              { val: '8.0', label: '8.0 (+3đ)' },
              { val: '9.0', label: '9.0 (+3đ)' },
              { val: '10.0', label: '10 (+3đ)' },
            ].map((p) => (
              <button
                type="button"
                key={p.val}
                onClick={() => setScoreStr(p.val)}
                className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                  scoreStr === p.val
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* LIVE PREVIEW OF THE POINTS TO BE ADDED/SUBTRACTED */}
          {evaluation && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                evaluation.type === 'reward'
                  ? 'bg-emerald-50 border-emerald-200'
                  : evaluation.type === 'neutral'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {evaluation.type === 'reward' && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
                {evaluation.type === 'neutral' && (
                  <MinusCircle className="w-6 h-6 text-amber-600 shrink-0" />
                )}
                {evaluation.type === 'penalty' && (
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <span
                    className={`font-black text-sm block ${
                      evaluation.type === 'reward'
                        ? 'text-emerald-900'
                        : evaluation.type === 'neutral'
                        ? 'text-amber-900'
                        : 'text-rose-900'
                    }`}
                  >
                    {evaluation.type === 'reward' && 'Điểm đạt ≥ 7.5: ĐƯỢC THƯỞNG +3 ĐIỂM'}
                    {evaluation.type === 'neutral' && 'Điểm từ 6.0 đến 7.4: KHÔNG CỘNG KHÔNG TRỪ (0Đ)'}
                    {evaluation.type === 'penalty' && 'Điểm dưới 6.0: BỊ TRỪ -7 ĐIỂM'}
                  </span>
                  <span className="text-xs text-slate-600">
                    {evaluation.type === 'reward' &&
                      'Số điểm này sẽ được cộng thêm vào quỹ tích lũy.'}
                    {evaluation.type === 'neutral' &&
                      'Bảo toàn điểm số hiện tại, không thay đổi.'}
                    {evaluation.type === 'penalty' &&
                      'Số điểm này sẽ bị trừ trực tiếp vào quỹ tích lũy.'}
                  </span>
                </div>
              </div>

              <div className="text-right pl-3 shrink-0">
                <span
                  className={`text-2xl font-black ${
                    evaluation.points > 0
                      ? 'text-emerald-700'
                      : evaluation.points < 0
                      ? 'text-rose-700'
                      : 'text-amber-700'
                  }`}
                >
                  {evaluation.points > 0 ? `+${evaluation.points}đ` : `${evaluation.points}đ`}
                </span>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={!isValid}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lưu Điểm & Cộng Dồn Ngay</span>
          </button>
        </form>
      </div>

      {/* DANH SÁCH LỊCH SỬ ĐÃ NHẬP: HỖ TRỢ XÓA TỪNG BÀI HOẶC XÓA TẤT CẢ VÀ SỬA ĐIỂM */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Lịch Sử Điểm Đã Nhập ({exams.length} lần thi)
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Clear all button with inline confirmation */}
            {exams.length > 0 && (
              isConfirmingClearAll ? (
                <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 text-xs">
                  <span className="text-rose-700 font-semibold text-[11px]">Xác nhận xóa hết?</span>
                  <button
                    onClick={() => {
                      onResetToZero();
                      setIsConfirmingClearAll(false);
                    }}
                    className="px-2 py-0.5 bg-rose-600 text-white font-bold rounded hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    Xóa tất cả
                  </button>
                  <button
                    onClick={() => setIsConfirmingClearAll(false)}
                    className="px-2 py-0.5 bg-white text-slate-700 font-medium rounded border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmingClearAll(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  title="Xóa toàn bộ các lần thi này để làm sạch danh sách"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa hết danh sách này</span>
                </button>
              )
            )}

            <button
              onClick={onGoToSummary}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Mở Bản Tổng Kết Đầy Đủ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="font-semibold text-slate-700">Danh sách hiện đang trống (0 điểm)</p>
            <p className="mt-1">Hãy nhập ngày và điểm bài thi của bạn ở khung trên để bắt đầu!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] bg-slate-50/50">
                  <th className="py-2.5 px-3 w-14 text-center">Lần</th>
                  <th className="py-2.5 px-3 w-32">Ngày thi</th>
                  <th className="py-2.5 px-3 text-center w-28">Điểm bài thi</th>
                  <th className="py-2.5 px-3 text-center w-36">Điểm cộng / trừ</th>
                  <th className="py-2.5 px-3 text-right w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* Display ALL exams in descending order */}
                {[...exams].reverse().map((ex, idx) => {
                  const actualIndex = exams.length - idx;
                  const isPos = ex.calculatedPoints > 0;
                  const isNeg = ex.calculatedPoints < 0;
                  const isEditingThis = editingId === ex.id;

                  // Inline edit mode for this row
                  if (isEditingThis) {
                    const parsedEdit = parseFloat(editScoreStr);
                    const isEditValid =
                      !isNaN(parsedEdit) && parsedEdit >= 0 && parsedEdit <= 10;
                    const editEval = isEditValid
                      ? calculatePointResult(parsedEdit, rules)
                      : null;

                    return (
                      <tr key={ex.id} className="bg-indigo-50/50">
                        <td className="py-2 px-3 text-center font-bold text-indigo-600">
                          #{actualIndex}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="px-2 py-1 text-xs bg-white border border-indigo-300 rounded font-medium text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={editScoreStr}
                            onChange={(e) => setEditScoreStr(e.target.value)}
                            className="w-18 px-2 py-1 text-xs font-bold text-center bg-white border border-indigo-300 rounded text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {editEval && (
                            <span
                              className={`font-black px-2 py-0.5 rounded text-xs inline-flex items-center gap-1 ${
                                editEval.type === 'reward'
                                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                  : editEval.type === 'penalty'
                                  ? 'text-rose-700 bg-rose-50 border border-rose-200'
                                  : 'text-amber-700 bg-amber-50 border border-amber-200'
                              }`}
                            >
                              {editEval.points > 0
                                ? `+${editEval.points}đ`
                                : `${editEval.points}đ`}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveEdit(ex.id)}
                              title="Lưu thay đổi"
                              className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              title="Hủy"
                              className="p-1.5 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // Normal view mode for this row
                  return (
                    <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                        #{actualIndex}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {formatDateVN(ex.date)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-slate-900">
                        {ex.examScore.toFixed(1)} / 10đ
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`font-black px-2 py-0.5 rounded text-xs inline-flex items-center gap-1 ${
                            isPos
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : isNeg
                              ? 'text-rose-700 bg-rose-50 border border-rose-200'
                              : 'text-amber-700 bg-amber-50 border border-amber-200'
                          }`}
                        >
                          {isPos && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isNeg && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          {ex.calculatedPoints === 0 && <MinusCircle className="w-3 h-3 text-amber-600" />}
                          <span>
                            {isPos ? `+${ex.calculatedPoints}đ` : `${ex.calculatedPoints}đ`}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Sửa (Edit) button */}
                          <button
                            onClick={() => handleStartEdit(ex)}
                            title="Chỉnh sửa điểm này cho đúng"
                            className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {/* Xóa (Delete) button - INSTANT 1-CLICK DELETION */}
                          <button
                            onClick={() => onDeleteExam(ex.id)}
                            title="Xóa bài này ngay"
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
        )}
      </div>
    </div>
  );
};
