declare module "expo-secure-store" {
  export function getItemAsync(
    key: string,
    options?: any
  ): Promise<string | null>;
  export function setItemAsync(
    key: string,
    value: string,
    options?: any
  ): Promise<void>;
  export function deleteItemAsync(key: string, options?: any): Promise<void>;
  export function isAvailableAsync(): Promise<boolean>;
}
