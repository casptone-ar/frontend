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
      backgroundColor="$color5"
      opacity={0.7}
      animation="medium"
      enterStyle={{
        opacity: 0,
      }}
      exitStyle={{
        opacity: 0,
      }}
      {...(active && {
        backgroundColor: "$accent5", // Use a theme variable or a specific color
        opacity: 1, // Active indicator more visible
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
      backgroundColor="$backgroundTransparent" // More like a segmented control
      borderRadius="$md" // More rounded
      position="relative"
      padding="$1" // Padding around the list
    >
      <YStack flex={1}>
        <AnimatePresence>
          {tabState.intentAt && (
            <TabsRovingIndicator
              borderRadius="$5" // Slightly less than parent for inset feel
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
              theme="base" // Use a theme like 'active' or 'accent'
              backgroundColor="$accent1"
              borderRadius="$lg"
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
          gap="$1.5" // Gap between tabs
          backgroundColor="$background2"
          padding="$2" // Padding inside the list if indicator is inset
        >
          {tabs.map((tab) => (
            <Tabs.Tab
              unstyled // Use unstyled and apply custom styling
              key={tab.value}
              value={tab.value}
              onInteraction={handleOnInteraction}
              paddingVertical="$2" // Adjust padding as needed
              paddingHorizontal="$3"
              flex={1} // Flex to take equal width
              flexShrink={0}
              ai="center"
              jc="center"
              bg={"transparent"}
            >
              <Text type="body" fow={"$semibold"}>
                {tab.label}
              </Text>
            </Tabs.Tab>
          ))}
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
