import { Text } from "@/View/core/Text/Text";
import React from "react";
import {
  AnimatePresence,
  type StackProps,
  type TabLayout,
  Tabs,
  type TabsTabProps,
  YStack,
} from "tamagui";

// TabsRovingIndicator and AnimatedYStack can be part of this file or imported if they are more generic
const TabsRovingIndicator = ({
  active,
  ...props
}: { active?: boolean } & StackProps) => {
  return (
    <YStack
      position="absolute"
      backgroundColor="transparent"
      opacity={0.8}
      animation="medium"
      enterStyle={{
        opacity: 0,
      }}
      exitStyle={{
        opacity: 0,
      }}
      {...(active && {
        backgroundColor: "$accent1",
        opacity: 1,
      })}
      {...props}
    />
  );
};

type TabItem = {
  value: string;
  label: string;
};

type SegmentedTabsProps = {
  tabs: TabItem[];
  currentTab: string;
  onTabChange: (value: string) => void;
  size?: TamaguiComponentProps<typeof Tabs>["size"];
  activationMode?: TamaguiComponentProps<typeof Tabs>["activationMode"];
  orientation?: TamaguiComponentProps<typeof Tabs>["orientation"];
  // Add other Tabs props as needed
};

/**
 * SegmentedControl과 유사한 UI를 제공하는 Tabs 컴포넌트 래퍼입니다.
 * Tamagui Tabs의 'background' 스타일 예제를 기반으로 합니다.
 *
 * @see https://tamagui.dev/docs/components/tabs - TabsAdvancedBackground 예제 참고
 */
export const SegmentedTabs = ({
  tabs,
  currentTab,
  onTabChange,
  size = "$4",
  activationMode = "manual",
  orientation = "horizontal",
}: SegmentedTabsProps) => {
  const [tabState, setTabState] = React.useState<{
    activeAt: TabLayout | null;
    intentAt: TabLayout | null;
  }>({
    activeAt: null,
    intentAt: null,
  });

  const setIntentIndicator = (intentAt: TabLayout | null) =>
    setTabState({ ...tabState, intentAt });
  const setActiveIndicator = (activeAt: TabLayout | null) =>
    setTabState({ ...tabState, activeAt });

  const handleOnInteraction: TabsTabProps["onInteraction"] = (type, layout) => {
    if (type === "select") {
      setActiveIndicator(layout);
    } else {
      setIntentIndicator(layout);
    }
  };

  return (
    <Tabs
      value={currentTab}
      onValueChange={onTabChange}
      orientation={orientation}
      size={30}
      w={"100%"}
      h={56}
      activationMode={activationMode}
      backgroundColor="color1"
      borderRadius="$xl"
      borderColor="$color3"
      position="relative"
      padding="$2"
    >
      <YStack flex={1}>
        <AnimatePresence>
          {tabState.intentAt && (
            <TabsRovingIndicator
              borderRadius="$circular"
              width={tabState.intentAt.width}
              height={tabState.intentAt.height}
              x={tabState.intentAt.x}
              y={tabState.intentAt.y}
              zIndex={100}
            />
          )}
        </AnimatePresence>
        <AnimatePresence exitBeforeEnter>
          {tabState.activeAt && (
            <TabsRovingIndicator
              theme="base"
              borderRadius="$circular"
              backgroundColor="$color3"
              width={tabState.activeAt.width}
              height={tabState.activeAt.height}
              x={tabState.activeAt.x}
              y={tabState.activeAt.y}
              zIndex={100}
            />
          )}
        </AnimatePresence>
        <Tabs.List
          flex={1}
          disablePassBorderRadius
          loop={false}
          gap="$2"
          // backgroundColor="$background3"
          borderRadius="$xxl"
          padding="$2"
        >
          {tabs.map((tab) => {
            const isActive = currentTab === tab.value;

            return (
              <Tabs.Tab
                unstyled
                key={tab.value}
                value={tab.value}
                onInteraction={handleOnInteraction}
                paddingVertical="$2"
                paddingHorizontal="$3"
                flex={1}
                flexShrink={0}
                ai="center"
                jc="center"
                bg="transparent"
              >
                <Text
                  type="body"
                  fow="$semibold"
                  color={isActive ? "$accent1" : "$text3"}
                >
                  {tab.label}
                </Text>
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </YStack>
      {/* Content area is usually handled by the parent screen based on currentTab */}
    </Tabs>
  );
};

// Helper type for Tamagui component props if not readily available
type TamaguiComponentProps<T> = T extends React.ComponentType<infer P>
  ? P
  : never;
