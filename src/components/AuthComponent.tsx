import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Rocket, User, Mail, Lock, UserPlus, LogIn, CheckCircle, AlertCircle } from 'lucide-react';
import { User as UserType } from '@/types';
import { supabaseHelpers, checkSupabaseConnection } from '@/lib/supabase';
import { dbHelpers } from '@/lib/localStorage';

interface AuthComponentProps {
  onLogin: (user: UserType) => void;
}

export default function AuthComponent({ onLogin }: AuthComponentProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    const supabaseConnected = await checkSupabaseConnection();
    setIsSupabaseConnected(supabaseConnected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSupabaseConnected) {
        // Supabase 인증 사용
        if (isLogin) {
          await supabaseHelpers.signIn(email, password);
          const user = await supabaseHelpers.getCurrentUser();
          if (user) {
            onLogin(user);
          }
        } else {
          await supabaseHelpers.signUp(email, password, name);
          const user = await supabaseHelpers.getCurrentUser();
          if (user) {
            onLogin(user);
          }
        }
      } else {
        // 로컬 스토리지 인증 사용
        if (isLogin) {
          const user = await dbHelpers.signIn(email, password);
          onLogin(user);
        } else {
          const user = await dbHelpers.signUp(email, password, name);
          onLogin(user);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '인증 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      if (isSupabaseConnected) {
        // Supabase 데모 계정 로그인
        await supabaseHelpers.signIn('demo@example.com', 'demo123456');
        const user = await supabaseHelpers.getCurrentUser();
        if (user) {
          onLogin(user);
        }
      } else {
        // 로컬 데모 계정 로그인
        const user = await dbHelpers.signIn('demo@example.com', 'demo123456');
        onLogin(user);
      }
    } catch (err: unknown) {
      // 데모 계정이 없으면 생성
      try {
        if (isSupabaseConnected) {
          await supabaseHelpers.signUp('demo@example.com', 'demo123456', '데모 사용자');
          const user = await supabaseHelpers.getCurrentUser();
          if (user) {
            onLogin(user);
          }
        } else {
          const user = await dbHelpers.signUp('demo@example.com', 'demo123456', '데모 사용자');
          onLogin(user);
        }
      } catch (createErr: unknown) {
        const errorMessage = createErr instanceof Error ? createErr.message : '데모 로그인 중 오류가 발생했습니다.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Daily Report Sharing
            </CardTitle>
            <CardDescription className="text-base">
              팀의 일일 업무 공유 플랫폼
            </CardDescription>
          </div>

          {/* 연결 상태 표시 */}
          <div className="flex justify-center">
            {isSupabaseConnected ? (
              <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Supabase 연결됨
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                <AlertCircle className="h-3 w-3 mr-1" />
                로컬 모드 (데모)
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  이름
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="h-12 text-base"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" />
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4" />
                비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base pr-12"
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500">최소 6자 이상 입력해주세요</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>처리 중...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isLogin ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  <span>{isLogin ? '로그인' : '회원가입'}</span>
                </div>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-3 text-sm text-gray-500">또는</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full h-12 text-base border-2 border-dashed border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-blue-600" />
                <span>데모 계정으로 체험하기</span>
              </div>
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </Button>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="text-center space-y-2 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {isSupabaseConnected 
                ? '실제 데이터베이스에 연결되어 있습니다.' 
                : '현재 로컬 모드로 실행 중입니다. 데이터는 브라우저에만 저장됩니다.'
              }
            </p>
            <p className="text-xs text-gray-400">
              11명 팀의 일일 업무 공유를 위한 플랫폼
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}