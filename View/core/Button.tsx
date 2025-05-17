import { type GetProps, Button as TamaguiButton, styled } from "tamagui";

/**
 * 버튼 컴포넌트
 *
 * 기본 Tamagui Button에 추가적인 스타일과 기능을 제공합니다.
 */
export const Button = styled(TamaguiButton, {
  name: "Button",

  // 기본 스타일
  borderRadius: "$4",
  paddingVertical: "$3",
  paddingHorizontal: "$4",

  // 변형 스타일
  variants: {
    size: {
      small: {
        paddingVertical: "$2",
        paddingHorizontal: "$3",
        fontSize: "$3",
      },
      medium: {
        height: "$8",
        paddingHorizontal: "$10",
        fontSize: "$12",
        color: "black",
      },
      large: {
        paddingVertical: "$4",
        paddingHorizontal: "$5",
        fontSize: "$5",
      },
    },
    variant: {
      filled: {
        backgroundColor: "$accent1",
        color: "$text1",
      },
      outlined: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "$accent1",
        color: "$accent1",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "$accent1",
      },
      destructive: {
        backgroundColor: "$error",
        color: "$text1",
      },
    },
    fullWidth: {
      true: {
        alignSelf: "stretch",
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
  },
});

/**
 * 버튼 컴포넌트 타입
 */
export type ButtonProps = GetProps<typeof Button>;
