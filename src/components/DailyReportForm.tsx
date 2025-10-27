import { useState } from 'react';
import { dbHelpers } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Save, Loader2 } from 'lucide-react';
import { User } from '@/types';

interface DailyReportFormProps {
  user: User;
  selectedDate: string;
  onReportSubmitted: () => void;
}

export default function DailyReportForm({ user, selectedDate, onReportSubmitted }: DailyReportFormProps) {
  const [achievements, setAchievements] = useState('');
  const [completedTasks, setCompletedTasks] = useState('');
  const [ideasSuggestions, setIdeasSuggestions] = useState('');
  const [tomorrowTasks, setTomorrowTasks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await dbHelpers.upsertDailyReport({
        user_id: user.id,
        date: selectedDate,
        achievements,
        completed_tasks: completedTasks,
        ideas_suggestions: ideasSuggestions,
        tomorrow_tasks: tomorrowTasks
      });

      setSuccess(true);
      onReportSubmitted();
      
      // 성공 메시지를 잠시 보여준 후 폼 리셋
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '리포트 저장 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const sections = [
    {
      id: 'achievements',
      label: '오늘의 업무 성과',
      placeholder: '오늘 달성한 주요 성과나 완료한 프로젝트를 작성해주세요...',
      value: achievements,
      setValue: setAchievements,
      required: true,
      minHeight: 'min-h-[80px] sm:min-h-[100px]',
      emoji: '🎯'
    },
    {
      id: 'completed',
      label: '완료한 일',
      placeholder: '오늘 완료한 구체적인 업무나 작업들을 나열해주세요...',
      value: completedTasks,
      setValue: setCompletedTasks,
      required: true,
      minHeight: 'min-h-[80px] sm:min-h-[100px]',
      emoji: '✅'
    },
    {
      id: 'ideas',
      label: '아이디어 및 제안사항',
      placeholder: '업무 개선 아이디어나 팀에 대한 제안사항이 있다면 작성해주세요...',
      value: ideasSuggestions,
      setValue: setIdeasSuggestions,
      required: false,
      minHeight: 'min-h-[60px] sm:min-h-[80px]',
      emoji: '💡'
    },
    {
      id: 'tomorrow',
      label: '내일 할 일',
      placeholder: '내일 계획하고 있는 주요 업무나 목표를 작성해주세요...',
      value: tomorrowTasks,
      setValue: setTomorrowTasks,
      required: true,
      minHeight: 'min-h-[80px] sm:min-h-[100px]',
      emoji: '📋'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <span>📝</span>
              <span className="hidden sm:inline">데일리 리포트 작성</span>
              <span className="sm:hidden">리포트 작성</span>
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              <span className="block sm:inline">{formatDateForDisplay(selectedDate)}</span>
              <span className="hidden sm:inline"> - </span>
              <span className="block sm:inline font-medium">{user.name}님의 업무 리포트</span>
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {selectedDate}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {sections.map((section, index) => (
            <div key={section.id} className="space-y-2">
              <Label 
                htmlFor={section.id} 
                className="text-sm font-medium flex items-center gap-2"
              >
                <span>{section.emoji}</span>
                <span>{section.label}</span>
                {section.required && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Textarea
                id={section.id}
                placeholder={section.placeholder}
                value={section.value}
                onChange={(e) => section.setValue(e.target.value)}
                className={`${section.minHeight} text-sm sm:text-base resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required={section.required}
                rows={3}
              />
              <div className="text-xs text-gray-500 flex justify-between">
                <span>{section.value.length} 글자</span>
                {section.value.length > 0 && (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    작성됨
                  </span>
                )}
              </div>
            </div>
          ))}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800 text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                리포트가 성공적으로 저장되었습니다! 🎉
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 sm:h-12 text-base font-medium gap-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  리포트 저장
                </>
              )}
            </Button>
          </div>

          {/* 모바일 도움말 */}
          <div className="sm:hidden mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>팁:</strong> 각 섹션을 간단명료하게 작성하면 팀원들이 이해하기 쉬워요!
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}