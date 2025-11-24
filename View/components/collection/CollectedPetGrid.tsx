// app/(protected)/components/collection/CollectedPetGrid.tsx

import type { CollectedPet } from "@/domain/collection/types";
import { FlatList, Image, Pressable } from "react-native";
import { Paragraph, YStack } from "tamagui";

type CollectedPetGridProps = {
  pets: CollectedPet[];
  onSelectPet: (pet: CollectedPet) => void;
};

export const CollectedPetGrid = ({
  pets,
  onSelectPet,
}: CollectedPetGridProps) => {
  // ascendedAt 기준으로 최근 승천 순으로 정렬 (선택 사항)
  const sortedPets = [...pets].sort((a, b) =>
    (b.ascendedAt ?? "").localeCompare(a.ascendedAt ?? "")
  );

  return (
    <FlatList
      data={sortedPets}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ paddingHorizontal: 16 }}
      contentContainerStyle={{ paddingVertical: 16, gap: 16 }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onSelectPet(item)}
          style={{ flex: 1, marginHorizontal: 4 }}
        >
          <YStack
            bg="$background"
            borderRadius="$4"
            p="$3"
            ai="center"
            space="$2"
            borderWidth={1}
            borderColor="$color5"
          >
            {item.thumbnailUrl ? (
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 999,
                  marginBottom: 4,
                }}
              />
            ) : (
              <YStack
                width={80}
                height={80}
                borderRadius={999}
                jc="center"
                ai="center"
                bg="$color5"
                mb="$1"
              >
                <Paragraph color="$color11" fontWeight="700">
                  {item.name?.[0] ?? "?"}
                </Paragraph>
              </YStack>
            )}

            <Paragraph fontWeight="700" numberOfLines={1}>
              {item.name}
            </Paragraph>

            {item.ascendedAt && (
              <Paragraph color="$color10" fontSize={12}>
                {item.ascendedAt.slice(0, 10)} 승천
              </Paragraph>
            )}
          </YStack>
        </Pressable>
      )}
    />
  );
};

CollectedPetGrid.displayName = "CollectedPetGrid";
