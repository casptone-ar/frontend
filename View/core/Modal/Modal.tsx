import { X } from "@tamagui/lucide-icons";
import React from "react";
import { Pressable, Modal as RNModal, StyleSheet } from "react-native";
import type { ModalProps as RNModalProps } from "react-native";
import { Button, YStack, styled } from "tamagui";
import type { GetProps, TamaguiElement } from "tamagui";
import { Card } from "../Card/Card"; // 코어 Card 컴포넌트 사용

const ModalOverlay = styled(YStack, {
  name: "ModalOverlay",
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.5)", // 반투명 배경
});

// Card 컴포넌트를 모달 컨텐츠의 기본 프레임으로 사용하거나,
// YStack을 직접 styled하여 사용. 여기서는 Card를 활용.
const ModalContentFrame = styled(Card, {
  name: "ModalContentFrame",
  minWidth: "80%", // 모달 최소 너비
  maxWidth: "90%", // 모달 최대 너비
  maxHeight: "80%", // 모달 최대 높이
  padding: "$lg", // 카드 패딩보다 더 크게 줄 수도 있음
  variants: {
    size: {
      sm: {
        minWidth: "60%",
        maxWidth: "70%",
      },
      md: {
        minWidth: "80%",
        maxWidth: "85%",
      },
      lg: {
        minWidth: "90%",
        maxWidth: "95%",
      },
    },
  } as const,
});

const CloseButtonContainer = styled(YStack, {
  name: "CloseButtonContainer",
  position: "absolute",
  top: "$sm",
  right: "$sm",
  zIndex: 1, // 다른 컨텐츠 위에 오도록
});

export type ModalProps = Omit<RNModalProps, "children" | "visible"> & {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Props for the main content YStack container */
  contentProps?: GetProps<typeof ModalContentFrame>;
  /** Hide the default close button */
  hideCloseButton?: boolean;
  /** Variant for modal content size */
  size?: "sm" | "md" | "lg";
};

/**
 * 화면 중앙에 표시되는 기본 모달 컴포넌트입니다.
 * React Native의 Modal을 기반으로 하며, 컨텐츠 영역은 Tamagui로 스타일링됩니다.
 */
export const Modal = React.forwardRef<TamaguiElement, ModalProps>( // RNModal은 ref를 직접 지원하지 않을 수 있음
  (
    {
      visible,
      onClose,
      children,
      contentProps,
      hideCloseButton = false,
      size = "md", // 기본 md 사이즈
      animationType = "fade",
      transparent = true,
      ...rest
    },
    ref // 이 ref는 ModalContentFrame에 전달하는 것을 고려해볼 수 있음
  ) => {
    // RNModal의 onRequestClose는 Android 뒤로가기 버튼 처리를 위해 필요
    const handleRequestClose = () => {
      if (onClose) {
        onClose();
      }
    };

    return (
      <RNModal
        visible={visible}
        onRequestClose={handleRequestClose}
        animationType={animationType}
        transparent={transparent}
        {...rest}
      >
        <ModalOverlay
          onPress={onClose} // 이렇게 하면 내부 컨텐츠 클릭도 닫힐 수 있으므로 주의
          style={StyleSheet.absoluteFillObject}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <ModalContentFrame
            ref={ref}
            size={size}
            {...contentProps}
            // 오버레이 클릭 전파 방지
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {!hideCloseButton && (
              <CloseButtonContainer>
                <Button
                  unstyled
                  circular
                  icon={<X size={20} color="$text3" />}
                  onPress={onClose}
                  size="$3"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                />
              </CloseButtonContainer>
            )}
            {children}
          </ModalContentFrame>
        </ModalOverlay>
      </RNModal>
    );
  }
);

Modal.displayName = "Modal";
