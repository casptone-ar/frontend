import { useAuthStore } from "@/service/lib/Auth/store";
import { getAuth, signInAnonymously } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import { signIn } from "@/service/api/auth";

/**
 * 인증 관리 훅
 */
export const useAutoSignIn = () => {
  const AuthStore = useAuthStore();

  useEffect(() => {
    const signIn = async () => {
      console.log("signIn");
      const auth = getAuth();
      const signInResult = await signInAnonymously(auth);

      if (!signInResult.user) {
        console.log("signInResult.user is null");
        return;
      }

      AuthStore.setUser(signInResult.user);
      AuthStore.setIsAuthenticated(true);
    };

    if (process.env.EXPO_PUBLIC_USE_AUTH) {
      signIn();
    }
  }, []);
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

      const res = await signIn({ email, password });

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
