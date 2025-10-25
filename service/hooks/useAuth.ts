import { useAsyncFn, useFetch } from "./utils";
import { signIn, signUp, getMe } from "@/service/api/auth";
import type { User } from "@/service/api/types";

/** 내 정보 조회 */
export function useMe(auto = true) {
  return useFetch<User>(getMe, auto);
}

/** 로그인 (호출 시 실행되는 mutate 패턴) */
export function useSignIn() {
  const { data, error, loading, run } = useAsyncFn(
    (email: string, password: string) => signIn(email, password)
  );
  return {
    data, // { accessToken, refreshToken, user }
    error,
    loading,
    signIn: run,
  } as const;
}

/** 회원가입 */
export function useSignUp() {
  const { data, error, loading, run } = useAsyncFn(
    (email: string, password: string, nickname: string) =>
      signUp(email, password, nickname)
  );
  return {
    data, // User
    error,
    loading,
    signUp: run,
  } as const;
}
