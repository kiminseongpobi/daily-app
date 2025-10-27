export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface DailyReport {
  id: string;
  user_id: string;
  user_name: string;
  date: string;
  achievements: string;
  completed_tasks: string;
  ideas_suggestions: string;
  tomorrow_tasks: string;
  created_at: string;
  updated_at: string;
}

export interface AISummary {
  id: string;
  date: string;
  summary_achievements: string;
  summary_completed: string;
  summary_ideas: string;
  summary_tomorrow: string;
  created_at: string;
}

export interface ConsolidatedReport {
  date: string;
  achievements: string[];
  completed_tasks: string[];
  ideas_suggestions: string[];
  tomorrow_tasks: string[];
  reports: DailyReport[];
}