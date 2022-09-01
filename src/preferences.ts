import { LocalStorage } from "@raycast/api";

export async function getPreferenceValue<T extends LocalStorage.Value>(id: string): Promise<T | undefined> {
  return LocalStorage.getItem(id);
}

export async function getPreferredLanguage(): Promise<string> {
  return (await getPreferenceValue<string>("yvs-language")) || "eng";
}

export async function getPreferredVersion(): Promise<number> {
  return (await getPreferenceValue<number>("yvs-version")) || 111;
}
