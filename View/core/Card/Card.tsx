import React from "react";
import { YStack, styled } from "tamagui";
import type { GetProps, TamaguiElement } from "tamagui";

const CardFrame = styled(YStack, {
  name: "Card",
  backgroundColor: "$accent5", // 카드 배경색
  borderRadius: "$lg", // 기본 borderRadius 토큰 사용
  padding: "$md", // 기본 padding 토큰 사용

  variants: {
    size: {
      // size variant는 패딩, 최소/최대 크기 등에 영향 줄 수 있음
      sm: {
        padding: "$sm",
        borderRadius: "$md",
      },
      md: {
        // 기본값
        padding: "$md",
        borderRadius: "$lg",
      },
      lg: {
        padding: "$lg",
        borderRadius: "$xl",
      },
    },
    variant: {
      elevated: {
        // 기본값으로 그림자 적용 고려 (또는 명시적 prop)
        shadowColor: "$shadow1",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, // 테마에 따라 조정
        shadowRadius: "$radius.2", // 토큰 사용
      },
      outlined: {
        borderWidth: 1,
        borderColor: "$accent5",
      },
      ghost: {
        backgroundColor: "transparent",
      },
    },
  } as const,

  defaultVariants: {
    variant: "elevated", // 기본적으로 그림자 있는 스타일
  },
});

export type CardProps = GetProps<typeof CardFrame>;

/**
 * 정보를 그룹화하여 표시하는 카드 컴포넌트입니다.
 * 다양한 스타일 (elevated, outlined)과 크기를 지원합니다.
 */
export const Card = React.forwardRef<TamaguiElement, CardProps>(
  ({ children, ...rest }, ref) => {
    return (
      <CardFrame ref={ref} {...rest}>
        {children}
      </CardFrame>
    );
  }
);

Card.displayName = "Card";
