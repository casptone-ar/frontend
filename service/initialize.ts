/**
 * 서비스 초기화
 */

import serviceMediator from "./lib/shared";

/**
 * 모든 서비스를 등록하고 초기화하는 함수
 */
export const initializeServices = async (): Promise<void> => {
  try {
    // 모든 서비스 초기화
    await serviceMediator.initializeServices();

    console.log("All services initialized successfully");
  } catch (error) {
    console.error("Failed to initialize services:", error);

    throw error;
  }
};

export default initializeServices;
