import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles } from 'lucide-react';

interface AISummaryProps {
  selectedDate: string;
  refreshTrigger: number;
}

export default function AISummary({ selectedDate }: AISummaryProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Brain className="h-5 w-5 text-purple-600" />
          AI 팀 요약
        </CardTitle>
        <CardDescription>
          {formatDate(selectedDate)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center py-8 space-y-3">
          <div className="text-4xl">🤖</div>
          <div className="text-muted-foreground">
            AI 요약 기능이 곧 제공됩니다!
          </div>
          <p className="text-sm text-gray-500">
            팀원들의 리포트를 작성하고 조회하는 기능을 먼저 사용해보세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}