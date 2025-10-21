import { useEffect } from "react";
import SocialBtn from "../components/common/buttons/SocialBtn";
import { supabase } from "../utils/supabase";
import { useAuthStore } from "../stores/authStore";

export default function LoginPage() {
  const user = useAuthStore((state) => state.user);

  // 구글 로그인
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${import.meta.env.VITE_URL}/`,
        },
      });
      if (error) throw error;
    } catch (e) {
      console.log(e);
    }
  };

  // 깃허브 로그인
  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${import.meta.env.VITE_URL}/`,
        },
      });
      if (error) throw error;
    } catch (e) {
      console.log(e);
    }
  };

  // 카카오 로그인
  const handleKakaoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${import.meta.env.VITE_URL}/`,
        },
      });
      if (error) throw error;
    } catch (e) {
      console.log(e);
    }
  };

  // user 상태 디버깅
  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <div className="w-full h-full flex ml-[340px] mt-[50px]">
      <div className="login-container w-[470px] h-[500px]">
        {/* 페이지 타이틀 */}
        <h1 className="text-4xl font-bold mb-11 text-center text-[var(--color-text-main)]">
          로그인
        </h1>

        {/* 소셜 로그인 버튼 */}
        <SocialBtn socialType="google" onClick={handleGoogleLogin} />
        <SocialBtn socialType="kakao" onClick={handleKakaoLogin} />
        <SocialBtn socialType="github" onClick={handleGithubLogin} />
      </div>
    </div>
  );
}

/*
주석 설명:

1. useAuthStore
   - Zustand 전역 상태에서 현재 로그인된 user 가져오기

2. supabase.auth.signInWithOAuth
   - 구글, 깃허브, 카카오 소셜 로그인 구현
   - redirectTo 옵션으로 로그인 후 리다이렉트 경로 지정

3. useEffect
   - user 상태 변경 시 콘솔 로그 확인용
   - 실제 UI 동작에는 영향 없음

4. JSX 구조
   - 최상위 div: 화면 중앙 정렬 flex, mt-[-50px]로 상단 여백 조정
   - login-container: 고정 너비/높이 박스
   - h1: 로그인 페이지 타이틀
   - SocialBtn: 각 소셜 로그인 버튼 컴포넌트, 클릭 시 해당 로그인 함수 실행

5. 스타일
   - TailwindCSS 기반
   - CSS 변수(`--color-text-main`)로 텍스트 색상 적용
   - 버튼은 SocialBtn 재사용 컴포넌트로 관리
*/
