/**
 * Auth 서비스 어댑터
 */

import { getAuth } from "@react-native-firebase/auth";
import { InitializationSingleTon } from "../shared";
import serviceMediator from "../shared";
/**
 * Auth 서비스 클래스
 */
export class AuthServiceAdapter extends InitializationSingleTon<AuthServiceAdapter> {
  constructor() {
    super();

    serviceMediator.registerServiceForInitialization(this);
  }

  async signInAnounymously() {
    try {
      const signInResult = await getAuth().signInAnonymously();
      return signInResult;
    } catch (e: unknown) {
      console.error(e);
    }
  }
}

/**
 * Auth 서비스 인스턴스
 */
export const AuthService = AuthServiceAdapter.getInstance();
