import { LocalStorage } from "@raycast/api";
import defaultPreferences from "./default-preferences.json";
import { getBibleData } from "./utilities";

export async function getPreferenceValue<T extends LocalStorage.Value>(id: string): Promise<T | undefined> {
  return LocalStorage.getItem(id);
}

export async function setPreferenceValue<T extends LocalStorage.Value>(id: string, newValue: T): Promise<void> {
  return LocalStorage.setItem(id, newValue);
}

export async function getPreferredLanguage(): Promise<string> {
  return (await getPreferenceValue<string>("yvs-language")) || defaultPreferences.language;
}

export async function setPreferredLanguage(newLanguageId: string): Promise<void> {
  await setPreferenceValue<string>("yvs-language", newLanguageId);
  // When the language changes, the version must also change to the default
  // version; that logic is baked into getPreferredVersion(), so we can simply
  // persist the latest return value of that function
  return setPreferenceValue<number>("yvs-version", await getPreferredVersion());
}

export async function getPreferredVersion(): Promise<number> {
  const preferredLanguageId = await getPreferredLanguage();
  const bible = await getBibleData(preferredLanguageId);
  const preferredVersionId = await getPreferenceValue<number>("yvs-version");
  return bible.versions.find((version) => version.id === preferredVersionId)?.id || bible.default_version;
}

export async function setPreferredVersion(newVersionId: number): Promise<void> {
  return setPreferenceValue<number>("yvs-version", newVersionId);
}

export async function getPreferredReferenceFormat(): Promise<string> {
  return (await getPreferenceValue<string>("yvs-refformat")) || defaultPreferences.refformat;
}
