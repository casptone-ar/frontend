// config/env.ts
import Constants from "expo-constants";

// expo-constants의 extra에 app.config.ts에서 흘려보낸 값이 들어옵니다.
const raw = Constants.expoConfig?.extra ?? process.env;

function toBool(value: any, def = false) {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return def;
}

export const ENV = {
  APP_NAME: raw?.EXPO_PUBLIC_IN_APP_NAME ?? "neopets",
  API_BASE_URL: raw?.EXPO_PUBLIC_API_BASE_URL ?? "",
  USE_AUTH: (raw?.EXPO_PUBLIC_USE_AUTH as "none" | "basic" | "oauth") ?? "none",

  // 회원가입 응답이 토큰을 주는지 여부 (백엔드 정책에 따라)
  SIGNUP_RETURNS_TOKEN: raw?.EXPO_PUBLIC_SIGNUP_RETURNS_TOKEN === "true",

  // 기타 값들도 필요하면 추가
  USE_I18N: toBool(raw?.EXPO_PUBLIC_USE_I18N, false),
  USE_ADS: toBool(raw?.EXPO_PUBLIC_USE_ADS, false),
  PRIVACY_POLICY_URL: raw?.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? "",
  SERVICE_POLICY_URL: raw?.EXPO_PUBLIC_SERVICE_POLICY_URL ?? "",
};
