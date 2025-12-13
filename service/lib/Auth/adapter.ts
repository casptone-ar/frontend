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
    console.warn("signInAnounymously is disabled (Firebase not in use)");
    return null;
  }
}

/**
 * Auth 서비스 인스턴스
 */
export const AuthService = AuthServiceAdapter.getInstance();
