import { useState } from "react";

/** @TODO 구현 필요 */
export const useCheckAllRequiredPermissionGranted = () => {
  /** @TODO 구현 필요 */
  const [isAllRequiredPermissionGranted, setIsAllRequiredPermissionGranted] =
    useState(true);

  return {
    isAllRequiredPermissionGranted,
    setIsAllRequiredPermissionGranted,
  };
};
