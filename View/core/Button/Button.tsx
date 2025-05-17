import React from "react";
import { Spinner, Button as TamaguiButton, styled } from "tamagui";
import type { GetProps, TamaguiElement } from "tamagui";
import { Text } from "../Text/Text"; // 코어 Text 컴포넌트 사용

// Tamagui Button을 기반으로 스타일 및 variant 확장
const ButtonFrame = styled(TamaguiButton, {
  name: "Button",
  // 기본 스타일: Tamagui Button의 기본값을 따르거나 여기서 재정의
  // borderRadius: '$md', // 이미지에 맞춰 조정, 토큰 사용
  // height: '$size.5', // 예시, $4 or $5 (36px or 44px)

  variants: {
    variant: {
      primary: {
        backgroundColor: "$accent1",
        color: "$color1", // 밝은 텍스트색
        pressStyle: { backgroundColor: "$accent2" },
        // hoverStyle: { backgroundColor: '$accent2' },
        // focusStyle: { outlineColor: '$accent3', outlineWidth: 2 },
      },
      secondary: {
        backgroundColor: "$accent3", // 연한 배경
        color: "$color1",
        pressStyle: { backgroundColor: "$accent2" }, // 더 연한 배경 또는 테두리 강조
        borderColor: "$border1",
        borderWidth: 1,
      },
      outline: {
        backgroundColor: "transparent",
        color: "$accent1",
        borderColor: "$accent1",
        borderWidth: 1,
        pressStyle: { backgroundColor: "$accent1", color: "$color1" }, // 반전 효과
      },
      ghost: {
        // Tamagui Button의 chromeless와 유사
        backgroundColor: "transparent",
        color: "$accent1",
        pressStyle: { backgroundColor: "rgba(0,0,0,0.05)" }, // 매우 은은한 효과
      },
      link: {
        backgroundColor: "transparent",
        color: "$accent1",
        paddingHorizontal: "$1", // 링크 스타일은 패딩 최소화
        pressStyle: { textDecorationLine: "underline" },
        height: "auto",
      },
    },
    size: {
      // Tamagui Button의 size prop ($true, $2, $4 등)을 활용하거나 여기서 재정의
      // 버튼 높이, 텍스트 크기, 패딩 등을 조절
      sm: {
        height: "$size.4", // 36px
        paddingHorizontal: "$sm",
        // iconSize: 16, // 아이콘 사용 시
      },
      md: {
        height: "$size.5", // 44px
        paddingHorizontal: "$md",
        // iconSize: 20,
      },
      lg: {
        height: "$size.6", // 52px
        paddingHorizontal: "$lg",
        // iconSize: 24,
      },
    },
    fullWidth: {
      true: {
        width: "100%",
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        // pointerEvents: 'none', // Tamagui Button에서 이미 처리할 수 있음
      },
    },
    // iconButton (원형 버튼 등) variant도 추가 가능
    circular: {
      true: {
        borderRadius: "$circular",
        // width, height를 동일하게 설정하거나, size variant와 연동
        // padding: 0, // 내부 아이콘만 표시되도록
      },
    },
  } as const,

  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export type ButtonProps = GetProps<typeof ButtonFrame> & {
  loading?: boolean;
  // Tamagui Button은 기본적으로 icon, iconAfter를 지원
  // children prop으로 텍스트 전달
};

/**
 * 다양한 스타일, 크기, 상태를 지원하는 버튼 컴포넌트입니다.
 * Tamagui의 Button을 기반으로 합니다.
 */
export const Button = React.forwardRef<TamaguiElement, ButtonProps>(
  ({ children, loading, disabled, icon, ...rest }, ref) => {
    const actualDisabled = loading || disabled;

    const textColorVariant =
      rest.variant === "primary" ||
      rest.variant === "secondary" ||
      (rest.variant === "outline" && rest.pressStyle?.backgroundColor)
        ? "$color1" // 임시로 직접 값 사용, 실제론 테마 토큰 참조
        : "$text1"; // 기본

    const iconToShow = loading ? <Spinner color={textColorVariant} /> : icon;

    // 버튼 텍스트에 코어 Text 컴포넌트 적용 고려
    // Tamagui Button은 children으로 문자열을 받으면 내부적으로 Text로 렌더링
    // 명시적으로 코어 Text를 사용하려면 children을 가공해야 함
    let buttonContent = children;
    if (typeof children === "string") {
      // 버튼 variant에 따라 적절한 Text type/colorVariant 적용
      // 예시: variant가 'primary'면 밝은 색 텍스트

      buttonContent = (
        <Text
          type="button"
          // @ts-ignore
          color={textColorVariant} // type prop에 color가 있으면 우선될 수 있으므로, 직접 color prop 사용
          // size는 Button의 size variant에 따라 동적으로 설정 필요
          // 예: size="md" -> fontSize="$5"
          fontSize={
            rest.size === "sm" ? "$4" : rest.size === "lg" ? "$6" : "$5"
          }
        >
          {children}
        </Text>
      );
    }

    return (
      <ButtonFrame
        ref={ref}
        disabled={actualDisabled}
        icon={iconToShow}
        {...rest}
      >
        {buttonContent}
      </ButtonFrame>
    );
  }
);

Button.displayName = "Button";
