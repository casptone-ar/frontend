import { ActivityIndicator } from "react-native"; // 또는 Tamagui Button
import { Button, View } from "tamagui";

/**
 * @typedef ConfirmSelectionButtonProps
 * @property {() => void} onPress - 버튼 클릭 시 호출될 함수입니다. 애완동물 선택 확정 로직을 트리거합니다.
 * @property {boolean} [disabled] - 버튼 비활성화 여부입니다. 애완동물이 선택되지 않았을 경우 true로 설정될 수 있습니다.
 * @property {boolean} [isLoading] - 선택 확정 로직 처리 중 로딩 상태 여부입니다. true일 경우 로딩 인디케이터를 표시할 수 있습니다.
 */

/**
 * 애완동물 선택을 확정하는 버튼 컴포넌트입니다.
 *
 * @param {ConfirmSelectionButtonProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 *
 * @example
 * <ConfirmSelectionButton
 *   onPress={handleConfirm}
 *   disabled={!selectedPet}
 *   isLoading={isConfirming}
 * />
 */

type ConfirmSelectionButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export const ConfirmSelectionButton = ({
  onPress,
  disabled,
  isLoading,
}: ConfirmSelectionButtonProps) => {
  return (
    <View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button onPress={onPress} disabled={disabled}>
          이 애완동물로 시작하기
        </Button>
      )}
    </View>
  );
};

ConfirmSelectionButton.displayName = "ConfirmSelectionButton";
