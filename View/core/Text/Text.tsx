import { SizableText, styled } from "tamagui";
import type { GetProps } from "tamagui";

// SizableText를 그대로 사용하거나, 매우 간단한 alias로 시작.
// 필요에 따라 font family, weight 등을 variant로 추가 가능.
const TextFrame = styled(SizableText, {
  name: "Text",
  color: "$text1", // 기본 텍스트 색상

  variants: {
    // SizableText의 기본 size prop ($1-$16) 외에 의미론적 크기 정의
    type: {
      h1: { size: "$9", fontWeight: "$bold", fontFamily: "$heading" }, // headingFont.size.9 (48pt)
      h2: { size: "$8", fontWeight: "$bold", fontFamily: "$heading" }, // headingFont.size.8 (34pt)
      h3: { size: "$7", fontWeight: "$semibold", fontFamily: "$heading" }, // headingFont.size.7 (28pt)
      h4: { size: "$6", fontWeight: "$semibold", fontFamily: "$heading" }, // headingFont.size.6 (24pt)
      bodyLarge: { size: "$5", fontFamily: "$body", fontWeight: "$medium" }, // bodyFont.size.5 (17pt)
      body: { size: "$4", fontFamily: "$body", fontWeight: "400" }, // bodyFont.size.4 (16pt) - 이미지상으론 15pt에 가까움
      bodySmall: { size: "$3", fontFamily: "$body", fontWeight: "$medium" }, // bodyFont.size.3 (15pt)
      caption: {
        size: "$2",
        color: "$text3",
        fontFamily: "$body",
        fontWeight: "$semibold",
      }, // bodyFont.size.2 (13pt)
      button: { size: "$5", fontWeight: "$medium", fontFamily: "$body" },
    },
    colorVariant: {
      // 테마 색상을 직접 참조하는 variant
      primary: { color: "$text1" },
      secondary: { color: "$text2" },
      tertiary: { color: "$text3" },
      disabled: { color: "$text4" },
      accent: { color: "$accent1" },
      error: { color: "$error" },
      // 필요한 경우 $color 토큰 사용
    },
    align: {
      left: { textAlign: "left" },
      center: { textAlign: "center" },
      right: { textAlign: "right" },
    },
    weight: {
      // SizableText의 fontWeight prop을 그대로 사용하거나, 여기서 재정의
      // 토큰 값 ($thin, $regular, $bold 등)을 직접 사용하는 것이 권장됨
      // 예시:
      // regular: { fontWeight: '$regular' }, // 실제로는 $regular는 숫자 토큰이 아니므로 직접 '400' 등 사용
      // medium: { fontWeight: '$medium' },
      // semibold: { fontWeight: '$semibold' },
      // bold: { fontWeight: '$bold' },
    },
    // SizableText에서 제공하는 다른 props (fontFamily, letterSpacing 등)도 사용 가능
  } as const,
});

export type TextProps = GetProps<typeof TextFrame>;

/**
 * 다양한 스타일과 의미론적 타입을 지원하는 텍스트 컴포넌트입니다.
 * Tamagui의 SizableText를 기반으로 합니다.
 */
export const Text = TextFrame; // styled 컴포넌트를 그대로 export

// Text.displayName = "Text"; // styled 컴포넌트에 name을 설정했으므로 불필요할 수 있음
