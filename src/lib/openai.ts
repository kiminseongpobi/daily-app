// OpenAI API 클라이언트 설정
export class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. AI features will be disabled.');
    }
  }

  async generateSummary(reports: Array<{
    profiles: { name: string };
    achievements?: string;
    completed_tasks?: string;
    ideas_suggestions?: string;
    tomorrow_tasks?: string;
    created_at: string;
  }>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
    }

    if (reports.length === 0) {
      return '분석할 리포트가 없습니다.';
    }

    try {
      // 리포트 데이터를 AI가 분석하기 좋은 형태로 변환
      const reportsText = reports.map(report => {
        const sections = [];
        if (report.achievements) sections.push(`업무 성과: ${report.achievements}`);
        if (report.completed_tasks) sections.push(`완료한 일: ${report.completed_tasks}`);
        if (report.ideas_suggestions) sections.push(`아이디어 및 제안: ${report.ideas_suggestions}`);
        if (report.tomorrow_tasks) sections.push(`내일 할 일: ${report.tomorrow_tasks}`);
        
        return `[${report.profiles.name}]\n${sections.join('\n')}\n`;
      }).join('\n---\n\n');

      const prompt = `다음은 팀원들의 일일 업무 리포트입니다. 이를 분석하여 한국어로 종합적인 요약을 작성해주세요.

${reportsText}

다음 형식으로 요약해주세요:

## 📊 팀 성과 요약
- 주요 달성 사항들을 요약

## ✅ 완료된 주요 업무
- 팀 전체가 완료한 중요한 업무들

## 💡 제안 및 아이디어
- 팀원들이 제시한 개선 아이디어나 제안사항

## 📋 내일의 주요 계획
- 팀 전체의 내일 업무 계획

## 🎯 인사이트 및 권장사항
- 팀 성과에 대한 분석과 개선 방향 제시

각 섹션은 간결하고 명확하게 작성하되, 구체적인 내용을 포함해주세요. 팀원들의 이름은 적절히 언급하여 개인의 기여도를 인정해주세요.`;

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '당신은 팀 업무 분석 전문가입니다. 팀원들의 일일 리포트를 분석하여 유용하고 통찰력 있는 요약을 제공합니다.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API 오류: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('OpenAI API에서 유효하지 않은 응답을 받았습니다.');
      }

      return data.choices[0].message.content.trim();

    } catch (error) {
      console.error('AI 요약 생성 오류:', error);
      
      if (error instanceof Error) {
        // API 키 관련 오류 처리
        if (error.message.includes('401') || error.message.includes('API key')) {
          throw new Error('OpenAI API 키가 유효하지 않습니다. 설정을 확인해주세요.');
        }
        
        // 할당량 초과 오류 처리
        if (error.message.includes('429') || error.message.includes('quota')) {
          throw new Error('OpenAI API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.');
        }
        
        // 네트워크 오류 처리
        if (error.message.includes('fetch')) {
          throw new Error('네트워크 연결을 확인해주세요.');
        }
        
        throw error;
      }
      
      throw new Error('AI 요약 생성 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  // API 키 유효성 검사
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // 사용 가능한 모델 목록 조회
  async getAvailableModels(): Promise<string[]> {
    if (!this.apiKey) return [];

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.data?.map((model: { id: string }) => model.id) || [];
    } catch {
      return [];
    }
  }
}

export const openaiService = new OpenAIService();