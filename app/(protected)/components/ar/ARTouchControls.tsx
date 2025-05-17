import type { PetAnimationType } from "@/domain/pet/types";
import { ChevronLeft, RotateCcw } from "@tamagui/lucide-icons"; // 아이콘 예시
import { Button, ScrollView, Text, XStack, YStack } from "tamagui";

type ARTouchControlsProps = {
  availableAnimations: PetAnimationType[];
  currentAnimation: PetAnimationType;
  onTriggerAnimation: (animation: PetAnimationType) => void;
  onExitAR?: () => void;
  onPetInteract?: () => void; // 예: 쓰다듬기, 먹이주기 등 특정 상호작용
};

/**
 * AR 화면에서 사용자가 애완동물의 애니메이션을 변경하거나
 * 다른 상호작용을 할 수 있는 컨트롤 버튼들을 제공하는 컴포넌트입니다.
 * 화면 하단이나 측면에 오버레이 형태로 표시될 수 있습니다.
 *
 * @param {ARTouchControlsProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
export const ARTouchControls = ({
  availableAnimations,
  currentAnimation,
  onTriggerAnimation,
  onExitAR,
  onPetInteract,
}: ARTouchControlsProps) => {
  return (
    <YStack
      position="absolute"
      bottom="$0"
      left="$0"
      right="$0"
      padding="$3"
      space="$3"
      backgroundColor="$backgroundTransparent" // 반투명 배경으로 AR 뷰가 보이도록
    >
      {/* 애니메이션 선택 컨트롤 */}
      {availableAnimations.length > 0 && (
        <YStack space="$2">
          <Text fontSize="$2" color="$color11" pl="$1">
            애니메이션
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack space="$2" alignItems="center">
              {availableAnimations.map((anim) => (
                <Button
                  key={anim}
                  size="$3"
                  onPress={() => onTriggerAnimation(anim)}
                  theme={currentAnimation === anim ? "base" : undefined}
                  backgroundColor={
                    currentAnimation === anim ? "$accent9" : "$background"
                  }
                  borderColor={
                    currentAnimation === anim ? "$accent7" : "$borderColor"
                  }
                  borderWidth={1}
                  circular // 원형 버튼
                  // icon={anim === 'walk' ? <Power /> : undefined} // 각 애니메이션에 맞는 아이콘 추가 가능
                >
                  {anim}
                </Button>
              ))}
            </XStack>
          </ScrollView>
        </YStack>
      )}

      {/* 기타 상호작용 버튼들 */}
      <XStack justifyContent="space-between" alignItems="center" mt="$2">
        {onExitAR && (
          <Button
            icon={ChevronLeft}
            onPress={onExitAR}
            aria-label="AR 나가기"
            chromeless
            size="$5"
          >
            나가기
          </Button>
        )}

        {onPetInteract && (
          <Button
            onPress={onPetInteract}
            theme="base"
            size="$4"
            iconAfter={<RotateCcw />} // 아이콘 예시
          >
            상호작용
          </Button>
        )}
      </XStack>
    </YStack>
  );
};
