import { ArrowLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, XStack, YStack, styled } from "tamagui";
import type { GetProps, TamaguiElement } from "tamagui";

import { Text } from "../Text/Text";

const HeaderFrame = styled(XStack, {
  name: "Header",
  jc: "space-between",
  ai: "center",
  backgroundColor: "$background1", // 테마 배경색
  px: "$md",
  py: "$sm",

  variants: {
    transparent: {
      true: {
        backgroundColor: "transparent",
      },
    },
    borderBottom: {
      true: {
        borderBottomWidth: 1,
        borderBottomColor: "$border1", // 테마 경계선 색
      },
    },
  } as const,
});

type HeaderFrameProps = GetProps<typeof HeaderFrame>;

export type HeaderProps = HeaderFrameProps & {
  title?: string;
  /** Rendered on the left side, e.g., a back button. If true, shows default back button. */
  leftAction?: React.ReactNode | boolean;
  /** Rendered on the right side, e.g., action icons. */
  rightAction?: React.ReactNode;
  /** Custom title component. */
  titleComponent?: React.ReactNode;
  /** Apply safe area padding to top. */
  safeAreaTop?: boolean;
};

/**
 * 화면 상단에 표시되는 헤더 컴포넌트입니다.
 * 제목, 좌측 액션(기본 뒤로가기 버튼 또는 커스텀), 우측 액션을 포함할 수 있습니다.
 */
export const Header = React.forwardRef<TamaguiElement, HeaderProps>(
  (
    {
      title,
      leftAction,
      rightAction,
      titleComponent,
      safeAreaTop = false,
      ...rest
    },
    ref
  ) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const defaultLeftAction = (
      <Button
        icon={<ArrowLeft size={24} color="$text1" />}
        onPress={() => router.canGoBack() && router.back()}
        chromeless
        circular
        size="$3" // 아이콘 버튼 크기 조정
      />
    );

    const resolvedLeftAction =
      leftAction === true ? defaultLeftAction : leftAction ? leftAction : null;

    return (
      <HeaderFrame
        ref={ref}
        paddingTop={safeAreaTop ? insets.top : undefined}
        {...rest}
      >
        <XStack ai="center" jc="center" miw={40} h={40}>
          {/* miw, h를 주어 좌우 공간 확보 및 높이 일치 */}
          {resolvedLeftAction}
        </XStack>

        <YStack f={1} ai="center" jc="center">
          {titleComponent ? (
            titleComponent
          ) : title ? (
            <Text
              type="h4"
              numberOfLines={1}
              ellipsizeMode="tail"
              textAlign="center"
            >
              {title}
            </Text>
          ) : null}
        </YStack>

        <XStack ai="center" jc="center" miw={40} h={40}>
          {/* miw, h를 주어 좌우 공간 확보 및 높이 일치 */}
          {rightAction}
        </XStack>
      </HeaderFrame>
    );
  }
);

Header.displayName = "Header";
