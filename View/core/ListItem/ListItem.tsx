import { ChevronRight } from "@tamagui/lucide-icons";
import React from "react";
import { Paragraph, SizableText, XStack, YStack, styled } from "tamagui";
import type { GetProps, TamaguiElement } from "tamagui";

const ListItemFrame = styled(XStack, {
  name: "ListItem",
  ai: "center",
  p: "$md",
  backgroundColor: "$background2", // 또는 transparent, Card 내부에서 사용될 경우 고려

  variants: {
    pressable: {
      true: {
        // TODO: hoverStyle, pressStyle을 Tamagui의 Pressable과 유사하게 적용
        // 아래는 예시이며, 실제로는 Pressable 컴포넌트를 wrapping하거나 스타일을 동적으로 적용해야 함
        // Pressable 컴포넌트를 직접 사용하는 것이 더 나을 수 있음
        // onPressIn: { backgroundColor: '$background3' },
        // onPressOut: { backgroundColor: '$background2' },
        cursor: "pointer",
      },
    },
    borderBottom: {
      true: {
        borderBottomWidth: 1,
        borderBottomColor: "$border1",
      },
    },
    size: {
      sm: { p: "$sm", gap: "$sm" },
      md: { p: "$md", gap: "$md" },
      lg: { p: "$lg", gap: "$lg" },
    },
  } as const,
  defaultVariants: {
    size: "md",
  },
});

const ListItemContent = styled(YStack, {
  name: "ListItemContent",
  f: 1,
  gap: "$xs", // 주 텍스트와 보조 텍스트 사이 간격
});

const ListItemTitle = styled(SizableText, {
  name: "ListItemTitle",
  color: "$text1",
  variants: {
    size: {
      // SizableText의 size prop을 그대로 사용하거나, 여기서 재정의
      sm: { size: "$4" }, // bodyFont.size 4 (16pt) 정도
      md: { size: "$5" }, // bodyFont.size 5 (17pt) 정도
      lg: { size: "$6" }, // bodyFont.size 6 (20pt) 정도
    },
  } as const,
  defaultVariants: {
    size: "md",
  },
});

const ListItemSubtitle = styled(Paragraph, {
  name: "ListItemSubtitle",
  color: "$text3", // 옅은 텍스트 색

  variants: {
    size: {
      // Paragraph의 size prop을 그대로 사용하거나, 여기서 재정의
      sm: { size: "$2" }, // bodyFont.size 2 (13pt) 정도
      md: { size: "$3" }, // bodyFont.size 3 (15pt) 정도
      lg: { size: "$4" }, // bodyFont.size 4 (16pt) 정도
    },
  } as const,
  defaultVariants: {
    size: "md",
  },
});

const ListItemLeftContainer = styled(XStack, {
  name: "ListItemLeftContainer",
  ai: "center",
  jc: "center",
  // pr: '$md', // ListItemFrame의 gap으로 대체 가능
});

const ListItemRightContainer = styled(XStack, {
  name: "ListItemRightContainer",
  ai: "center",
  jc: "center",
  // pl: '$md', // ListItemFrame의 gap으로 대체 가능
});

type ListItemFrameProps = GetProps<typeof ListItemFrame>;
type ListItemTitleProps = GetProps<typeof ListItemTitle>;
type ListItemSubtitleProps = GetProps<typeof ListItemSubtitle>;

export type ListItemProps = ListItemFrameProps & {
  title?: React.ReactNode;
  titleProps?: ListItemTitleProps;
  subtitle?: React.ReactNode;
  subtitleProps?: ListItemSubtitleProps;
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** If true, shows a ChevronRight icon as the right action. Overrides `right` prop if set. */
  showDisclosureArrow?: boolean;
  onPress?: () => void; // pressable variant와 연동
};

/**
 * 리스트의 개별 항목을 표시하는 컴포넌트입니다.
 * 좌측 요소, 제목, 부제목, 우측 요소 (기본 disclosure arrow 포함) 등을 포함할 수 있습니다.
 */
export const ListItem = React.forwardRef<TamaguiElement, ListItemProps>(
  (
    {
      title,
      titleProps,
      subtitle,
      subtitleProps,
      left,
      right,
      showDisclosureArrow,
      onPress,
      ...rest
    },
    ref
  ) => {
    const resolvedRightAction = showDisclosureArrow ? (
      <ChevronRight color="$text4" />
    ) : (
      right
    );

    const pressableProps = onPress ? { pressable: true, onPress } : {};

    return (
      <ListItemFrame ref={ref} {...pressableProps} {...rest}>
        {left && <ListItemLeftContainer>{left}</ListItemLeftContainer>}
        <ListItemContent>
          {typeof title === "string" ? (
            <ListItemTitle {...titleProps}>{title}</ListItemTitle>
          ) : (
            title
          )}
          {typeof subtitle === "string" ? (
            <ListItemSubtitle {...subtitleProps}>{subtitle}</ListItemSubtitle>
          ) : (
            subtitle
          )}
        </ListItemContent>
        {resolvedRightAction && (
          <ListItemRightContainer>{resolvedRightAction}</ListItemRightContainer>
        )}
      </ListItemFrame>
    );
  }
);

ListItem.displayName = "ListItem";
