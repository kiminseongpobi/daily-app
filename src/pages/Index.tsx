import { useState, useEffect } from 'react';
import { authHelpers } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, LogOut, Users, FileText, Sparkles, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AuthComponent from '@/components/AuthComponent';
import DailyReportForm from '@/components/DailyReportForm';
import ReportList from '@/components/ReportList';
import AISummary from '@/components/AISummary';
import { User } from '@/types';

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [activeTab, setActiveTab] = useState<'form' | 'reports' | 'summary'>('form');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const currentUser = authHelpers.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogin = (authUser: User) => {
    setUser(authUser);
  };

  const handleLogout = () => {
    authHelpers.signOut();
    setUser(null);
  };

  const handleReportSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('reports');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const changeDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const tabs = [
    { id: 'form', label: '작성', icon: FileText, shortLabel: '작성' },
    { id: 'reports', label: '팀 리포트', icon: Users, shortLabel: '팀' },
    { id: 'summary', label: 'AI 요약', icon: Sparkles, shortLabel: 'AI' }
  ];

  if (!user) {
    return <AuthComponent onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 모바일 헤더 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* 로고 및 타이틀 */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                <span className="hidden sm:inline">팀 데일리 리포트</span>
                <span className="sm:hidden">데일리 리포트</span>
              </h1>
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">데모</Badge>
            </div>
            
            {/* 데스크톱 사용자 정보 */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-600 truncate max-w-32">
                {user.name}님
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 flex-shrink-0">
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">로그아웃</span>
              </Button>
            </div>

            {/* 모바일 메뉴 */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <h2 className="font-semibold">메뉴</h2>
                    </div>
                    <div className="flex-1 py-4">
                      <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                          안녕하세요, {user.name}님!
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={handleLogout} 
                          className="w-full gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          로그아웃
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        {/* 모바일 최적화 날짜 선택 */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">날짜 선택</span>
              <span className="sm:hidden">날짜</span>
            </CardTitle>
            <CardDescription className="hidden sm:block">
              리포트를 작성하거나 조회할 날짜를 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 모바일 날짜 네비게이션 */}
            <div className="flex items-center justify-between gap-3 sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate('prev')}
                className="p-2 flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <div className="font-medium text-base">{formatDateShort(selectedDate)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(selectedDate).toLocaleDateString('ko-KR', { weekday: 'short' })}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate('next')}
                className="p-2 flex-shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* 데스크톱 날짜 선택 */}
            <div className="hidden sm:flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <div className="text-sm text-gray-600">
                {formatDate(selectedDate)}
              </div>
            </div>

            {/* 모바일 숨겨진 날짜 입력 */}
            <div className="sm:hidden mt-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* 모바일 최적화 탭 네비게이션 */}
        <div className="mb-4 sm:mb-6">
          {/* 모바일 탭 (하단 고정) */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="font-medium">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 데스크톱 탭 */}
          <div className="hidden sm:flex gap-2 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="gap-2 flex-shrink-0"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* 컨텐츠 - 모바일에서 하단 탭을 위한 여백 추가 */}
        <div className="pb-20 sm:pb-0">
          {activeTab === 'form' && (
            <DailyReportForm
              user={user}
              selectedDate={selectedDate}
              onReportSubmitted={handleReportSubmitted}
            />
          )}
          
          {activeTab === 'reports' && (
            <ReportList
              selectedDate={selectedDate}
              refreshTrigger={refreshTrigger}
            />
          )}
          
          {activeTab === 'summary' && (
            <AISummary
              selectedDate={selectedDate}
              refreshTrigger={refreshTrigger}
            />
          )}
        </div>
      </div>
    </div>
  );
}