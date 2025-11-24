// application/auth/useAuth.ts

import { useAuthStore } from "@/service/lib/Auth/store";
import { useEffect, useState } from "react";
import { signIn } from "@/service/api/auth";

/**
 * 인증 관리 훅
 * (현재는 자동 로그인 비활성화 상태)
 */
export const useAutoSignIn = () => {
  // Firebase 익명 로그인은 Expo Go에서 사용할 수 없으므로 비워둡니다.
  // 나중에 Dev Client + Firebase 설정 후 다시 구현하면 됩니다.
};

/**
 * 이메일/비밀번호 로그인 훅
 */
export const useAuth = () => {
  const { setUser, setToken, setIsAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // ✅ 백엔드 API 기반 로그인
      const res = await signIn(email, password);

      if (res?.accessToken) {
        setToken(res.accessToken);
        setIsAuthenticated(true);
        return true;
      } else {
        setError("로그인 실패: 토큰이 없습니다.");
        return false;
      }
    } catch (err: any) {
      setError(err?.message ?? "로그인 실패");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
