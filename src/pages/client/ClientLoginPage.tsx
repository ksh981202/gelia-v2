import React, { useEffect, useState } from 'react';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/shared/api/supabaseClient';
import { mergeGuestRecentViewedToUser } from '@/shared/lib/recentViewedStorage';

function getAuthErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown Error';
}

function resolvePostLoginPath(redirectParam: string | null): string {
  if (!redirectParam) return '/my'
  if (!redirectParam.startsWith('/') || redirectParam.startsWith('//')) return '/my'
  return redirectParam
}

// 643-security: Google OAuth 차단 후 미사용 — 복구 시 주석 해제
// function buildOAuthRedirectUrl(postLoginPath: string): string {
//   return `${window.location.origin}${postLoginPath}`
// }

export default function ClientLoginPage() {
  const { language } = useLanguageContext();
  const isEnglish = language === 'en';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postLoginPath = resolvePostLoginPath(searchParams.get('redirect'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 612: 일반 유저 회원가입 모드 원천 차단 — 복구 시 useState(false) + 토글 UI 주석 해제
  // const [isSignUp, setIsSignUp] = useState(false);
  const isSignUp = false;
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. 이미 로그인된 유저는 redirect 경로(또는 마이페이지)로 이동
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(postLoginPath, { replace: true });
      }
    };
    void checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        navigate(postLoginPath, { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, postLoginPath]);

  // 2. 이메일 로그인 / 회원가입
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
        if (!email.trim()) {
      setErrorMsg(isEnglish ? 'Please enter your email.' : '이메일을 입력해 주세요.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg(isEnglish ? 'Please enter your password.' : '비밀번호를 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(isEnglish ? 'Password must be at least 6 characters.' : '비밀번호는 6자리 이상 입력해 주세요.');
      return;
    }
    if (!supabase) return;
    
    setLoading(true);
    setErrorMsg('');

    try {
      // 612: 회원가입 API 경로 차단 — 로그인만 허용
      // if (isSignUp) {
      //   const { data, error } = await supabase.auth.signUp({ email, password });
      //   if (error) throw error;
      //   const signedUpUserId = data.user?.id ?? data.session?.user?.id ?? "";
      //   if (signedUpUserId) mergeGuestRecentViewedToUser(signedUpUserId);
      //   navigate(postLoginPath, { replace: true });
      // } else {
      {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const signedInUserId = data.user?.id ?? data.session?.user?.id ?? "";
        if (signedInUserId) mergeGuestRecentViewedToUser(signedInUserId);
        navigate(postLoginPath, { replace: true });
      }
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMsg(message === 'Invalid login credentials' 
        ? (isEnglish ? 'Email or password does not match.' : '이메일 또는 비밀번호가 일치하지 않습니다.')
        : message || (isEnglish ? 'An error occurred during authentication.' : '인증 과정에서 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  // 2-1. 비밀번호 재설정 이메일 발송
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
        setLoading(true);
    setErrorMsg('');

    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) throw new Error(isEnglish ? 'Please enter your email.' : '이메일을 입력해주세요.');
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      alert(isEnglish ? 'A password reset link has been sent. Please check your email!' : '비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일함을 확인해주세요!');
      setIsResetMode(false);
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMsg(message || (isEnglish ? 'An error occurred while sending the email.' : '이메일 전송 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  // 643-security: Google OAuth 신규 가입 원천 차단 — Workspace는 이메일/비밀번호(관리자)만 허용
  // const handleGoogleLogin = async () => {
  //   setLoading(true);
  //   setErrorMsg('');
  //   try {
  //     const { error } = await supabase.auth.signInWithOAuth({
  //       provider: 'google',
  //       options: {
  //         redirectTo: buildOAuthRedirectUrl(postLoginPath),
  //         queryParams: {
  //           prompt: 'select_account',
  //         },
  //       },
  //     });
  //     if (error) throw error;
  //   } catch {
  //     setErrorMsg(isEnglish ? 'An error occurred during Google login.' : '구글 로그인 중 오류가 발생했습니다.');
  //     setLoading(false);
  //   }
  // };

  const isProRedirect = postLoginPath === '/pro';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 font-sans tracking-tight">
      <div className="absolute left-4 top-4 w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 text-gray-600 transition-colors hover:text-gray-900"
          aria-label={isEnglish ? 'Go back' : '뒤로가기'}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* 상단 듀얼 레이어 원형 이미지 (크기 확대) */}
        <div className="mb-12 flex justify-center">
          <div className="relative">
            {/* 뒤쪽 장식용 베이지색 도형 (우측 상단으로 살짝 어긋나게 배치) */}
            <div className="absolute -top-4 -right-4 h-40 w-40 rounded-full bg-[#F5EBE4] z-0 sm:h-48 sm:w-48" />

            {/* 앞쪽 메인 네일 이미지 */}
            <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg z-10 sm:h-48 sm:w-48">
              <img
                src="/quiz/intro-main.jpg"
                alt={isEnglish ? 'Main nail thumbnail' : '네일북 메인 썸네일'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/200?text=Nailbook";
                }}
              />
            </div>
          </div>
        </div>

        <div className="mb-8 text-center">
          <h2 className="mb-2 text-[24px] font-bold text-gray-900">
            {isProRedirect
              ? 'GELIA PRO 시작하기'
              : isResetMode
              ? (isEnglish ? 'Find Password' : '비밀번호 찾기')
              : 'GELIA Workspace'}
          </h2>
          <p className="text-[14px] text-gray-500">
            {isProRedirect
              ? '로그인 후 샵 정보를 입력하면 PRO 대시보드로 이동합니다.'
              : isResetMode
              ? (isEnglish ? 'We will send a reset link to your registered email.' : '가입한 이메일로 재설정 링크를 보내드릴게요.')
              : 'Authorized staff & partners only'}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-8 shadow-sm sm:px-8">
            <div className="min-h-[72px] w-full">
              {errorMsg && (
                <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-center text-[13px] font-medium text-red-600">
                  {errorMsg}
                </div>
              )}
            </div>

            <form className="space-y-5" onSubmit={isResetMode ? handleResetPassword : handleEmailAuth}>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">{isEnglish ? 'Email' : '이메일'}</label>
                    <input
                      type="email"
                      defaultValue={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-[#FF6B00] focus:bg-white focus:ring-1 focus:ring-[#FF6B00] disabled:bg-gray-50"
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                  </div>

                  {!isResetMode && (
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">{isEnglish ? 'Password' : '비밀번호'}</label>
                      <input
                        type="password"
                        defaultValue={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-[#FF6B00] focus:bg-white focus:ring-1 focus:ring-[#FF6B00] disabled:bg-gray-50"
                        placeholder={isEnglish ? 'Enter at least 6 characters' : '6자리 이상 입력해주세요'}
                        disabled={loading}
                      />
                      {!isSignUp && !isResetMode && (
                        <div className="mt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setIsResetMode(true);
                              setErrorMsg('');
                            }}
                            className="text-[13px] font-semibold text-gray-600 hover:text-[#FF6B00] transition-colors"
                          >
                            {isEnglish ? 'Forgot Password?' : '비밀번호를 잊으셨나요?'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#FF6B00] px-4 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#E66000] disabled:bg-gray-300 shadow-md"
                  >
                    {loading
                      ? (isEnglish ? 'Processing...' : '처리 중...')
                      : isResetMode
                        ? (isEnglish ? 'Send Reset Link' : '재설정 이메일 받기')
                        : (isEnglish ? 'Log in with Email' : '이메일로 로그인')}
                  </button>

                  {isResetMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(false);
                        setErrorMsg('');
                      }}
                      className="w-full text-[13px] font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-900"
                    >
                      {isEnglish ? 'Back' : '뒤로 가기'}
                    </button>
                  )}
            </form>

            {!isResetMode && (
              <>
                {/* 643-security: Google OAuth UI 원천 차단 — 관리자 이메일 로그인만 허용
                <div className="relative my-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <div className="relative flex justify-center text-[13px]">
                    <span className="bg-white px-4 font-medium text-gray-400">{isEnglish ? 'OR' : '또는'}</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[14px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  ...
                  {isEnglish ? 'Continue with Google' : 'Google로 계속하기'}
                </button>
                */}

                {/* 612: 일반 유저 회원가입 토글 원천 차단 — 복구 시 주석 해제
                <div className="mt-8 text-center text-[13px] text-gray-500">
                  {isSignUp
                    ? (isEnglish ? 'Already have an account? ' : '이미 계정이 있으신가요? ')
                    : (isEnglish ? "Don't have an account? " : '아직 계정이 없으신가요? ')}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setErrorMsg('');
                    }}
                    className="ml-1.5 font-bold text-[#FF6B00] hover:text-[#E66000] transition-colors"
                  >
                    {isSignUp ? (isEnglish ? 'Log In' : '로그인하기') : (isEnglish ? 'Sign Up' : '회원가입하기')}
                  </button>
                </div>
                */}
              </>
            )}
        </div>
      </div>
    </div>
  );
}
