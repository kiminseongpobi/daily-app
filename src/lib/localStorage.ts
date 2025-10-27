// localStorage를 사용한 데모 인증 및 데이터 관리
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface DailyReport {
  id: string;
  user_id: string;
  date: string;
  achievements: string;
  completed_tasks: string;
  ideas_suggestions: string;
  tomorrow_tasks: string;
  created_at: string;
}

export interface AISummary {
  id: string;
  date: string;
  content: string;
  report_count: number;
  created_at: string;
}

export interface ExportData {
  USERS?: User[];
  CURRENT_USER?: User;
  REPORTS?: DailyReport[];
  AI_SUMMARIES?: AISummary[];
  USER_PASSWORDS?: Record<string, string>;
}

// localStorage 키 상수
const STORAGE_KEYS = {
  USERS: 'daily_report_users',
  CURRENT_USER: 'daily_report_current_user',
  REPORTS: 'daily_report_reports',
  AI_SUMMARIES: 'daily_report_ai_summaries',
  USER_PASSWORDS: 'daily_report_passwords'
};

// 유틸리티 함수
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// 간단한 비밀번호 해싱 (실제 프로덕션에서는 더 강력한 해싱 사용)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  return hash.toString();
};

// 비밀번호 저장/검증 헬퍼
const passwordHelpers = {
  save: (userId: string, password: string) => {
    const passwords = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PASSWORDS) || '{}');
    passwords[userId] = hashPassword(password);
    localStorage.setItem(STORAGE_KEYS.USER_PASSWORDS, JSON.stringify(passwords));
  },
  
  verify: (userId: string, password: string): boolean => {
    const passwords = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PASSWORDS) || '{}');
    return passwords[userId] === hashPassword(password);
  }
};

// 인증 관련 함수
export const authHelpers = {
  // 회원가입
  async signUp(email: string, password: string, name: string): Promise<User> {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    
    // 이메일 중복 체크
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('올바른 이메일 형식이 아닙니다.');
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
    }

    // 이름 검증
    if (name.trim().length < 2) {
      throw new Error('이름은 최소 2자 이상이어야 합니다.');
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      created_at: new Date().toISOString()
    };

    // 사용자 정보 저장
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    
    // 비밀번호 저장
    passwordHelpers.save(newUser.id, password);
    
    // 자동 로그인
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    
    return newUser;
  },

  // 로그인
  async signIn(email: string, password: string): Promise<User> {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email.toLowerCase().trim());
    
    if (!user) {
      throw new Error('존재하지 않는 계정입니다.');
    }

    // 비밀번호 검증
    if (!passwordHelpers.verify(user.id, password)) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  // 현재 사용자 가져오기
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  },

  // 로그아웃
  signOut(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // 사용자 프로필 업데이트
  async updateProfile(userId: string, updates: { name?: string; email?: string }): Promise<User> {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 이메일 변경 시 중복 체크
    if (updates.email && updates.email !== users[userIndex].email) {
      const emailExists = users.some(u => u.email === updates.email?.toLowerCase().trim() && u.id !== userId);
      if (emailExists) {
        throw new Error('이미 사용 중인 이메일입니다.');
      }
    }

    const updatedUser = {
      ...users[userIndex],
      ...(updates.name && { name: updates.name.trim() }),
      ...(updates.email && { email: updates.email.toLowerCase().trim() })
    };

    users[userIndex] = updatedUser;
    saveToStorage(STORAGE_KEYS.USERS, users);

    // 현재 로그인한 사용자라면 세션도 업데이트
    const currentUser = authHelpers.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }

    return updatedUser;
  }
};

// 데이터베이스 헬퍼 함수
export const dbHelpers = {
  // 회원가입 (authHelpers와 동일한 인터페이스 제공)
  signUp: authHelpers.signUp,
  
  // 로그인 (authHelpers와 동일한 인터페이스 제공)
  signIn: authHelpers.signIn,
  
  // 로그아웃 (authHelpers와 동일한 인터페이스 제공)
  signOut: authHelpers.signOut,
  
  // 현재 사용자 (authHelpers와 동일한 인터페이스 제공)
  getCurrentUser: authHelpers.getCurrentUser,

  // 일일 리포트 저장/업데이트
  async upsertDailyReport(report: Omit<DailyReport, 'id' | 'created_at'>): Promise<DailyReport> {
    const reports = getFromStorage<DailyReport>(STORAGE_KEYS.REPORTS);
    
    // 같은 사용자, 같은 날짜의 기존 리포트 찾기
    const existingIndex = reports.findIndex(
      r => r.user_id === report.user_id && r.date === report.date
    );

    const reportData: DailyReport = {
      ...report,
      id: existingIndex >= 0 ? reports[existingIndex].id : `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: existingIndex >= 0 ? reports[existingIndex].created_at : new Date().toISOString()
    };

    if (existingIndex >= 0) {
      reports[existingIndex] = reportData;
    } else {
      reports.push(reportData);
    }

    saveToStorage(STORAGE_KEYS.REPORTS, reports);
    return reportData;
  },

  // 특정 날짜의 모든 리포트 가져오기
  async getDailyReports(date: string): Promise<(DailyReport & { profiles: { name: string } })[]> {
    const reports = getFromStorage<DailyReport>(STORAGE_KEYS.REPORTS);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    
    const dateReports = reports.filter(r => r.date === date);
    
    return dateReports.map(report => {
      const user = users.find(u => u.id === report.user_id);
      return {
        ...report,
        profiles: {
          name: user?.name || '알 수 없음'
        }
      };
    });
  },

  // AI 요약 생성/업데이트
  async createAISummary(summary: AISummary): Promise<AISummary> {
    const summaries = getFromStorage<AISummary>(STORAGE_KEYS.AI_SUMMARIES);
    
    const existingIndex = summaries.findIndex(s => s.date === summary.date);
    
    if (existingIndex >= 0) {
      summaries[existingIndex] = summary;
    } else {
      summaries.push(summary);
    }

    saveToStorage(STORAGE_KEYS.AI_SUMMARIES, summaries);
    return summary;
  },

  // AI 요약 가져오기
  async getAISummary(date: string): Promise<AISummary | null> {
    const summaries = getFromStorage<AISummary>(STORAGE_KEYS.AI_SUMMARIES);
    return summaries.find(s => s.date === date) || null;
  },

  // 모든 사용자 목록 가져오기 (관리자용)
  async getAllUsers(): Promise<User[]> {
    return getFromStorage<User>(STORAGE_KEYS.USERS);
  },

  // 사용자별 리포트 통계 가져오기
  async getUserReportStats(userId: string): Promise<{ totalReports: number; lastReportDate: string | null }> {
    const reports = getFromStorage<DailyReport>(STORAGE_KEYS.REPORTS);
    const userReports = reports.filter(r => r.user_id === userId);
    
    return {
      totalReports: userReports.length,
      lastReportDate: userReports.length > 0 
        ? userReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : null
    };
  }
};

// 초기 데모 데이터 설정
export const initializeDemoData = () => {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  
  // 데모 사용자가 없으면 생성
  if (users.length === 0) {
    const demoUser: User = {
      id: 'demo_user_1',
      email: 'demo@company.com',
      name: '데모 사용자',
      created_at: new Date().toISOString()
    };
    
    saveToStorage(STORAGE_KEYS.USERS, [demoUser]);
    // 데모 사용자 비밀번호 설정 (demo123)
    passwordHelpers.save(demoUser.id, 'demo123');
  }
};

// 데이터 초기화 (개발/테스트용)
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// 데이터 내보내기 (백업용)
export const exportData = (): ExportData => {
  const data: ExportData = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const value = localStorage.getItem(key);
    if (value) {
      data[name as keyof ExportData] = JSON.parse(value);
    }
  });
  return data;
};

// 데이터 가져오기 (복원용)
export const importData = (data: ExportData) => {
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const dataKey = name as keyof ExportData;
    if (data[dataKey]) {
      localStorage.setItem(key, JSON.stringify(data[dataKey]));
    }
  });
};