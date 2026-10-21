import { DEFAULT_RULES, ExamRecord, MonthSummary, RuleConfig, StudentProfile } from '../types';

/**
 * Tính điểm thưởng / phạt theo điểm bài thi:
 * - >= 7.5: Thưởng +3 điểm
 * - >= 6.0 và < 7.5: 0 điểm (Không cộng không trừ)
 * - < 6.0: Phạt -7 điểm
 */
export function calculatePointResult(
  examScore: number,
  rules: RuleConfig = DEFAULT_RULES
): {
  points: number;
  type: 'reward' | 'neutral' | 'penalty';
  label: string;
  badgeClass: string;
} {
  const rounded = Math.round(examScore * 100) / 100;

  if (rounded >= rules.highThreshold) {
    return {
      points: rules.highPoints,
      type: 'reward',
      label: `Thưởng +${rules.highPoints}đ`,
      badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  }

  if (rounded >= rules.neutralThreshold) {
    return {
      points: rules.neutralPoints,
      type: 'neutral',
      label: `Giữ nguyên (${rules.neutralPoints >= 0 ? '+' : ''}${rules.neutralPoints}đ)`,
      badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  }

  return {
    points: rules.lowPoints,
    type: 'penalty',
    label: `Phạt ${rules.lowPoints}đ`,
    badgeClass: 'text-rose-700 bg-rose-50 border-rose-200',
  };
}

/**
 * Format date display: "2026-10-15" -> "15/10/2026"
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Format month key: "2026-10" -> "Tháng 10/2026"
 */
export function formatMonthVN(monthKey: string): string {
  if (!monthKey) return '';
  const parts = monthKey.split('-');
  if (parts.length === 2) {
    return `Tháng ${parts[1]}/${parts[0]}`;
  }
  return monthKey;
}

/**
 * Lấy monthKey từ date: "2026-10-20" -> "2026-10"
 */
export function getMonthKeyFromDate(dateStr: string): string {
  if (!dateStr) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  return dateStr.slice(0, 7);
}

/**
 * Tính toán danh sách tổng hợp theo từng tháng và cộng dồn lũy kế qua các tháng
 */
export function computeMonthlySummaries(
  exams: ExamRecord[],
  profile: StudentProfile,
  rules: RuleConfig = DEFAULT_RULES
): MonthSummary[] {
  // 1. Sắp xếp tất cả bài thi theo ngày tăng dần
  const sortedExams = [...exams].sort((a, b) => {
    if (a.date === b.date) {
      return a.createdAt - b.createdAt;
    }
    return a.date.localeCompare(b.date);
  });

  // 2. Nhóm bài thi theo tháng
  const monthMap = new Map<string, ExamRecord[]>();

  for (const exam of sortedExams) {
    const mKey = exam.month || getMonthKeyFromDate(exam.date);
    if (!monthMap.has(mKey)) {
      monthMap.set(mKey, []);
    }
    monthMap.get(mKey)!.push(exam);
  }

  // Sắp xếp các tháng theo thứ tự thời gian tăng dần để cộng dồn
  const sortedMonths = Array.from(monthMap.keys()).sort();

  let runningCumulative = profile.startingBalance || 0;
  const summaries: MonthSummary[] = [];

  for (const monthKey of sortedMonths) {
    const monthExams = monthMap.get(monthKey) || [];
    const prevCumulative = runningCumulative;

    let monthPoints = 0;
    let totalScoreSum = 0;
    let rewardCount = 0;
    let neutralCount = 0;
    let penaltyCount = 0;

    const enrichedExams: (ExamRecord & { runningBalanceAfter: number })[] = [];

    for (const exam of monthExams) {
      // Re-evaluate point in case rules changed
      const evaluation = calculatePointResult(exam.examScore, rules);
      const points = evaluation.points;
      monthPoints += points;
      runningCumulative += points;
      totalScoreSum += exam.examScore;

      if (evaluation.type === 'reward') rewardCount++;
      else if (evaluation.type === 'neutral') neutralCount++;
      else penaltyCount++;

      enrichedExams.push({
        ...exam,
        calculatedPoints: points,
        pointType: evaluation.type,
        runningBalanceAfter: runningCumulative,
      });
    }

    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const monthNumber = parseInt(monthStr, 10);

    summaries.push({
      monthKey,
      displayMonth: `Tháng ${monthStr}/${yearStr}`,
      year,
      monthNumber,
      exams: enrichedExams,
      examCount: enrichedExams.length,
      avgExamScore: enrichedExams.length > 0 ? totalScoreSum / enrichedExams.length : 0,
      rewardCount,
      neutralCount,
      penaltyCount,
      monthlyPoints: monthPoints,
      prevMonthCumulative: prevCumulative,
      cumulativePoints: runningCumulative,
    });
  }

  return summaries;
}

/**
 * Dữ liệu mẫu ban đầu để người dùng dễ hình dung cách cộng dồn qua từng tháng
 */
export function getSampleData(): { profile: StudentProfile; exams: ExamRecord[] } {
  const profile: StudentProfile = {
    id: 'student_1',
    name: 'Nguyễn Văn An',
    code: 'HV-2026',
    startingBalance: 0,
    targetPoints: 20,
    createdAt: Date.now() - 90 * 86400000,
  };

  const sampleExamsRaw = [
    // Tháng 08/2026: 3 bài thi (+3, +3, 0) => Tháng: +6đ, Lũy kế: +6đ
    {
      date: '2026-08-05',
      subject: 'Toán Đại Số - Kiểm tra chương 1',
      score: 8.0,
      note: 'Làm tốt phần phương trình bậc hai',
    },
    {
      date: '2026-08-18',
      subject: 'Tiếng Anh - Bài kiểm tra 15 phút Unit 2',
      score: 7.5,
      note: 'Vừa đúng mốc thưởng',
    },
    {
      date: '2026-08-27',
      subject: 'Vật Lý - Bài thực hành',
      score: 6.5,
      note: 'Trên 6.0 nên không bị trừ điểm',
    },

    // Tháng 09/2026: 3 bài thi (-7, +3, -7) => Tháng: -11đ, Lũy kế: 6 - 11 = -5đ
    {
      date: '2026-09-08',
      subject: 'Hóa Học - Kiểm tra định kỳ',
      score: 5.0,
      note: 'Dưới 6 điểm nên bị trừ 7đ',
    },
    {
      date: '2026-09-19',
      subject: 'Ngữ Văn - Bài nghị luận văn học',
      score: 8.5,
      note: 'Bài viết sâu sắc, đạt điểm cao',
    },
    {
      date: '2026-09-28',
      subject: 'Toán Hình Học - Kiểm tra 1 tiết',
      score: 4.5,
      note: 'Cần ôn lại định lý sin cos',
    },

    // Tháng 10/2026: 4 bài thi (+3, +3, 0, +3) => Tháng: +9đ, Lũy kế: -5 + 9 = +4đ
    {
      date: '2026-10-04',
      subject: 'Tiếng Anh - Giữa kỳ',
      score: 9.0,
      note: 'Cố gắng bứt phá lại điểm',
    },
    {
      date: '2026-10-10',
      subject: 'Lịch Sử - Khảo sát',
      score: 7.8,
      note: 'Thuộc bài và liên hệ tốt',
    },
    {
      date: '2026-10-15',
      subject: 'Tin Học - Lập trình thuật toán',
      score: 6.8,
      note: 'Vùng an toàn (6.0 - 7.4)',
    },
    {
      date: '2026-10-20',
      subject: 'Toán Giải Tích - Kiểm tra tháng 10',
      score: 8.2,
      note: 'Phục hồi phong độ xuất sắc',
    },
  ];

  const exams: ExamRecord[] = sampleExamsRaw.map((item, idx) => {
    const evalRes = calculatePointResult(item.score, DEFAULT_RULES);
    return {
      id: `sample_exam_${idx + 1}`,
      studentId: profile.id,
      date: item.date,
      month: item.date.slice(0, 7),
      subject: item.subject,
      examScore: item.score,
      calculatedPoints: evalRes.points,
      pointType: evalRes.type,
      note: item.note,
      createdAt: new Date(item.date).getTime() + idx * 1000,
    };
  });

  return { profile, exams };
}
