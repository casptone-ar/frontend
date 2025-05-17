/**
 * Tamagui 설정
 */

import { shorthands } from "@tamagui/shorthands";
import { createFont, createTamagui, createTokens } from "tamagui";

import { defaultTheme } from "@/tamagui/defafultTheme";
import { customTokens } from "@/tamagui/tokens";
import { createAnimations } from "@tamagui/animations-moti";
import { Easing } from "react-native-reanimated";

/**
 * 폰트 설정 - Apple System UI 기반
 */
const headingFont = createFont({
  family: "Pretendard",
  size: {
    // 이미지 기반 사이즈 조정 (예시, 실제 값은 더 정밀한 분석 필요)
    1: 12, // Caption2 (매우 작은 텍스트)
    2: 14, // Caption1 (작은 설명, 약관 등)
    3: 16, // Footnote (입력 필드 레이블, 보조 텍스트)
    4: 18, // Subheadline (리스트 아이템 제목 등)
    5: 20, // Body (일반 본문, 버튼 텍스트)
    6: 24, // Title3 (작은 제목, "Hello! Welcome Back")
    7: 28, // Title2
    8: 34, // Title1 ("Sign up" 페이지 제목)
    9: 48, // LargeTitle ("Welcome to Dlex")
    10: 56,
    11: 64,
    12: 72,
    13: 80,
    14: 96,
  },
  weight: {
    thin: "100",
    extralight: "200",
    light: "300",
    regular: "400", // 기본 본문 굵기
    medium: "500", // 강조된 본문, 일부 버튼
    semibold: "600", // 부제목, 버튼 텍스트, 입력 필드 레이블
    bold: "700", // 제목
    extrabold: "800",
    black: "900",
  },
  letterSpacing: {
    1: 0.2,
    2: 0.1,
    3: 0,
    4: -0.2,
    5: -0.4, // 일반 텍스트 자간
    6: -0.5,
    7: -0.6,
    8: -0.8, // 큰 제목 자간
    9: -1.0,
  },
  face: {
    900: { normal: "Pretendard-Black" },
    800: { normal: "Pretendard-ExtraBold" },
    700: { normal: "Pretendard-Bold" },
    600: { normal: "Pretendard-SemiBold" },
    500: { normal: "Pretendard-Medium" },
    400: { normal: "Pretendard-Regular" },
    300: { normal: "Pretendard-Light" },
    200: { normal: "Pretendard-Thin" },
    100: { normal: "Pretendard-ExtraLight" },
  },
});

const bodyFont = createFont({
  family: "Pretendard",
  size: {
    // 이미지 기반 사이즈 조정
    1: 11, // 매우 작은 텍스트 (예: 약관 링크 아래 추가 설명)
    2: 13, // 작은 텍스트 (약관, "Already a member?")
    3: 15, // 일반 본문 ("Premium products for...") / 입력 필드 텍스트
    4: 16, // 약간 큰 본문 / 리스트 아이템 부가정보
    5: 17, // 버튼 텍스트 ("Log In", "Sign Up"), 네비게이션 바 아이템
    6: 20, // 부제목, 강조 텍스트 ("What are your skills?")
    7: 22, // 리스트 아이템 제목 ("Personal data")
    8: 28,
    9: 34,
    10: 40,
    11: 48,
    12: 56,
    13: 64,
    14: 72,
  },
  weight: {
    thin: "100",
    extralight: "200",
    light: "300",
    regular: "400", // 기본 본문
    medium: "500", // 입력 필드 텍스트, 일부 버튼 텍스트
    semibold: "600", // 버튼 텍스트, 리스트 아이템 제목
    bold: "700", // 강조 텍스트
    extrabold: "800",
    black: "900",
  },
  letterSpacing: {
    1: 0.2,
    2: 0.1,
    3: 0, // 일반 본문 자간
    4: -0.1,
    5: -0.2, // 버튼 텍스트 자간
    6: -0.3,
    7: -0.4,
  },
  face: {
    900: { normal: "Pretendard-Black" },
    800: { normal: "Pretendard-ExtraBold" },
    700: { normal: "Pretendard-Bold" },
    600: { normal: "Pretendard-SemiBold" },
    500: { normal: "Pretendard-Medium" },
    400: { normal: "Pretendard-Regular" },
    300: { normal: "Pretendard-Light" },
    200: { normal: "Pretendard-Thin" },
    100: { normal: "Pretendard-ExtraLight" },
  },
});

/**
 * 애니메이션 설정
 */
const animations = createAnimations({
  fast: {
    type: "timing",
    duration: 300,
    easing: Easing.bezier(0.165, 0.72, 0, 1),
  },
  medium: {
    type: "timing",
    duration: 400,
    easing: Easing.bezier(0.165, 0.72, 0, 1),
  },
  slow: {
    type: "timing",
    duration: 700,
    easing: Easing.bezier(0.165, 0.72, 0, 1),
  },
});

// defaultConfig에서 themes와 tokens 추출

/**
 * 테마 설정
 */
const themes = {
  ...defaultTheme,
};

const evaluatedTokens = createTokens(customTokens);

/**
 * Tamagui 설정
 */
const tamaguiConfig = createTamagui({
  animations,
  defaultTheme: "base",
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: false,
  shorthands,
  themes,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens: evaluatedTokens,
  media: {
    xs: { maxWidth: 660 },
    gtXs: { minWidth: 660 + 1 },
    sm: { maxWidth: 860 },
    gtSm: { minWidth: 860 + 1 },
    md: { maxWidth: 980 },
    gtMd: { minWidth: 980 + 1 },
    lg: { maxWidth: 1120 },
    gtLg: { minWidth: 1120 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" },
  },
});

/**
 * 타입 설정
 */
type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;
