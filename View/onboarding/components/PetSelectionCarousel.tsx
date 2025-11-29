import type { PetOption } from "@/domain/pet/types";
import { FlatList, Pressable } from "react-native";
import { Text } from "tamagui";

/**
 * @typedef PetOption
 * @property {string} id - 애완동물 고유 ID (예: 'cat_01', 'dog_01')
 * @property {string} name - 애완동물 이름 (예: '씩씩한 고양이', '명랑한 강아지')
 * @property {string} description - 간단한 설명
 * @property {string} [modelPreviewUrl] - 3D 모델 미리보기 URL 또는 로컬 에셋 경로
 * @property {string} imagePreviewUrl - 2D 이미지 미리보기 URL 또는 로컬 에셋 경로
 * @property {Record<string, any>} [initialStats] - 초기 스탯 (필요하다면)
 */

/**
 * @typedef PetSelectionCarouselProps
 * @property {PetOption[]} petOptions - 선택 가능한 애완동물 옵션 목록입니다.
 * @property {(selectedPet: PetOption) => void} onPetSelect - 사용자가 애완동물을 선택했을 때 호출되는 콜백 함수입니다.
 * @property {string | null | undefined} selectedPetId - 현재 선택된 애완동물의 ID입니다. UI 강조 표시에 사용됩니다.
 */

/**
 * 사용자가 선택할 수 있는 애완동물 종류를 보여주는 캐러셀(또는 리스트) 컴포넌트입니다.
 *
 * @param {PetSelectionCarouselProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 *
 * @example
 * const petOptions = [
 *   { id: '1', name: '냥냥이', description: '귀여운 고양이', imagePreviewUrl: '...' },
 *   { id: '2', name: '멍뭉이', description: '용감한 강아지', imagePreviewUrl: '...' },
 * ];
 * const [selectedId, setSelectedId] = useState(null);
 * <PetSelectionCarousel
 *   petOptions={petOptions}
 *   selectedPetId={selectedId}
 *   onPetSelect={(pet) => setSelectedId(pet.id)}
 * />
 */

type PetSelectionCarouselProps = {
  petOptions: PetOption[];
  onPetSelect: (pet: PetOption) => void;
  selectedPetId: string | null;
};

export const PetSelectionCarousel = ({
  petOptions,
  onPetSelect,
  selectedPetId,
}: PetSelectionCarouselProps) => {
  // TODO: 캐러셀 또는 선택 가능한 리스트 UI 구현
  // 예시: FlatList 사용
  return (
    <FlatList
      data={petOptions}
      horizontal // 캐러셀 형태를 위한 예시
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPetSelect(item)}
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: selectedPetId === item.id ? "blue" : "gray",
            margin: 5,
          }}
        >
          {/* <Image source={{ uri: item.imagePreviewUrl }} style={{ width: 100, height: 100 }} /> */}
          <Text>{item.name}</Text>
          <Text>{item.description}</Text>
        </Pressable>
      )}
    />
  );
};

PetSelectionCarousel.displayName = "PetSelectionCarousel";
