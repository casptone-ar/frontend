import type { CollectedPet } from "@/domain/collection/types";
import { FlatList } from "react-native";
import { YStack } from "tamagui";
import { CollectedPetCard } from "./CollectedPetCard";

type CollectedPetGridProps = {
  pets: CollectedPet[];
  onSelectPet: (pet: CollectedPet) => void;
};

/**
 * 컬렉션 메인 화면에서 승천한 애완동물 목록을 그리드 형태로 보여주는 컴포넌트입니다.
 *
 * @param {CollectedPetGridProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
export const CollectedPetGrid = ({
  pets,
  onSelectPet,
}: CollectedPetGridProps) => {
  return (
    <FlatList
      data={pets}
      renderItem={({ item }) => (
        <YStack p="$2" width="50%">
          {/* YStack으로 감싸서 padding을 주고, Card에 onPress 직접 전달 */}
          <CollectedPetCard pet={item} onPress={() => onSelectPet(item)} />
        </YStack>
      )}
      keyExtractor={(item) => item.id}
      numColumns={2} // 2열 그리드
      contentContainerStyle={{ paddingHorizontal: 8 }} // Tamagui의 $ XStack padding과 유사하게
    />
  );
};
