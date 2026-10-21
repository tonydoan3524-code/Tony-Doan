import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, MinusCircle, Calculator, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { RuleConfig } from '../types';
import { calculatePointResult } from '../utils/calculator';

interface RuleCardProps {
  rules: RuleConfig;
  onOpenSettings: () => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({ rules, onOpenSettings }) => {
  const [testScore, setTestScore] = useState<string>('7.5');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const numericScore = parseFloat(testScore);
  const isValid = !isNaN(numericScore) && numericScore >= 0 && numericScore <= 10;
  const preview = isValid ? calculatePointResult(numericScore, rules) : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner: The 3 Core Rules */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quy Chế Tính Điểm Thưởng / Phạt
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-indigo-600 font-medium">Tự động tính theo bài thi</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium self-start sm:self-auto"
          >
            <span>{isExpanded ? 'Thu gọn công cụ thử' : 'Thử tính điểm nhanh'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 3 Rule Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Rule 1: >= 7.5 */}
          <div className="rounded-lg p-3.5 bg-emerald-50/70 border border-emerald-200/80 transition-all hover:bg-emerald-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-emerald-900">
                  Điểm thi ≥ {rules.highThreshold}
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
                +{rules.highPoints} điểm
              </span>
            </div>
            <p className="mt-1.5 text-xs text-emerald-800/90 leading-relaxed">
              Bài thi xuất sắc đạt từ {rules.highThreshold} trở lên sẽ được <strong className="font-semibold text-emerald-950">thưởng +{rules.highPoints}đ</strong> vào quỹ tích lũy.
            </p>
          </div>

          {/* Rule 2: 6.0 to < 7.5 */}
          <div className="rounded-lg p-3.5 bg-amber-50/60 border border-amber-200/80 transition-all hover:bg-amber-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MinusCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-semibold text-amber-900">
                  Từ {rules.neutralThreshold} đến &lt; {rules.highThreshold}
                </span>
              </div>
              <span className="text-sm font-bold text-amber-800 bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                0 điểm
              </span>
            </div>
            <p className="mt-1.5 text-xs text-amber-800/90 leading-relaxed">
              Điểm đạt an toàn trên {rules.neutralThreshold}đ: <strong className="font-semibold text-amber-950">Không cộng không trừ</strong> (bảo toàn điểm hiện có).
            </p>
          </div>

          {/* Rule 3: < 6.0 */}
          <div className="rounded-lg p-3.5 bg-rose-50/70 border border-rose-200/80 transition-all hover:bg-rose-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-xs font-semibold text-rose-900">
                  Dưới {rules.neutralThreshold} điểm
                </span>
              </div>
              <span className="text-sm font-bold text-rose-700 bg-white/80 px-2 py-0.5 rounded border border-rose-200">
                {rules.lowPoints} điểm
              </span>
            </div>
            <p className="mt-1.5 text-xs text-rose-800/90 leading-relaxed">
              Bài thi dưới chuẩn &lt;{rules.neutralThreshold}đ: <strong className="font-semibold text-rose-950">Bị trừ {-rules.lowPoints}đ</strong> trực tiếp vào điểm tích lũy tháng.
            </p>
          </div>
        </div>

        {/* Expandable Quick Sandbox Simulator */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium text-slate-700">
                  Thử nghiệm điểm bài thi:
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={testScore}
                    onChange={(e) => setTestScore(e.target.value)}
                    className="w-20 px-2.5 py-1 text-sm bg-white border border-slate-300 rounded-md font-semibold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="7.5"
                  />
                  <span className="text-xs text-slate-500">/ 10đ</span>
                </div>

                {/* Quick preset buttons */}
                <div className="flex items-center gap-1">
                  {[5.0, 5.8, 6.0, 7.0, 7.5, 8.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setTestScore(s.toString())}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        parseFloat(testScore) === s
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Instant Result */}
                {preview ? (
                  <div
                    className={`text-xs font-semibold px-3 py-1 rounded-md border flex items-center gap-1.5 ${preview.badgeClass}`}
                  >
                    <span>Kết quả:</span>
                    <span className="text-sm font-bold">
                      {preview.points > 0 ? `+${preview.points}đ` : `${preview.points}đ`}
                    </span>
                    <span className="text-xs font-normal">({preview.label})</span>
                  </div>
                ) : (
                  <span className="text-xs text-rose-500">Điểm không hợp lệ (0-10)</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
