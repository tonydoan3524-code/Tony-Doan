import { DEFAULT_RULES, ExamRecord, MonthSummary, RuleConfig, StudentProfile } from '../types';
import { calculatePointResult, formatDateVN, formatMonthVN, getSampleData } from './calculator';

const STORAGE_KEY_EXAMS = 'app_score_tracker_exams_v1';
const STORAGE_KEY_PROFILE = 'app_score_tracker_profile_v1';
const STORAGE_KEY_RULES = 'app_score_tracker_rules_v1';

export function loadSavedState(): {
  profile: StudentProfile;
  exams: ExamRecord[];
  rules: RuleConfig;
} {
  try {
    const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    const savedExams = localStorage.getItem(STORAGE_KEY_EXAMS);
    const savedRules = localStorage.getItem(STORAGE_KEY_RULES);

    const defaultProfile: StudentProfile = {
      id: 'student_1',
      name: 'Người được tính điểm',
      startingBalance: 0,
      targetPoints: 20,
      createdAt: Date.now(),
    };

    const profile: StudentProfile = savedProfile ? JSON.parse(savedProfile) : defaultProfile;
    const exams: ExamRecord[] = savedExams ? JSON.parse(savedExams) : [];
    const rules: RuleConfig = savedRules ? JSON.parse(savedRules) : DEFAULT_RULES;

    return { profile, exams, rules };
  } catch (err) {
    console.warn('Lỗi khi đọc dữ liệu từ localStorage:', err);
    return {
      profile: {
        id: 'student_1',
        name: 'Người được tính điểm',
        startingBalance: 0,
        targetPoints: 20,
        createdAt: Date.now(),
      },
      exams: [],
      rules: DEFAULT_RULES,
    };
  }
}

export function resetAllDataToZero(): {
  profile: StudentProfile;
  exams: ExamRecord[];
  rules: RuleConfig;
} {
  const profile: StudentProfile = {
    id: 'student_1',
    name: 'Người được tính điểm',
    startingBalance: 0,
    targetPoints: 20,
    createdAt: Date.now(),
  };
  saveState(profile, [], DEFAULT_RULES);
  return { profile, exams: [], rules: DEFAULT_RULES };
}

export function saveState(profile: StudentProfile, exams: ExamRecord[], rules: RuleConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(exams));
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu vào localStorage:', err);
  }
}

/**
 * Xuất file CSV báo cáo chi tiết
 */
export function exportToCSV(
  profile: StudentProfile,
  summaries: MonthSummary[],
  rules: RuleConfig
): void {
  const rows: string[] = [];

  // Tiêu đề & Thông tin
  rows.push(`BÁO CÁO CỘNG ĐIỂM THƯỞNG PHẠT VÀ TÍCH LŨY THEO THÁNG`);
  rows.push(`Người được theo dõi: ${profile.name} (Mã: ${profile.code || 'N/A'})`);
  rows.push(
    `Quy tắc áp dụng: Điểm thi >= ${rules.highThreshold} (+${rules.highPoints}đ) | Từ ${rules.neutralThreshold} đến <${rules.highThreshold} (${rules.neutralPoints}đ) | < ${rules.neutralThreshold} (${rules.lowPoints}đ)`
  );
  rows.push(`Điểm số ban đầu: ${profile.startingBalance || 0}đ`);
  rows.push('');

  // Bảng 1: Tổng hợp các tháng
  rows.push('--- BẢNG TỔNG HỢP CỘNG DỒN THEO THÁNG ---');
  rows.push(
    'Tháng,Số bài thi,Điểm TB bài thi,Số bài thưởng (>=7.5),Số bài an toàn (6.0-7.4),Số bài phạt (<6.0),Điểm phát sinh trong tháng,Điểm lũy kế mang sang,Điểm cộng dồn cuối tháng'
  );

  for (const s of summaries) {
    rows.push(
      `"${s.displayMonth}",${s.examCount},"${s.avgExamScore.toFixed(2)}",${s.rewardCount},${s.neutralCount},${s.penaltyCount},${s.monthlyPoints > 0 ? '+' : ''}${s.monthlyPoints},${s.prevMonthCumulative},${s.cumulativePoints}`
    );
  }

  rows.push('');
  rows.push('--- CHI TIẾT TỪNG BÀI THI ---');
  rows.push('Ngày thi,Tháng,Tên bài thi / Môn học,Điểm bài thi,Điểm cộng/trừ,Lũy kế sau bài,Ghi chú');

  for (const s of summaries) {
    for (const ex of s.exams) {
      const pointStr = ex.calculatedPoints > 0 ? `+${ex.calculatedPoints}` : `${ex.calculatedPoints}`;
      const subName = ex.subject || `Bài thi ${formatDateVN(ex.date)}`;
      rows.push(
        `"${formatDateVN(ex.date)}","${formatMonthVN(s.monthKey)}","${subName.replace(/"/g, '""')}","${ex.examScore}","${pointStr}","${ex.runningBalanceAfter}"`
      );
    }
  }

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bang_Diem_Thuong_Phat_${profile.name.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Xuất file JSON để sao lưu dữ liệu
 */
export function exportToJSON(
  profile: StudentProfile,
  exams: ExamRecord[],
  rules: RuleConfig
): void {
  const data = {
    exportedAt: new Date().toISOString(),
    profile,
    rules,
    exams,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Sao_Luu_Diem_${profile.name.replace(/\s+/g, '_')}_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
