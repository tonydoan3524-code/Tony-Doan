import React from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { MonthSummary, StudentProfile } from '../types';

interface CumulativeChartProps {
  profile: StudentProfile;
  summaries: MonthSummary[];
  selectedMonthKey: string | null;
  onSelectMonth: (monthKey: string | null) => void;
}

export const CumulativeChart: React.FC<CumulativeChartProps> = ({
  profile,
  summaries,
  selectedMonthKey,
  onSelectMonth,
}) => {
  if (summaries.length === 0) {
    return null;
  }

  // Build points for chart: starting point + each month's cumulative
  const dataPoints = [
    {
      key: 'start',
      label: 'Ban đầu',
      monthPoints: 0,
      cumulative: profile.startingBalance || 0,
      examCount: 0,
      isStart: true,
    },
    ...summaries.map((s) => ({
      key: s.monthKey,
      label: s.displayMonth.replace('Tháng ', 'T'),
      fullLabel: s.displayMonth,
      monthPoints: s.monthlyPoints,
      cumulative: s.cumulativePoints,
      examCount: s.examCount,
      isStart: false,
    })),
  ];

  // Calculate scales for SVG
  const values = dataPoints.map((d) => d.cumulative);
  const minVal = Math.min(-10, ...values);
  const maxVal = Math.max(15, ...values);
  const range = maxVal - minVal || 1;

  const width = 800;
  const height = 220;
  const paddingX = 50;
  const paddingY = 35;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Zero line Y coordinate
  const zeroY = height - paddingY - ((0 - minVal) / range) * chartHeight;

  // Compute (x, y) for each data point
  const pointsWithCoords = dataPoints.map((d, index) => {
    const x =
      dataPoints.length > 1
        ? paddingX + (index / (dataPoints.length - 1)) * chartWidth
        : width / 2;
    const y = height - paddingY - ((d.cumulative - minVal) / range) * chartHeight;
    return { ...d, x, y };
  });

  // Construct SVG path for the curve/line
  const pathData = pointsWithCoords.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    // Simple smooth curve or line
    return `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Biểu Đồ Lũy Kế & Cộng Dồn Theo Từng Tháng
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Đường biểu diễn tổng điểm tích lũy sau khi cộng dồn kết quả các tháng
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Điểm tích lũy dương (≥ 0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Điểm bị âm (&lt; 0)</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none"
            style={{ maxHeight: '240px' }}
          >
            {/* Horizontal Grid lines */}
            <line
              x1={paddingX}
              y1={paddingY}
              x2={width - paddingX}
              y2={paddingY}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
            />

            {/* Zero Baseline */}
            {zeroY >= paddingY && zeroY <= height - paddingY && (
              <g>
                <line
                  x1={paddingX}
                  y1={zeroY}
                  x2={width - paddingX}
                  y2={zeroY}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 10}
                  y={zeroY + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  0đ
                </text>
              </g>
            )}

            {/* Connecting line */}
            <path
              d={pathData}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Vertical guidelines & Interactive Node circles */}
            {pointsWithCoords.map((pt) => {
              const isSelected = selectedMonthKey === pt.key;
              const isPositive = pt.cumulative >= 0;

              return (
                <g
                  key={pt.key}
                  className="cursor-pointer group"
                  onClick={() => !pt.isStart && onSelectMonth(isSelected ? null : pt.key)}
                >
                  {/* Subtle vertical dash line down to bottom */}
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x}
                    y2={height - paddingY}
                    stroke="#e2e8f0"
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray="2 2"
                  />

                  {/* Outer glow circle for selected or hovered */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 10 : 7}
                    fill={isPositive ? '#10b981' : '#f43f5e'}
                    fillOpacity={isSelected ? 0.25 : 0.15}
                    className="transition-all"
                  />

                  {/* Solid inner circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6 : 4.5}
                    fill={isPositive ? '#059669' : '#e11d48'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all"
                  />

                  {/* Cumulative Value Label directly above node */}
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    className={`text-[11px] font-bold ${
                      isPositive ? 'fill-emerald-700' : 'fill-rose-700'
                    }`}
                  >
                    {pt.cumulative > 0 ? `+${pt.cumulative}đ` : `${pt.cumulative}đ`}
                  </text>

                  {/* Month Label below */}
                  <text
                    x={pt.x}
                    y={height - paddingY + 18}
                    textAnchor="middle"
                    className={`text-[11px] ${
                      isSelected
                        ? 'fill-indigo-600 font-bold'
                        : 'fill-slate-600 font-medium'
                    }`}
                  >
                    {pt.label}
                  </text>

                  {/* Monthly change tag */}
                  {!pt.isStart && (
                    <text
                      x={pt.x}
                      y={height - paddingY + 31}
                      textAnchor="middle"
                      className={`text-[9.5px] ${
                        pt.monthPoints > 0
                          ? 'fill-emerald-600'
                          : pt.monthPoints < 0
                          ? 'fill-rose-600'
                          : 'fill-slate-400'
                      }`}
                    >
                      ({pt.monthPoints > 0 ? `+${pt.monthPoints}` : pt.monthPoints}đ)
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-2 text-center text-xs text-slate-500">
        💡 <span className="font-medium">Mẹo:</span> Nhấp vào mốc tháng trên biểu đồ để xem chi tiết các bài thi của tháng đó.
      </div>
    </div>
  );
};
