import { useAuthStore } from "@/service/lib/Auth/store";
import { getAuth, signInAnonymously } from "@react-native-firebase/auth";
import { useEffect } from "react";

/**
 * 인증 관리 훅
 */
export const useAutoSignIn = () => {
  const AuthStore = useAuthStore();

  useEffect(() => {
    const signIn = async () => {
      console.log("signIn");
      const auth = getAuth();
      const signInResult = await signInAnonymously(auth);

      if (!signInResult.user) {
        console.log("signInResult.user is null");
        return;
      }

      AuthStore.setUser(signInResult.user);
      AuthStore.setIsAuthenticated(true);
    };

    if (process.env.EXPO_PUBLIC_USE_AUTH) {
      signIn();
    }
  }, []);
};
