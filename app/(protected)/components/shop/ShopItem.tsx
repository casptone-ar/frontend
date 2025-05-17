import { Text, View } from "react-native";

/**
 * 개별 상점 아이템 정보를 표시하고 구매 기능을 제공하는 컴포넌트입니다.
 */
// type ShopItemProps = {
//   item: ShopItemData; // TODO: ShopItemData 타입 정의
// };

export default function ShopItem(/*{ item }: ShopItemProps*/) {
  return (
    <View>
      <Text>ShopItem Component</Text>
      {/* <Image source={{ uri: item.imageUrl }} style={{ width: 50, height: 50 }} />
      <Text>{item.name} - {item.price} Coins</Text>
      <Button title="Buy" onPress={() => {}} /> */}
    </View>
  );
}
