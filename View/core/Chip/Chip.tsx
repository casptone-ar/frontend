import { X } from "@tamagui/lucide-icons";
import React from "react";
import { Button, SizableText, XStack, styled } from "tamagui";
import type {
  ColorTokens,
  GetProps,
  SizeTokens,
  TamaguiElement,
} from "tamagui";

const ChipFrame = styled(XStack, {
  name: "Chip",
  ai: "center",
  borderRadius: "$circular", // 완전 둥근 형태
  paddingVertical: "$xs",
  paddingHorizontal: "$sm", // 텍스트 길이에 따라 유동적
  gap: "$xs",

  variants: {
    size: {
      sm: {
        paddingVertical: "$xxs",
        paddingHorizontal: "$xs",
        gap: "$xxs",
        // SizableText size: '$1' or '$2'
      },
      md: {
        // 기본값
        paddingVertical: "$xs",
        paddingHorizontal: "$sm",
        gap: "$xs",
        // SizableText size: '$2' or '$3'
      },
    },
    variantStyle: {
      // 기존 variant 이름을 variantStyle로 변경하여 color와 구분
      filled: {
        // 기본값, 아래 themeColor에 따라 backgroundColor와 color가 결정됨
      },
      outlined: {
        borderWidth: 1,
        // borderColor는 themeColor에 따라 결정
        // color는 themeColor에 따라 결정
      },
    },
    themeColor: {
      // 색상 테마 variant 추가
      default: {
        // variantStyle이 'filled'일 때의 기본값 (이전 secondary1 사용)
        backgroundColor: "$secondary1" as ColorTokens,
        color: "$color1" as ColorTokens, // 밝은 텍스트 (filled)
        borderColor: "$secondary1" as ColorTokens, // (outlined)
      },
      primary: {
        // Tamagui의 $accent1 (보라색 계열)
        backgroundColor: "$accent1" as ColorTokens,
        color: "$color1" as ColorTokens,
        borderColor: "$accent1" as ColorTokens,
      },
      secondary: {
        // Tamagui의 $secondary1 (주황색 계열) - default와 동일하게 설정됨
        backgroundColor: "$secondary1" as ColorTokens,
        color: "$color1" as ColorTokens,
        borderColor: "$secondary1" as ColorTokens,
      },
      tertiary: {
        // Tamagui의 $tertiary1 (녹색 계열 - 현재 테마 기준)
        backgroundColor: "$tertiary1" as ColorTokens,
        color: "$color1" as ColorTokens, // 또는 $text1 (어두운 배경의 경우)
        borderColor: "$tertiary1" as ColorTokens,
      },
      success: {
        backgroundColor: "$success" as ColorTokens,
        color: "$color1" as ColorTokens,
        borderColor: "$success" as ColorTokens,
      },
      warning: {
        backgroundColor: "$warning" as ColorTokens,
        color: "$text1" as ColorTokens, // 주황색 배경에는 어두운 텍스트가 나을 수 있음
        borderColor: "$warning" as ColorTokens,
      },
      error: {
        backgroundColor: "$error" as ColorTokens,
        color: "$color1" as ColorTokens,
        borderColor: "$error" as ColorTokens,
      },
      info: {
        backgroundColor: "$info" as ColorTokens,
        color: "$color1" as ColorTokens,
        borderColor: "$info" as ColorTokens,
      },
      // 회색 계열 추가
      gray: {
        backgroundColor: "$background3" as ColorTokens, // 또는 $color5
        color: "$text2" as ColorTokens,
        borderColor: "$color7" as ColorTokens,
      },
    } satisfies Record<
      string,
      {
        backgroundColor: ColorTokens;
        color: ColorTokens;
        borderColor: ColorTokens;
      }
    >,

    // active/selected 상태 variant 추가 가능
    // removable 상태 (X 아이콘 표시) variant 추가 가능
  } as const,

  // 여러 variant 조합 시 스타일 적용 우선순위 및 병합 방식 고려 필요
  // 여기서는 variantStyle과 themeColor를 조합하여 최종 스타일 결정
  // 예: variantStyle='filled' && themeColor='primary' => backgroundColor: '$accent1', color: '$color1'
  //     variantStyle='outlined' && themeColor='primary' => backgroundColor: 'transparent', borderColor: '$accent1', color: '$accent1'

  defaultVariants: {
    size: "md",
    variantStyle: "filled",
    themeColor: "default", // 기본 색상 테마
  },
});

const ChipText = styled(SizableText, {
  name: "ChipText",
  // ChipFrame의 color variant에 따라 자동으로 상속되거나, 여기서 명시적으로 설정
  // color: 'inherit', // Tamagui에서 지원하는지 확인 필요
  variants: {
    // ChipFrame의 size variant에 맞춰 텍스트 크기 조절
    size: {
      sm: { fontSize: "$1" }, // bodyFont.size 1 (11pt)
      md: { fontSize: "$2" }, // bodyFont.size 2 (13pt)
    },
  } as const,
  defaultVariants: {
    size: "md",
  },
});

export type ChipProps = Omit<GetProps<typeof ChipFrame>, "color"> & {
  text?: string;
  onRemove?: () => void;
  /** 아이콘과 같은 좌측 요소 */
  leftElement?: React.ReactNode;
  // variantStyle, themeColor는 ChipFrame의 variants에서 가져옴
};

/**
 * 작은 정보 조각을 표시하는 칩(태그) 컴포넌트입니다.
 */
export const Chip = React.forwardRef<TamaguiElement, ChipProps>(
  (
    {
      text,
      onRemove,
      leftElement,
      children,
      variantStyle = "filled",
      themeColor = "default",
      size = "md",
      ...rest
    },
    ref
  ) => {
    let finalBackgroundColor: ColorTokens | "transparent" | undefined;
    let finalTextColor: ColorTokens | undefined;
    let finalBorderColor: ColorTokens | undefined;

    const themeColorVariants = ChipFrame.staticConfig.variants
      ?.themeColor as Record<
      string,
      {
        backgroundColor: ColorTokens;
        color: ColorTokens;
        borderColor: ColorTokens;
      }
    >;

    const colorProps = themeColorVariants?.[themeColor];

    if (colorProps) {
      if (variantStyle === "filled") {
        finalBackgroundColor = colorProps.backgroundColor;
        finalTextColor = colorProps.color;
      } else if (variantStyle === "outlined") {
        finalBackgroundColor = "transparent";
        finalBorderColor = colorProps.borderColor || colorProps.backgroundColor;
        finalTextColor = colorProps.borderColor || colorProps.backgroundColor;
      }
    }

    return (
      <ChipFrame
        ref={ref}
        variantStyle={variantStyle}
        themeColor={themeColor}
        backgroundColor={finalBackgroundColor}
        borderColor={finalBorderColor}
        size={size}
        {...rest}
      >
        {leftElement}
        {text && (
          <ChipText size={size} color={finalTextColor}>
            {text}
          </ChipText>
        )}
        {children}
        {onRemove && (
          <Button
            unstyled
            circular
            icon={<X size={12} color={finalTextColor} />}
            onPress={onRemove}
            padding="$xxs"
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            size={"$1" as SizeTokens}
          />
        )}
      </ChipFrame>
    );
  }
);

Chip.displayName = "Chip";
