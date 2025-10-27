import { createClient } from '@supabase/supabase-js';
import { User, DailyReport, AISummary } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// 데이터베이스 스키마 초기화
export const initializeDatabase = async () => {
  try {
    // 사용자 프로필 테이블 생성
    const { error: profilesError } = await supabase.rpc('create_profiles_table');
    if (profilesError && !profilesError.message.includes('already exists')) {
      console.error('프로필 테이블 생성 오류:', profilesError);
    }

    // 데일리 리포트 테이블 생성
    const { error: reportsError } = await supabase.rpc('create_daily_reports_table');
    if (reportsError && !reportsError.message.includes('already exists')) {
      console.error('리포트 테이블 생성 오류:', reportsError);
    }

    // AI 요약 테이블 생성
    const { error: summariesError } = await supabase.rpc('create_ai_summaries_table');
    if (summariesError && !summariesError.message.includes('already exists')) {
      console.error('AI 요약 테이블 생성 오류:', summariesError);
    }

    console.log('데이터베이스 초기화 완료');
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
  }
};

// 실제 Supabase 데이터베이스 헬퍼 함수들
export const supabaseHelpers = {
  // 사용자 관련 함수들
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) throw error;

    // 프로필 생성
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name: name,
            email: email,
            role: 'member',
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error('프로필 생성 오류:', profileError);
      }
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('프로필 조회 오류:', error);
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      name: profile?.name || '',
      role: profile?.role || 'member'
    } as User;
  },

  // 데일리 리포트 관련 함수들
  async createDailyReport(report: Omit<DailyReport, 'id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { data, error } = await supabase
      .from('daily_reports')
      .insert([
        {
          ...report,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
      ])
      .select('*, profiles(name)')
      .single();

    if (error) throw error;
    return data;
  },

  async getDailyReports(date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('daily_reports')
      .select('*, profiles(name)')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateDailyReport(id: string, updates: Partial<DailyReport>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { data, error } = await supabase
      .from('daily_reports')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, profiles(name)')
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDailyReport(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { error } = await supabase
      .from('daily_reports')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // AI 요약 관련 함수들
  async createAISummary(summary: Omit<AISummary, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('ai_summaries')
      .insert([
        {
          ...summary,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAISummary(date: string) {
    const { data, error } = await supabase
      .from('ai_summaries')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // 실시간 구독 함수들
  subscribeToReports(callback: (payload: { 
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new?: DailyReport;
    old?: DailyReport;
  }) => void) {
    return supabase
      .channel('daily_reports')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'daily_reports' 
        }, 
        callback
      )
      .subscribe();
  },

  subscribeToSummaries(callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new?: AISummary;
    old?: AISummary;
  }) => void) {
    return supabase
      .channel('ai_summaries')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'ai_summaries' 
        }, 
        callback
      )
      .subscribe();
  },

  // 팀 관리 함수들
  async getTeamMembers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, created_at')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async updateUserRole(userId: string, role: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    // 현재 사용자가 관리자인지 확인
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (currentProfile?.role !== 'admin') {
      throw new Error('권한이 없습니다.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Supabase 연결 상태 확인
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
};