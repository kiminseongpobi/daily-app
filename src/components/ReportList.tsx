import { useState, useEffect } from 'react';
import { dbHelpers } from '@/lib/localStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Users, Clock, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { DailyReport } from '@/types';

interface ReportListProps {
  selectedDate: string;
  refreshTrigger: number;
}

export default function ReportList({ selectedDate, refreshTrigger }: ReportListProps) {
  const [reports, setReports] = useState<(DailyReport & { profiles: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      
      try {
        const data = await dbHelpers.getDailyReports(selectedDate);
        setReports(data);
        // 첫 번째 리포트만 기본 확장
        if (data.length > 0) {
          setExpandedReports(new Set([data[0].id]));
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '리포트를 불러오는 중 오류가 발생했습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [selectedDate, refreshTrigger]);

  const toggleReport = (reportId: string) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const expandAll = () => {
    setExpandedReports(new Set(reports.map(r => r.id)));
  };

  const collapseAll = () => {
    setExpandedReports(new Set());
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'achievements': return '🎯';
      case 'completed': return '✅';
      case 'ideas': return '💡';
      case 'tomorrow': return '📋';
      default: return '📄';
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'achievements': return '업무 성과';
      case 'completed': return '완료한 일';
      case 'ideas': return '아이디어 및 제안';
      case 'tomorrow': return '내일 할 일';
      default: return section;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>리포트를 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Users className="h-5 w-5" />
            팀 리포트
          </CardTitle>
          <CardDescription>{formatDateForDisplay(selectedDate)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">📝</div>
            <div className="text-muted-foreground">
              이 날짜에 작성된 리포트가 없습니다.
            </div>
            <p className="text-sm text-gray-500">
              첫 번째 리포트를 작성해보세요!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5" />
                팀 리포트
                <Badge variant="secondary" className="text-xs">
                  {reports.length}개
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {formatDateForDisplay(selectedDate)}
              </CardDescription>
            </div>
            
            {/* 전체 펼치기/접기 버튼 */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
                className="text-xs px-3 py-1 h-8"
              >
                <Eye className="h-3 w-3 mr-1" />
                전체 보기
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
                className="text-xs px-3 py-1 h-8"
              >
                <ChevronUp className="h-3 w-3 mr-1" />
                접기
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {reports.map((report, index) => {
            const isExpanded = expandedReports.has(report.id);
            
            return (
              <div key={report.id}>
                {/* 리포트 헤더 */}
                <div 
                  className="flex items-center justify-between w-full py-3 px-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => toggleReport(report.id)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-700">
                        {report.profiles.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg truncate">
                        {report.profiles.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(report.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={isExpanded ? "default" : "outline"} className="text-xs">
                      {isExpanded ? '열림' : '접힘'}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
                
                {/* 리포트 내용 */}
                {isExpanded && (
                  <div className="mt-4 pl-4 sm:pl-6 space-y-4">
                    {[
                      { key: 'achievements', value: report.achievements },
                      { key: 'completed', value: report.completed_tasks },
                      { key: 'ideas', value: report.ideas_suggestions },
                      { key: 'tomorrow', value: report.tomorrow_tasks }
                    ].map((item) => (
                      item.value && (
                        <div key={item.key} className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                            <span>{getSectionIcon(item.key)}</span>
                            <span>{getSectionTitle(item.key)}</span>
                          </h4>
                          <div className="text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border-l-3 border-blue-200">
                            {item.value}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
                
                {index < reports.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}