export interface RuleConfig {
  highThreshold: number; // e.g. 7.5
  highPoints: number; // +3
  neutralThreshold: number; // e.g. 6.0
  neutralPoints: number; // 0
  lowPoints: number; // -7
}

export const DEFAULT_RULES: RuleConfig = {
  highThreshold: 7.5,
  highPoints: 3,
  neutralThreshold: 6.0,
  neutralPoints: 0,
  lowPoints: -7,
};

export interface ExamRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  subject?: string;
  examScore: number; // e.g. 8.0, 7.5, 5.5
  calculatedPoints: number; // +3, 0, -7
  pointType: 'reward' | 'neutral' | 'penalty';
  note?: string;
  createdAt: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  code?: string;
  startingBalance: number; // Điểm mang sang ban đầu
  targetPoints?: number; // Mục tiêu tích lũy (ví dụ 30đ)
  createdAt: number;
}

export interface MonthSummary {
  monthKey: string; // "2026-10"
  displayMonth: string; // "Tháng 10/2026"
  year: number;
  monthNumber: number;
  exams: (ExamRecord & { runningBalanceAfter: number })[];
  examCount: number;
  avgExamScore: number;
  rewardCount: number; // >= 7.5
  neutralCount: number; // 6.0 - 7.4
  penaltyCount: number; // < 6.0
  monthlyPoints: number; // Net points in this month
  prevMonthCumulative: number; // Điểm lũy kế từ trước tháng này
  cumulativePoints: number; // Điểm lũy kế sau khi cộng/trừ tháng này
}
