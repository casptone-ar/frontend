import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  Camera,
  Home,
  ListChecks,
  PawPrint,
  Store,
} from "@tamagui/lucide-icons";
import type React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { Button, YStack } from "tamagui";

const NavFrame = styled(XStack, {
  name: "BottomNavigationBar",
  jc: "space-around",
  ai: "center",
  backgroundColor: "$background2", // 테마 배경색 (일반 배경보다 약간 다를 수 있음)
  borderTopWidth: 1,
  borderTopColor: "$border1", // 테마 경계선 색
  minHeight: "$size.6", // 토큰 사용

  variants: {
    floating: {
      true: {
        marginHorizontal: "$md",
        marginBottom: "$md", // safeAreaBottom과 함께 사용 시 조정 필요
        borderRadius: "$lg",
        shadowColor: "$accent2",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderTopWidth: 0, // floating 시 상단 경계선 제거
      },
    },
  } as const,
});

type NavFrameProps = GetProps<typeof NavFrame>;

export type BottomNavigationBarProps = NavFrameProps & {
  /** Apply safe area padding to bottom. */
  safeAreaBottom?: boolean;
  children?: React.ReactNode;
};

/**
 * @description 앱의 하단 탭 네비게이션 바입니다.
 * 가운데 AR 버튼이 강조된 디자인입니다.
 * @param {BottomTabBarProps} props - expo-router의 Tabs 컴포넌트에서 전달하는 props
 */
export const BottomNavigationBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const { bottom } = useSafeAreaInsets(); // 하단 안전 영역 높이

  // 탭 정보 정의 (아이콘, 라벨, 경로)
  // app/(protected)/_layout.tsx의 Tabs.Screen 순서와 name을 기반으로 함
  const tabsConfig = [
    { name: "home", label: "홈", Icon: Home },
    { name: "missions", label: "미션", Icon: ListChecks },
    { name: "ar", label: "AR", Icon: Camera, isCenter: true }, // 가운데 AR 버튼
    { name: "shop", label: "상점", Icon: Store },
    { name: "collection", label: "동물농장", Icon: PawPrint },
  ];

  return (
    <XStack
      jc="space-around"
      ai="flex-end" // 중앙 버튼이 위로 돌출되도록
      backgroundColor="$background1" // 테마 배경색
      borderTopWidth={1}
      borderTopColor="$border1" // 테마 경계선 색상
      paddingBottom={bottom} // 하단 안전 영역 적용
      position="relative" // AR 버튼의 absolute 포지셔닝 기준
      height={80} // 기본 높이 + 안전 영역
      borderTopLeftRadius={"$xl"}
      borderTopRightRadius={"$xl"}
    >
      {state.routes.map((route, index) => {
        const tabInfo = tabsConfig.find((t) => t.name === route.name);

        if (!tabInfo) return null;

        const { label: tabConfigLabel, Icon, isCenter } = tabInfo;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const iconColor = isFocused ? "$accent1" : "$color9";
        const labelColor = isFocused ? "$accent1" : "$color9";

        if (isCenter) {
          // 가운데 AR 버튼 스타일
          return (
            <YStack
              key={route.key}
              ai="center"
              position="absolute" // 중앙에 위치시키기 위해
              left="50%"
              bottom={bottom + 15} // 하단 여백 위로 살짝 올림 (bottom + padding + 추가값)
              x={"-50%"} // 정확히 중앙 정렬
              zIndex={1} // 다른 탭 위에 오도록
              pressStyle={{ scale: 0.9, backgroundColor: "$accent2" }}
            >
              <Button
                circular
                size="$6" // 다른 아이콘보다 크게
                backgroundColor="$accent1" // 강조색
                onPress={onPress}
                onLongPress={onLongPress}
              >
                <Icon color="$color1" />
              </Button>
              {/* AR 탭은 라벨을 버튼 아래에 작게 표시하거나 생략 가능 */}
              {/* <Text fontSize="$1" color={labelColor} mt="$xxs">{label}</Text> */}
            </YStack>
          );
        }

        // 일반 탭 아이템
        return (
          <Button
            key={route.key}
            flex={1} // 공간 균등 배분
            onPress={onPress}
            onLongPress={onLongPress}
            icon={
              <YStack ai="center" gap="$xxs" p="$xs">
                <Icon color={iconColor} size={24} strokeWidth={2} />
              </YStack>
            }
            gap="$xs" // 아이콘과 라벨 사이 간격
          />
        );
      })}
    </XStack>
  );
};

BottomNavigationBar.displayName = "BottomNavigationBar";
