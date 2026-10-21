import React, { useState, useEffect } from 'react';
import { X, Settings2, RotateCcw, CheckCircle2, MinusCircle, AlertCircle, Sparkles } from 'lucide-react';
import { DEFAULT_RULES, RuleConfig } from '../types';

interface RuleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: RuleConfig;
  onSave: (updated: RuleConfig) => void;
}

export const RuleSettingsModal: React.FC<RuleSettingsModalProps> = ({
  isOpen,
  onClose,
  rules,
  onSave,
}) => {
  const [highThreshold, setHighThreshold] = useState<number>(7.5);
  const [highPoints, setHighPoints] = useState<number>(3);
  const [neutralThreshold, setNeutralThreshold] = useState<number>(6.0);
  const [neutralPoints, setNeutralPoints] = useState<number>(0);
  const [lowPoints, setLowPoints] = useState<number>(-7);

  useEffect(() => {
    if (rules) {
      setHighThreshold(rules.highThreshold);
      setHighPoints(rules.highPoints);
      setNeutralThreshold(rules.neutralThreshold);
      setNeutralPoints(rules.neutralPoints);
      setLowPoints(rules.lowPoints);
    }
  }, [rules, isOpen]);

  if (!isOpen) return null;

  const handleResetDefault = () => {
    setHighThreshold(DEFAULT_RULES.highThreshold);
    setHighPoints(DEFAULT_RULES.highPoints);
    setNeutralThreshold(DEFAULT_RULES.neutralThreshold);
    setNeutralPoints(DEFAULT_RULES.neutralPoints);
    setLowPoints(DEFAULT_RULES.lowPoints);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      highThreshold: Number(highThreshold),
      highPoints: Number(highPoints),
      neutralThreshold: Number(neutralThreshold),
      neutralPoints: Number(neutralPoints),
      lowPoints: Number(lowPoints),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Cấu Hình Quy Tắc Tính Điểm</h2>
              <p className="text-xs text-slate-500">Mặc định theo yêu cầu: ≥7.5đ (+3), ≥6đ (0), &lt;6đ (-7)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mức Thưởng */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. Mốc Thưởng Điểm (Xuất sắc)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-emerald-800 font-medium mb-1">
                  Điểm bài thi từ:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-emerald-900 font-bold">≥</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={highThreshold}
                    onChange={(e) => setHighThreshold(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-emerald-300 rounded font-bold text-emerald-900"
                  />
                  <span className="text-[11px] text-emerald-800">đ</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-emerald-800 font-medium mb-1">
                  Số điểm thưởng:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-emerald-900 font-bold">+</span>
                  <input
                    type="number"
                    value={highPoints}
                    onChange={(e) => setHighPoints(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-emerald-300 rounded font-bold text-emerald-900"
                  />
                  <span className="text-[11px] text-emerald-800">đ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mức Hòa / Giữ Nguyên */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
              <MinusCircle className="w-4 h-4 text-amber-600" />
              <span>2. Mốc An Toàn (Không cộng / không trừ)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-amber-800 font-medium mb-1">
                  Điểm bài thi từ:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-amber-900 font-bold">≥</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={neutralThreshold}
                    onChange={(e) => setNeutralThreshold(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-amber-300 rounded font-bold text-amber-900"
                  />
                  <span className="text-[11px] text-amber-800">đ</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-amber-800 font-medium mb-1">
                  Số điểm thay đổi:
                </label>
                <input
                  type="number"
                  value={neutralPoints}
                  onChange={(e) => setNeutralPoints(Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs bg-white border border-amber-300 rounded font-bold text-amber-900 text-center"
                />
              </div>
            </div>
            <span className="text-[10px] text-amber-800/80 block mt-1.5">
              Áp dụng cho điểm từ {neutralThreshold}đ đến dưới {highThreshold}đ.
            </span>
          </div>

          {/* Mức Phạt */}
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>3. Mức Phạt (Dưới chuẩn {neutralThreshold}đ)</span>
            </div>
            <div>
              <label className="block text-[11px] text-rose-800 font-medium mb-1">
                Số điểm bị trừ khi &lt; {neutralThreshold}đ:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={lowPoints}
                  onChange={(e) => setLowPoints(Number(e.target.value))}
                  className="w-28 px-2.5 py-1 text-xs bg-white border border-rose-300 rounded font-bold text-rose-900"
                />
                <span className="text-[11px] text-rose-800 font-medium">điểm</span>
              </div>
            </div>
          </div>

          {/* Reset button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Lưu Quy Tắc
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
