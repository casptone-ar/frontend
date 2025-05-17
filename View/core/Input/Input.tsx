import { Eye, EyeOff } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import {
  Button,
  Input as TamaguiInput,
  XStack,
  YStack,
  isWeb,
  styled,
} from "tamagui";
import type { ColorTokens, GetProps } from "tamagui";
import { Text } from "../Text/Text"; // 코어 Text 컴포넌트 사용

const InputFrame = styled(TamaguiInput, {
  name: "Input",
  borderColor: "$border1",
  color: "$text1", // 입력 텍스트 색상
  placeholderTextColor: "$text4", // placeholder 색상
  height: "$size.6", // 기본 높이 (44px)

  // 웹에서만 outline 스타일 적용 (접근성 고려)
  ...(isWeb && {
    focusStyle: {
      outlineColor: "$accent1",
      outlineWidth: 2,
      outlineStyle: "solid",
      borderColor: "$accent1", // 웹에서도 포커스 시 테두리 색상 변경
    },
  }),

  variants: {
    variant: {
      filled: {
        backgroundColor: "$background3",
        borderWidth: 0, // filled variant는 테두리 없음
      },
      outlined: {
        backgroundColor: "$background1",
        borderWidth: 1, // outlined variant는 테두리 있음
        borderColor: "$border1",
      },
    },

    size: {
      // Tamagui Input의 size prop을 활용하거나 여기서 재정의
      sm: {
        fontFamily: "$body",
        height: "$size.5",
        fontSize: "$4",
      },
      md: {
        // 기본값
        fontFamily: "$body",
        height: "$size.6",
        fontSize: "$5",
      },
      lg: {
        fontFamily: "$body",
        height: "$size.7",
        fontSize: "$6",
      },
    },
    error: {
      true: {
        borderColor: "$error",
        ...(isWeb
          ? {
              focusStyle: {
                outlineColor: "$error",
                borderColor: "$error",
              },
            }
          : {
              focusStyle: {
                borderColor: "$error",
                borderWidth: 1.5, // 모바일에서는 테두리 두께로 강조
              },
            }),
      },
    },
    // 좌/우 아이콘 유무에 따른 패딩 조정 variant 추가 가능
    hasLeftIcon: {
      true: {
        // InputFrame 자체의 패딩으로 아이콘 공간 확보 (XStack 패딩과 별개)
        // paddingLeft: '$10', // 예시: $size.4 (아이콘) + $2 (간격)
      },
    },
    hasRightIcon: {
      true: {
        // paddingRight: '$10',
      },
    },
  } as const,

  defaultVariants: {
    size: "md",
    variant: "filled", // 기본 variant를 filled로 명시
  },
});

// GetProps<typeof InputFrame>을 확장하여 InputFrame에 적용될 수 있는 모든 props를 포함
export type InputProps = GetProps<typeof InputFrame> & {
  label?: string;
  errorMessage?: string;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  containerProps?: GetProps<typeof YStack>;
  secureTextEntryToggle?: boolean;
  // variant와 size는 InputFrame의 variants에서 오므로 GetProps<typeof InputFrame>에 이미 포함됨
};

// 스타일 판별 및 아이콘 래핑을 위한 내부 헬퍼
const renderIcon = (
  iconNode: React.ReactElement | undefined,
  defaultColor: ColorTokens = "$text3",
  size?: number
) => {
  if (!iconNode) return null;
  // 아이콘에 기본 색상 및 크기 적용 (이미 color, size prop이 있다면 그것을 우선)
  return React.cloneElement(iconNode, {
    color: iconNode.props.color || defaultColor,
    size: iconNode.props.size || size || 20, // 기본 아이콘 크기
  });
};

/**
 * 레이블, 아이콘, 에러 메시지 등을 지원하는 텍스트 입력 필드 컴포넌트입니다.
 */
export const Input = React.forwardRef<TamaguiInput, InputProps>(
  (
    {
      label,
      errorMessage,
      leftIcon,
      rightIcon,
      containerProps,
      secureTextEntry: initialSecureTextEntry,
      secureTextEntryToggle,
      variant = "filled", // InputFrame의 defaultVariants를 따르지만, 명시적 prop으로 오버라이드 가능
      size: inputSize = "md", // InputFrame의 defaultVariants를 따르지만, 명시적 prop으로 오버라이드 가능
      // InputFrame에 전달될 나머지 props (GetProps<typeof InputFrame>에서 옴)
      ...inputFrameSpecificProps
    },
    ref
  ) => {
    const [isSecureEntry, setIsSecureEntry] = useState(
      initialSecureTextEntry ?? secureTextEntryToggle
    );
    const hasError = !!errorMessage;

    const toggleSecureEntry = () => {
      setIsSecureEntry((prev) => !prev);
    };

    const themedLeftIcon = renderIcon(leftIcon, "$text3");
    let themedRightIcon = renderIcon(rightIcon, "$text3");

    if (secureTextEntryToggle) {
      themedRightIcon = (
        <Button
          unstyled
          icon={
            isSecureEntry ? (
              <EyeOff color="$text3" size={20} />
            ) : (
              <Eye color="$text3" size={20} />
            )
          }
          onPress={toggleSecureEntry}
          focusStyle={{ backgroundColor: "transparent" }}
          pressStyle={{ backgroundColor: "transparent", opacity: 0.7 }}
          paddingHorizontal="$2" // 아이콘 버튼 영역 확보
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // 터치 영역 확장
        />
      );
    }

    const getInputBorderColor = () => {
      if (hasError) return "$error";
      if (variant === "outlined") return "$border1";
      return "transparent"; // filled의 경우 기본적으로 테두리 없음
    };

    const getInputFocusStyle = () => {
      if (isWeb) {
        // 웹에서는 outline으로 처리되므로 XStack focusStyle 불필요
        return {
          borderColor: hasError
            ? "$error"
            : variant === "outlined"
            ? "$accent1"
            : "transparent",
        };
      }
      return {
        borderColor: hasError ? "$error" : "$accent1",
        borderWidth: 1.5, // 모바일에서 포커스 시 테두리 두께
      };
    };

    const getBackgroundColor = () => {
      if (variant === "filled") return "$background3";
      if (variant === "outlined") return "$background1";
      return "$background1";
    };

    // `inputFrameSpecificProps`에서 variant와 size를 명시적으로 InputFrame에 전달
    // `error` prop도 InputFrame에 전달
    const finalInputFrameProps = {
      ...inputFrameSpecificProps,
      variant,
      size: inputSize,
      error: hasError,
      secureTextEntry: isSecureEntry,
    };

    return (
      <YStack gap="$xs" {...containerProps}>
        {label && (
          <Text
            type="body"
            fontFamily="$body"
            colorVariant="secondary"
            fontWeight="$medium"
            // @ts-ignore // Tamagui의 Label 컴포넌트와 htmlFor 연동 고려
            htmlFor={inputFrameSpecificProps.id} // 웹 접근성을 위해 id와 htmlFor 연결
          >
            {label}
          </Text>
        )}
        <XStack
          ai="center"
          gap={themedLeftIcon || themedRightIcon ? "$2" : 0} // 아이콘 유무에 따른 gap
          borderRadius={inputSize === "sm" ? "$sm" : "$md"}
          borderWidth={variant === "outlined" ? 1 : 0}
          borderColor={getInputBorderColor()}
          focusStyle={getInputFocusStyle()}
          overflow="hidden"
          backgroundColor={getBackgroundColor()}
          px={inputSize === "sm" ? "$2" : "$6"}
        >
          {themedLeftIcon}
          <InputFrame
            ref={ref}
            f={1}
            // paddingLeft/Right는 아이콘 유무에 따라 여기서 직접 제어
            {...finalInputFrameProps} // 계산된 최종 props 전달
            borderWidth={0}
            focusStyle={{
              bw: 0,
            }}
          />
          {themedRightIcon}
        </XStack>
        {errorMessage && (
          <Text type="caption" color="$error" pt="$xs">
            {errorMessage}
          </Text>
        )}
      </YStack>
    );
  }
);

Input.displayName = "Input";
