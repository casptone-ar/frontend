// service/api/auth.ts
import { API } from "@/service/lib/Http/adapter";
import type { User } from "./types";

// 회원가입 응답: 토큰을 주는 경우 vs 주지 않는 경우
export type SignUpRes =
  | { user: User; accessToken: string; refreshToken: string }
  | { user: User };

export async function signIn(email: string, password: string) {
  return API.post<{ accessToken: string; refreshToken: string; user: User }>(
    "/auth/sign-in",
    { email, password }
  );
}

export async function signUp(
  email: string,
  password: string,
  nickname: string
) {
  return API.post<SignUpRes>("/auth/sign-up", { email, password, nickname });
}

export async function refreshToken(refreshToken: string) {
  return API.post<{ accessToken: string }>("/auth/refresh", { refreshToken });
}

export async function getMe() {
  return API.get<User>("/me");
}

export async function updateMe(payload: Partial<Pick<User, "nickname">>) {
  return API.patch<User>("/me", payload);
}
