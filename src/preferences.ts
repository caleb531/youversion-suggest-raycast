import { LocalStorage } from "@raycast/api";
import { getBibleData } from "./utilities";

export async function getPreferenceValue<T extends LocalStorage.Value>(id: string): Promise<T | undefined> {
  return LocalStorage.getItem(id);
}

export async function setPreferenceValue<T extends LocalStorage.Value>(id: string, newValue: T): Promise<void> {
  return LocalStorage.setItem(id, newValue);
}

export async function getPreferredLanguage(): Promise<string> {
  return (await getPreferenceValue<string>("yvs-language")) || "eng";
}

export async function setPreferredLanguage(newLanguageId: string): Promise<void> {
  await setPreferenceValue<string>("yvs-language", newLanguageId);
  const bible = await getBibleData(newLanguageId);
  return setPreferenceValue<number>("yvs-version", bible.default_version);
}

export async function getPreferredVersion(): Promise<number> {
  return (await getPreferenceValue<number>("yvs-version")) || 111;
}

export async function setPreferredVersion(newVersionId: number): Promise<void> {
  return setPreferenceValue<number>("yvs-version", newVersionId);
}

export async function getPreferredReferenceFormat(): Promise<string> {
  return (await getPreferenceValue<string>("yvs-refformat")) || "{name} ({version})\n\n{content}";
}
