// app/(protected)/components/collection/PetDetailView.tsx

import type { CollectedPet } from "@/domain/collection/types";
import { Image } from "react-native";
import { H3, Paragraph, XStack, YStack } from "tamagui";

type PetDetailViewProps = {
  pet: CollectedPet;
};

export const PetDetailView = ({ pet }: PetDetailViewProps) => {
  const ascendedDateText = pet.ascendedAt
    ? pet.ascendedAt.slice(0, 10)
    : undefined;

  return (
    <YStack space="$3">
      <XStack space="$3" ai="center">
        {pet.thumbnailUrl ? (
          <Image
            source={{ uri: pet.thumbnailUrl }}
            style={{
              width: 96,
              height: 96,
              borderRadius: 999,
            }}
          />
        ) : (
          <YStack
            width={96}
            height={96}
            borderRadius={999}
            jc="center"
            ai="center"
            bg="$color5"
          >
            <Paragraph fontSize={32} fontWeight="700">
              {pet.name?.[0] ?? "?"}
            </Paragraph>
          </YStack>
        )}

        <YStack flex={1} space="$1">
          <H3>{pet.name}</H3>
          {ascendedDateText && (
            <Paragraph color="$color10">
              {ascendedDateText}에 승천한 애완동물
            </Paragraph>
          )}
          {typeof pet.finalLevel === "number" && pet.finalLevel > 0 && (
            <Paragraph color="$color11">
              최종 레벨: {pet.finalLevel} 레벨
            </Paragraph>
          )}
        </YStack>
      </XStack>

      {pet.description && (
        <Paragraph color="$color11">{pet.description}</Paragraph>
      )}
    </YStack>
  );
};

PetDetailView.displayName = "PetDetailView";
