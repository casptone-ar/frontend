import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";

const ScreenContainerFrame = styled(YStack, {
  name: "ScreenContainerFrame",
  flex: 1,
  backgroundColor: "$background1", // 기본 배경색 토큰 사용
  variants: {
    padded: {
      true: {
        padding: "$md", // 기본 패딩 토큰 사용
      },
      horizontal: {
        paddingHorizontal: "$md",
      },
      vertical: {
        paddingVertical: "$md",
      },
    },
  } as const,
});

const ScreenScrollViewFrame = styled(ScrollView, {
  name: "ScreenScrollViewFrame",
  flex: 1,
  backgroundColor: "$background1",
  variants: {
    padded: {
      true: {
        padding: "$md",
      },
      horizontal: {
        paddingHorizontal: "$md",
      },
      vertical: {
        paddingVertical: "$md",
      },
    },
  } as const,
  // ScrollView의 contentContainerStyle을 위한 설정
  // Tamagui 문서의 'accept' API 참고 (https://tamagui.dev/docs/core/styled#custom-props-that-accepts-tokens-with-acceptaccept)
  // 하지만 이 경우 props로 직접 contentContainerStyle을 받는 것이 더 명확할 수 있음
});

/**
 * 화면의 최상단 컨테이너 역할을 하는 컴포넌트입니다.
 * 기본적으로 YStack을 사용하며, scrollable prop을 통해 ScrollView로 전환할 수 있습니다.
 * SafeArea를 고려한 패딩을 적용할 수 있습니다.
 */

type ScreenContainerProps<T extends boolean> = T extends false
  ?
      | GetProps<typeof ScreenContainerFrame> & {
          /**
           * Set to true to use ScrollView as the container.
           * @default false
           */
          scrollable: T;
          /**
           * Apply safe area padding to top.
           * @default true
           */
          safeAreaTop?: boolean;
          /**
           * Apply safe area padding to bottom.
           * @default true
           */
          safeAreaBottom?: boolean;
          /**
           * Apply safe area padding to left.
           * @default true
           */
          safeAreaLeft?: boolean;
          /**
           * Apply safe area padding to right.
           * @default true
           */
          safeAreaRight?: boolean;
        }
  : GetProps<typeof ScreenScrollViewFrame> & {
      /**
       * Set to true to use ScrollView as the container.
       * @default false
       */
      scrollable: T;
      /**
       * Apply safe area padding to top.
       * @default true
       */
      safeAreaTop?: boolean;
      /**
       * Apply safe area padding to bottom.
       * @default true
       */
      safeAreaBottom?: boolean;
      /**
       * Apply safe area padding to left.
       * @default true
       */
      safeAreaLeft?: boolean;
      /**
       * Apply safe area padding to right.
       * @default true
       */
      safeAreaRight?: boolean;
    };

export const ScreenContainer = <T extends boolean>({
  scrollable,
  safeAreaTop = true,
  safeAreaBottom = true,
  safeAreaLeft = true,
  safeAreaRight = true,
  children,
  ...rest
}: ScreenContainerProps<T>) => {
  const insets = useSafeAreaInsets();

  const styleWithSafeArea = {
    paddingTop: safeAreaTop ? insets.top : 0,
    paddingBottom: safeAreaBottom ? insets.bottom : 0,
    paddingLeft: safeAreaLeft ? insets.left : 0,
    paddingRight: safeAreaRight ? insets.right : 0,
  };

  if (scrollable) {
    return (
      <ScreenScrollViewFrame
        contentContainerStyle={styleWithSafeArea}
        {...rest}
      >
        {children}
      </ScreenScrollViewFrame>
    );
  }

  return (
    <ScreenContainerFrame style={styleWithSafeArea} {...rest}>
      {children}
    </ScreenContainerFrame>
  );
};
