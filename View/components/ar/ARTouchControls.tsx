// View/components/ar/ARTouchControls.tsx
import type { PetAnimationType } from "@/domain/pet/types";
import { ChevronLeft, RotateCcw } from "@tamagui/lucide-icons";
import { Button, ScrollView, Text, XStack, YStack } from "tamagui";

type ARTouchControlsProps = {
  availableAnimations: PetAnimationType[];
  currentAnimation: PetAnimationType;
  onTriggerAnimation: (animation: PetAnimationType) => void;
  onExitAR?: () => void;
  onPetInteract?: () => void;
};

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
      backgroundColor="$backgroundTransparent"
    >
      {Array.isArray(availableAnimations) && availableAnimations.length > 0 && (
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
                >
                  {anim}
                </Button>
              ))}
            </XStack>
          </ScrollView>
        </YStack>
      )}

      <XStack justifyContent="space-between" alignItems="center" mt="$2">
        {onExitAR && (
          <Button icon={ChevronLeft} onPress={onExitAR} size="$5">
            나가기
          </Button>
        )}

        {onPetInteract && (
          <Button onPress={onPetInteract} size="$4" iconAfter={<RotateCcw />}>
            상호작용
          </Button>
        )}
      </XStack>
    </YStack>
  );
};
