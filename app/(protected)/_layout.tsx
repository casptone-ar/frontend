import { BottomNavigationBar } from "@/View/core/BottomNavigationBar/BottomNavigationBar";
import { Tabs } from "expo-router";

/**
 * 보호된 라우트 레이아웃 컴포넌트
 */
export default function ProtectedLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavigationBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "홈",
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: "미션",
        }}
      />
      <Tabs.Screen
        name="ar"
        options={{
          title: "AR",
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "상점",
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "동물농장",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
